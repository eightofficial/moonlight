"use client";

import Image from "next/image";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getProductPrice } from "@/lib/productPricing";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15, // delay between each card
    },
  },
};

const cardVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function Card({ product }) {
  return (
    <div>
      <motion.div
        className="pl-grid"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={containerVariants}
      >
        {product?.map((p) => (
          <motion.div
            key={p?.slug || p?.name}
            variants={cardVariants}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Link
              href={`/home/machines/${p.slug}`}
              className="pl-card block text-inherit no-underline"
              aria-label={`View ${p.name}`}
            >
              <div className="pl-image-wrap">
                {p.tag && (
                  <span
                    className={`pl-tag ${p?.tag === "Low stock" ? "low" : ""}`}
                  >
                    {p?.tag}
                  </span>
                )}
                <Image
                  width={500}
                  height={500}
                  alt={p?.name}
                  className="pl-image"
                  src={p?.images?.[0]}
                  loading="lazy"
                />
              </div>
              <div className="pl-info">
                <div className="text-md font-bold text-gray-700">
                  {p?.name}
                </div>
                <div className="text-lg font-bold">
                  ₹{getProductPrice(p?.pricing).toLocaleString("en-IN")}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}