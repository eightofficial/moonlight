"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import "./style/mview.scss";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getRelatedItem, getspcItem } from "@/services/home/GetProduct";
import Link from "next/link";
import { ChevronLeft, ChevronRight, PhoneCall, ShoppingCart } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";
import Video from "@/component/home/main/Video";
import QueryModal from "./QueryModal";
import { addToCart } from "@/lib/cart";
import { getProductPrice } from "@/lib/productPricing";

function money(n) {
  return (n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function GallerySkeleton() {
  return (
    <div className="pd-gallery">
      <div className="pd-image-main pd-skel-block" />
      <div className="pd-thumbs">
        {Array.from({ length: 4 }).map((_, i) => (
          <div className="pd-thumb pd-skel-block" key={i} />
        ))}
      </div>
    </div>
  );
}

function InfoSkeleton() {
  return (
    <div className="pd-info">
      <div className="pd-skel-line pd-skel-eyebrow" />
      <div className="pd-skel-line pd-skel-title" />
      <div className="pd-skel-line pd-skel-sku" />
      <div className="pd-skel-line pd-skel-price" />
      <div className="pd-skel-line pd-skel-desc" />
      <div className="pd-skel-line pd-skel-desc short" />
      <div className="pd-skel-block pd-skel-btn" />
    </div>
  );
}

function RelatedSkeleton() {
  return (
    <div className="pd-related">
      {Array.from({ length: 3 }).map((_, i) => (
        <div className="pd-related-card" key={i}>
          <div className="pd-related-image pd-skel-block" />
          <div className="pd-related-info">
            <div className="pd-skel-line pd-skel-line-name" />
            <div className="pd-skel-line pd-skel-line-price" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Mview({ slug, initialProduct }) {
  const [activeImage, setActiveImage] = useState(0);
  const [isQueryOpen, setIsQueryOpen] = useState(false);
  const [cartNotice, setCartNotice] = useState(null);

  const pathname = usePathname();
  const router = useRouter();
  const segments = pathname.split("/").filter((segment) => segment !== "");

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
  };

  const galleryVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  };

  const infoVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        delay: 0.2,
        when: "beforeChildren",
        staggerChildren: 0.08,
      },
    },
  };

  const specsVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["item", slug],
    queryFn: () => getspcItem(slug),
    enabled: !!slug,
    initialData: initialProduct ? [initialProduct] : undefined,
  });
  const product = data?.[0];

  const { data: relatedData, isLoading: isRelatedLoading } = useQuery({
    queryKey: ["relatedItem", product?.machineType],
    queryFn: () => getRelatedItem(product.machineType),
    enabled: !!product?.machineType,
  });

  useEffect(() => {
    setActiveImage(0);
  }, [slug]);

  function handleEnquiry() {
    if (product?.name) {
      window.location.href = `tel:${process.env.NEXT_PUBLIC_BUSINESS_PHONE || "+918178445596"
        }`;
    }
  }

  function handleAddToCart() {
    if (!isInStock) {
      setCartNotice({ message: "This product is currently out of stock.", error: true });
      return;
    }

    try {
      addToCart(product);
      setCartNotice({ message: `${product.name} added to your cart.`, error: false });
    } catch (cartError) {
      console.error("Unable to add product to cart:", cartError);
      setCartNotice({
        message: "This product could not be added to your cart. Please try again.",
        error: true,
      });
    }
  }

  function handleBuyNow() {
    if (!isInStock) {
      setCartNotice({ message: "This product is currently out of stock.", error: true });
      return;
    }

    if (!product.slug) {
      setCartNotice({
        message: "This product cannot be checked out because it has no product link.",
        error: true,
      });
      return;
    }

    router.push(`/home/checkout?product=${encodeURIComponent(product.slug)}`);
  }

  function handleWhatsApp() {
    const businessPhone =
      process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "+918178445596";
    const productDetails = `
*Product Enquiry*

*Name:* ${product?.name}
*SKU:* ${product?.sku}
*Price:* ₹${money(getProductPrice(product?.pricing))}
*Stock Available:* ${product?.stock}

*Description:* ${product?.description}

Please provide more information about this product.
    `.trim();

    const encodedMessage = encodeURIComponent(productDetails);
    const whatsappUrl = `https://wa.me/${businessPhone.replace(
      /[^\d+]/g,
      "",
    )}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  }

  const crumb = (
    <div className="pd-crumb  hidden md:flex">
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        return (
          <div key={href} className="flex gap-2">
            <span>/</span>
            <Link href={href} className="capitalize bold text-gray-500">
              {segment.replace(/-/g, " ")}
            </Link>
          </div>
        );
      })}
    </div>
  );

  if (isLoading) {
    return (
      <div className="pd-root  w-full max-w-[1200px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {crumb}
          <section className="pd-main">
            <GallerySkeleton />
            <InfoSkeleton />
          </section>
          <div className="pd-related-head ">Also in stock</div>
          <RelatedSkeleton />
        </motion.div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pd-root w-full max-w-[1200px]">
        {crumb}
        <motion.div
          className="pd-error "
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          Couldn't load this product
          {error?.message ? ` — ${error.message}` : ""}.
        </motion.div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pd-root py-32 w-full max-w-[1200px]">
        {crumb}
        <motion.div
          className="pd-error "
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          Product not found.
        </motion.div>
      </div>
    );
  }

  const images = product.images || [];
  const isInStock =
    (!product.status || product.status === "active") &&
    Number(product.stock) > 0;

  const hasVideoSlide = !!product.video && !!product.video_link;

  function extractYouTubeId(url) {
    if (!url) return null;
    const patterns = [
      /youtube\.com\/watch\?v=([^&]+)/,
      /youtube\.com\/embed\/([^?&]+)/,
      /youtu\.be\/([^?&]+)/,
      /youtube\.com\/shorts\/([^?&]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  const videoThumb = (() => {
    const id = extractYouTubeId(product.video_link);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  })();

  const mediaItems = [...images];
  if (hasVideoSlide) {
    mediaItems.push({ type: "video", thumb: videoThumb });
  }

  function showPreviousImage() {
    if (!mediaItems.length) return;
    setActiveImage((prevIndex) =>
      prevIndex === 0 ? mediaItems.length - 1 : prevIndex - 1,
    );
  }

  function showNextImage() {
    if (!mediaItems.length) return;
    setActiveImage((prevIndex) =>
      prevIndex === mediaItems.length - 1 ? 0 : prevIndex + 1,
    );
  }

  return (
    <div className="pd-root  w-full max-w-[1200px]">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {crumb}
      </motion.div>

      {/* TOP SECTION: Gallery (Left) & Specifications (Right) */}
      <motion.section
        className="pd-main"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <motion.div className="pd-gallery" variants={galleryVariants}>
          <motion.div className="pd-image-wrapper" variants={imageVariants}>
            <motion.button
              type="button"
              className="pd-image-nav pd-image-nav-prev"
              onClick={showPreviousImage}
              aria-label="Previous image"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft size={24} />
            </motion.button>
            <motion.div
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {mediaItems[activeImage]?.type === "video" ? (
                <div className="pd-video-wrapper">
                  <Video link={product.video_link} />
                </div>
              ) : (
                <Image
                  width={400}
                  height={400}
                  className="pd-image-main"
                  src={mediaItems[activeImage] || mediaItems[0] || images[0]}
                  alt={product.name || "Product image"}
                  priority
                />
              )}
            </motion.div>
            <motion.button
              type="button"
              className="pd-image-nav pd-image-nav-next"
              onClick={showNextImage}
              aria-label="Next image"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight size={24} />
            </motion.button>
          </motion.div>
          <motion.div
            className="pd-thumbs"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {mediaItems.map((item, i) => {
              const isVideoThumb = item?.type === "video";
              return (
                <motion.button
                  key={isVideoThumb ? `video-${i}` : item + i}
                  className={`pd-thumb ${i === activeImage ? "active" : ""} ${isVideoThumb ? "pd-thumb-video" : ""
                    }`}
                  onClick={() => setActiveImage(i)}
                  aria-label={
                    isVideoThumb ? "Show product video" : `Show image ${i + 1}`
                  }
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isVideoThumb ? (
                    <div className="pd-thumb-video-label">Video</div>
                  ) : (
                    <Image
                      src={item}
                      alt={
                        product.name
                          ? `${product.name} thumbnail ${i + 1}`
                          : "Product thumbnail"
                      }
                      width={80}
                      height={80}
                      className="pd-thumb-image"
                    />
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Specifications shifted to the top right side */}
        <motion.div
          className="pd-specs-section p-0"
          variants={infoVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="pd-specs-title mt-0">Specification</div>

          {product.specifications?.productionCapacity && (
            <div className="pd-spec-row">
              <span className="pd-spec-label">Production Capacity</span>
              <span className="pd-spec-value">
                {product.specifications?.productionCapacity}
              </span>
            </div>
          )}
          {product.specifications?.motor && (
            <div className="pd-spec-row">
              <span className="pd-spec-label">Motor</span>
              <span className="pd-spec-value">
                {product.specifications?.motor}
              </span>
            </div>
          )}
          {product.specifications?.totalPower && (
            <div className="pd-spec-row">
              <span className="pd-spec-label">Total Power</span>
              <span className="pd-spec-value">
                {product.specifications?.totalPower}
              </span>
            </div>
          )}
          {product.specifications?.voltage && (
            <div className="pd-spec-row">
              <span className="pd-spec-label">Voltage</span>
              <span className="pd-spec-value">
                {product.specifications?.voltage}
              </span>
            </div>
          )}
          {product.specifications?.phase && (
            <div className="pd-spec-row">
              <span className="pd-spec-label">Phase</span>
              <span className="pd-spec-value">
                {product.specifications?.phase}
              </span>
            </div>
          )}
          {product.specifications?.weight && (
            <div className="pd-spec-row">
              <span className="pd-spec-label">Weight</span>
              <span className="pd-spec-value">
                {product.specifications?.weight}
              </span>
            </div>
          )}
          {product.specifications?.rawMaterial && (
            <div className="pd-spec-row">
              <span className="pd-spec-label">Raw Material</span>
              <span className="pd-spec-value">
                {product.specifications?.rawMaterial}
              </span>
            </div>
          )}
          {product.specifications?.dimensions && (
            <div className="pd-spec-row">
              <span className="pd-spec-label">Dimensions</span>
              <span className="pd-spec-value">
                {product.specifications?.dimensions?.length} x{" "}
                {product.specifications?.dimensions?.width} x{" "}
                {product.specifications?.dimensions?.height}{" "}
                {product.specifications?.dimensions?.unit}
              </span>
            </div>
          )}
          {product.specifications?.plateSizeRange && (
            <div className="pd-spec-row">
              <span className="pd-spec-label">Plate Size Range</span>
              <span className="pd-spec-value">
                {product.specifications?.plateSizeRange}
              </span>
            </div>
          )}
          {product.specifications?.rollerSize && (
            <div className="pd-spec-row">
              <span className="pd-spec-label">Roller Size</span>
              <span className="pd-spec-value">
                {product.specifications?.rollerSize}
              </span>
            </div>
          )}
          {product.specifications?.drive && (
            <div className="pd-spec-row">
              <span className="pd-spec-label">Drive</span>
              <span className="pd-spec-value">
                {product.specifications?.drive}
              </span>
            </div>
          )}
          {product.specifications?.paperCupSizeRange && (
            <div className="pd-spec-row">
              <span className="pd-spec-label">Paper Cup Size Range</span>
              <span className="pd-spec-value">
                {product.specifications?.paperCupSizeRange}
              </span>
            </div>
          )}
          {product.specifications?.electricityBillEstimate && (
            <div className="pd-spec-row">
              <span className="pd-spec-label">Electricity Bill Estimate</span>
              <span className="pd-spec-value">
                {product.specifications?.electricityBillEstimate}
              </span>
            </div>
          )}

          <div className="pd-specs-title">Delivery</div>
          {product.deliveryTime && (
            <div className="pd-spec-row">
              <span className="pd-spec-label">Delivery</span>
              <span className="pd-spec-value">{product.deliveryTime}</span>
            </div>
          )}
          {product.isReturnable !== undefined && (
            <div className="pd-spec-row">
              <span className="pd-spec-label">Returnable</span>
              <span className="pd-spec-value">
                {product.isReturnable ? "Yes" : "No"}
              </span>
            </div>
          )}
          {product.mainMarket && (
            <div className="pd-spec-row">
              <span className="pd-spec-label">Market</span>
              <span className="pd-spec-value">{product.mainMarket}</span>
            </div>
          )}
        </motion.div>
      </motion.section>

      {/* BOTTOM SECTION: Product Details, Pricing, & Action Buttons */}
      <motion.section
        className="pd-info-bottom"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={specsVariants}
      >
        <motion.div
          className="pd-eyebrow"
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span
            className={`pd-dot ${isInStock ? "" : "out-of-stock"}`}
            aria-hidden="true"
          />
          {isInStock ? `In stock — ${product.stock} available` : "Out of stock"}
        </motion.div>

        <motion.h1 className="pd-name" variants={itemVariants}>
          {product.name}
        </motion.h1>
        <motion.div className="pd-sku" variants={itemVariants}>
          SKU {product.sku}
        </motion.div>

        <motion.div className="pd-price" variants={itemVariants}>
          ₹{money(getProductPrice(product.pricing))}
        </motion.div>
        {product.pricing?.otherExpenses > 0 && (
          <motion.div className="pd-delivery-cost" variants={itemVariants}>
            Includes base price ₹{money(product.pricing?.basePrice || 0)} and
            other expenses ₹{money(product.pricing.otherExpenses)}
          </motion.div>
        )}
        <motion.div className="pd-free-delivery" variants={itemVariants}>
          Free delivery across India
        </motion.div>

        <motion.p className="pd-desc" variants={itemVariants}>
          {product.description}
        </motion.p>

        <motion.div className="pd-buy-row grid grid-cols-2 md:grid-cols-4 " variants={itemVariants}>
          <motion.button
            type="button"
            className="pd-add-btn py-2 flex items-center justify-center gap-4"
            onClick={handleEnquiry}
            title="Call us"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PhoneCall width={15} /> Call Now
          </motion.button>
          <motion.button
            type="button"
            className="pd-add-btna py-2 flex items-center justify-center gap-4 bg-green-600"
            onClick={handleWhatsApp}
            title="Send WhatsApp message"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaWhatsapp size={24} /> WhatsApp
          </motion.button>
          <motion.button
            type="button"
            className="bg-amber-400 pd-add-btn  py-2 flex items-center justify-center gap-3"
            onClick={handleAddToCart}
            title="Save product to cart"
            disabled={!isInStock}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ShoppingCart size={18} /> Add to Cart
          </motion.button>
          <motion.button
            type="button"
            className="pd-add-btn py-2 flex items-center justify-center gap-3"
            onClick={handleBuyNow}
            title="Buy now with Cash on Delivery"
            disabled={!isInStock}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Buy Now (COD)
          </motion.button>
        </motion.div>
        {cartNotice && (
          <p
            className={`pd-cart-notice ${cartNotice.error ? "error" : "success"}`}
            role={cartNotice.error ? "alert" : "status"}
          >
            {cartNotice.message}{" "}
            {!cartNotice.error && <Link href="/home/cart">View cart</Link>}
          </p>
        )}
      </motion.section>

      <QueryModal
        isOpen={isQueryOpen}
        onClose={() => setIsQueryOpen(false)}
        product={product}
      />

      <motion.div
        className="pd-related-head"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Also in stock
      </motion.div>
      {isRelatedLoading ? (
        <RelatedSkeleton />
      ) : (
        <motion.div
          className="pd-related"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {relatedData?.map((p) => (
            <motion.div key={p?.name} variants={itemVariants}>
              <Link href={`/home/machines/${p?.slug}`}>
                <motion.div
                  className="pd-related-card"
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {p?.images?.[0] ? (
                    <Image
                      className="pd-related-image"
                      src={p.images[0]}
                      alt={p?.name || "Related product"}
                      width={160}
                      height={120}
                    />
                  ) : (
                    <div className="pd-related-image pd-image-placeholder" />
                  )}
                  <div className="pd-related-info">
                    <div className="text-md">{p?.name.slice(0, 32)}...</div>
                    <div className="text-lg font-bold">
                      ₹{money(getProductPrice(p?.pricing))}
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}