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
            staggerChildren: 0.15,
        },
    },
};

const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1 },
};

export default function ChhathPuja({ product }) {
    return (
        <div className="w-full flex justify-center py-2 bg-transparent">
            <motion.div
                className="pl-grid pl-chhath-grid"
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
                            className="pl-chhath-card block text-inherit no-underline relative overflow-hidden rounded-2xl group"
                            aria-label={`View ${p.name}`}
                        >
                            <Image
                                src="/chatPuja-card.png"
                                className="pl-chhath-background object-cover w-full h-full transition-transform duration-300"
                                alt=""
                                aria-hidden="true"
                                fill
                                sizes="(max-width: 640px) 50vw, (max-width: 900px) 33vw, 25vw"
                            />

                            <div className="pl-chhath-overlay absolute inset-0">
                                <div className="pl-chhath-product">
                                    {p?.images?.[0] && (
                                        <Image
                                            src={p.images[0]}
                                            alt={p?.name || "Product"}
                                            width={500}
                                            height={500}
                                            className="object-contain"
                                        />
                                    )}
                                </div>

                                <div className="pl-chhath-info">
                                    <h2>{p?.name}</h2>
                                    <p>₹{getProductPrice(p?.pricing).toLocaleString("en-IN")}</p>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
