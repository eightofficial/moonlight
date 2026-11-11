import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import connectDB from "@/db/mongodb/db";
import Product from "@/db/mongodb/product/productModule_fixed";
import { sendCodOrderEmail } from "@/services/admin/mailer";
import { getProductPrice } from "@/lib/productPricing";

function isValidText(value, maxLength) {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= maxLength
  );
}

function indexProductsBySlug(products) {
  const productsBySlug = new Map();
  for (const product of products) {
    if (!productsBySlug.has(product.slug)) {
      productsBySlug.set(product.slug, product);
    }
  }
  return productsBySlug;
}

export async function GET(request) {
  try {
    const slugs = [...new Set(request.nextUrl.searchParams.getAll("slug"))];
    if (
      slugs.length === 0 ||
      slugs.length > 20 ||
      slugs.some((slug) => !slug || slug.length > 160)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid checkout products." },
        { status: 400 },
      );
    }

    await connectDB();
    const products = await Product.find({
      slug: { $in: slugs },
      status: "active",
    })
      .select("name slug sku stock pricing")
      .lean();
    const productsBySlug = indexProductsBySlug(products);

    if (slugs.some((slug) => !productsBySlug.has(slug))) {
      return NextResponse.json(
        { success: false, message: "One or more cart products are no longer available." },
        { status: 409 },
      );
    }

    return NextResponse.json({
      success: true,
      items: slugs.map((slug) => {
        const product = productsBySlug.get(slug);
        return {
          slug: product.slug,
          name: product.name,
          sku: product.sku || "",
          stock: Number(product.stock) || 0,
          unitPrice: getProductPrice(product.pricing),
        };
      }),
    });
  } catch (error) {
    console.error("Unable to load checkout products:", error);
    return NextResponse.json(
      { success: false, message: "Checkout products could not be loaded." },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      address,
      city,
      state,
      postalCode,
      items: requestedItems,
    } = body || {};

    if (
      !isValidText(customerName, 100) ||
      !isValidText(customerPhone, 30) ||
      !isValidText(address, 300) ||
      !isValidText(city, 80) ||
      !isValidText(state, 80) ||
      !/^\d{6}$/.test(String(postalCode || "")) ||
      (customerEmail &&
        (typeof customerEmail !== "string" ||
          customerEmail.length > 254 ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail))) ||
      !/^\+?[\d\s()-]{8,30}$/.test(String(customerPhone || "")) ||
      String(customerPhone).replace(/\D/g, "").length < 8 ||
      String(customerPhone).replace(/\D/g, "").length > 15 ||
      !Array.isArray(requestedItems) ||
      requestedItems.length === 0 ||
      requestedItems.length > 20
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter valid customer, delivery, and cart details.",
        },
        { status: 400 },
      );
    }

    const quantitiesBySlug = new Map();
    for (const item of requestedItems) {
      const slug = typeof item?.slug === "string" ? item.slug.trim() : "";
      const quantity = Number(item?.quantity);
      if (
        !slug ||
        slug.length > 160 ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 100
      ) {
        return NextResponse.json(
          { success: false, message: "Your cart contains an invalid product or quantity." },
          { status: 400 },
        );
      }
      quantitiesBySlug.set(slug, (quantitiesBySlug.get(slug) || 0) + quantity);
    }

    await connectDB();
    const products = await Product.find({
      slug: { $in: [...quantitiesBySlug.keys()] },
      status: "active",
    })
      .select("name slug sku stock pricing")
      .lean();
    const productsBySlug = indexProductsBySlug(products);

    if ([...quantitiesBySlug.keys()].some((slug) => !productsBySlug.has(slug))) {
      return NextResponse.json(
        {
          success: false,
          message: "One or more cart products are no longer available. Please review your cart.",
        },
        { status: 409 },
      );
    }

    const orderItems = [...quantitiesBySlug.keys()].map((slug) => {
      const product = productsBySlug.get(slug);
      const quantity = quantitiesBySlug.get(slug);
      const unitPrice = getProductPrice(product.pricing);

      return {
        name: product.name,
        sku: product.sku || "",
        quantity,
        unitPrice,
        subtotal: unitPrice * quantity,
        stock: Number(product.stock) || 0,
      };
    });

    const outOfStockItem = orderItems.find((item) => item.stock < item.quantity);
    if (outOfStockItem) {
      return NextResponse.json(
        {
          success: false,
          message: `${outOfStockItem.name} does not have enough stock for the requested quantity.`,
        },
        { status: 409 },
      );
    }

    const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const orderNumber = `ML-${randomBytes(6).toString("hex").toUpperCase()}`;

    await sendCodOrderEmail({
      orderNumber,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail?.trim() || "",
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      postalCode: String(postalCode),
      items: orderItems,
      total,
    });

    return NextResponse.json(
      {
        success: true,
        orderNumber,
        message: "Your order was submitted. We will contact you to confirm delivery.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("COD checkout failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "We could not submit your order. Please try again or contact us directly.",
      },
      { status: 500 },
    );
  }
}
