"use client";

import Image from "next/image";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

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

export default function DiwaliCard({ product }) {
  return (
    <div className="w-full flex justify-center py-2">
      <motion.div
        className="pl-grid pl-diwali-grid"
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
              className="pl-diwali-card block text-inherit no-underline relative overflow-hidden rounded-xl shadow-md group"
              aria-label={`View ${p.name}`}
            >
              <Image
                src="/diwali-card-img.png"
                className="pl-diwali-background object-cover w-full h-full transition-transform duration-300"
                alt={`Monsoon machinery Diwali Offer for ${p.name}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 900px) 33vw, 25vw"
              />

              <div className="pl-diwali-overlay absolute inset-0 bg-black/40 flex flex-col items-center text-white">
                <div className="pl-diwali-top w-full flex items-center justify-between">
                  <div className="pl-diwali-logo bg-white rounded-full">
                    <Image
                      src="/logo.png"
                      alt="Moonlight Machinery"
                      width={500}
                      height={500}
                    />
                  </div>
                  <div className="pl-diwali-offer flex items-center bg-orange-800 rounded-full">
                    <span>Diwali Offer</span>
                    <Image
                      src="/diya.png"
                      width={100}
                      height={100}
                      alt=""
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <div className="pl-diwali-product-image w-full flex items-center justify-center">
                  <Image
                    src={p?.images?.[0]}
                    alt=""
                    width={500}
                    height={500}
                    className="object-contain"
                  />
                </div>

                <div className="pl-diwali-copy w-full text-center">
                  <h2>{p?.name}</h2>
                  <p>Just ₹{p?.pricing?.basePrice}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}