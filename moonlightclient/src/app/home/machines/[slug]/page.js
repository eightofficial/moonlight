import Mview from "@/component/machine/Mview";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.moonlightmachinery.com";

function getProductImageUrls(images = []) {
  return images
    .filter((image) => typeof image === "string" && image.trim())
    .map((image) => new URL(image.trim(), SITE_URL).toString());
}

// Centralized helper using absolute URL for server-side fetching
async function getProduct(slug) {
  if (!slug) {
    return null;
  }
  // fsdfsdfsd

  try {
    const res = await fetch(`${SITE_URL}/api/home/product?slug=${slug}`, {
      method: "POST",
      cache: "no-store", // Ensures fresh product data on request
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data?.item?.[0] || data?.[0] || null;
  } catch (error) {
    console.error("Server-side getProduct error:", error);
    return null;
  }
}

// Dynamic SEO Metadata Generator
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const product = await getProduct(slug);

  if (!product) {
    return { title: "Product | Moonlight Machinery" };
  }

  const url = `${SITE_URL}/home/machines/${slug}`;
  const title = product.pageTitle?.trim() || product.name;
  const description =
    product.metaDescription?.trim() ||
    (product.description
      ? product.description.trim().slice(0, 155)
      : `Buy ${product.name} at best price from Moonlight Machinery.`);
  const imageUrls = getProductImageUrls(product.images);
  const socialImages = imageUrls.length
    ? imageUrls.map((imageUrl) => ({ url: imageUrl, alt: product.name }))
    : undefined;

  return {
    title,
    description,
    keywords: product.metaKeywords,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: "Moonlight Machinery",
      images: socialImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: socialImages?.map(({ url: imageUrl }) => imageUrl),
    },
  };
}

// Main Page Server Component
export default async function Page({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const product = await getProduct(slug);

  const url = `${SITE_URL}/home/machines/${slug}`;

  // Structured Data (JSON-LD)
  const jsonLd = product
    ? {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Product",
          "@id": `${url}#product`,
          name: product.name,
          image: getProductImageUrls(product.images),
          description: product.description || "",
          sku: String(product.sku || product.slug).replace(/\s+/g, "-"),
          // brand: { "@type": "Brand", name: "Moonlight Machinery" },
          offers: {
            "@type": "Offer",
            url,
            priceCurrency: "INR",
            price: product.pricing?.basePrice || 0,
            availability:
              (product.stock ?? 0) > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
            hasMerchantReturnPolicy: {
              "@type": "MerchantReturnPolicy",
              applicableCountry: "IN",
              returnPolicyCategory:
                "https://schema.org/MerchantReturnFiniteReturnWindow",
              merchantReturnDays: 7,
              returnMethod: "https://schema.org/ReturnByMail",
              returnFees: "https://schema.org/FreeReturn",
            },
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingRate: {
                "@type": "MonetaryAmount",
                value: "0",
                currency: "INR",
              },
              shippingDestination: {
                "@type": "DefinedRegion",
                addressCountry: "IN",
              },
              deliveryTime: {
                "@type": "ShippingDeliveryTime",
                handlingTime: {
                  "@type": "QuantitativeValue",
                  minValue: 0,
                  maxValue: 1,
                  unitCode: "DAY",
                },
                transitTime: {
                  "@type": "QuantitativeValue",
                  minValue: 3,
                  maxValue: 10,
                  unitCode: "DAY",
                },
              },
            },
          },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            {
              "@type": "ListItem",
              position: 2,
              name: "Machines",
              item: `${SITE_URL}/home/machines`,
            },
            { "@type": "ListItem", position: 3, name: product.name, item: url },
          ],
        },
      ],
    }
    : null;
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <div className="w-full flex justify-center p-2">
        <Mview slug={slug} initialProduct={product} />
      </div>
    </>
  );
}









