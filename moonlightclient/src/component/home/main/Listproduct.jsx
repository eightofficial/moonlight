"use client";
import "./listproduct.scss";
import Card from "../product/Card";
import { getItem } from "@/services/home/GetProduct";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import DiwaliCard from "../product/DiwaliCard";
import ChhathPuja from "../product/ChhathPuja";

const SKELETON_COUNT = 8;

function SkeletonCard() {
  return (
    <div className="pl-card pl-skeleton-card" aria-hidden="true">
      <div className="pl-image pl-skel-block" />
      <div className="pl-info">
        <div className="pl-skel-line pl-skel-line-name" />
        <div className="pl-skel-line pl-skel-line-name short" />
        <div className="pl-skel-line pl-skel-line-price" />
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="pl-grid" aria-busy="true" aria-label="Loading products">
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export default function ProductShowcase({
  view,
  query: activeQuery = "",
  Subcategory: activeSub = "",
  Pricategory: activePrice = "",
  initialProducts = [],
}) {

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["item", activeQuery, activePrice, activeSub],
    queryFn: () =>
      getItem({
        query: activeQuery,
        pCategory: activePrice,
        sCategory: activeSub,
      }),
    placeholderData: (previousData) => previousData,
    initialData: initialProducts,
  });

  const safeData = data || [];

  return (
    <section className="pl-root  ">
      <div className="pl-inner">
        <div className="pl-head">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="pl-title">In Stock</h2>
          </motion.div>
        </div>

        {isLoading && !safeData.length ? (
          <SkeletonGrid />
        ) : isError ? (
          <div className="pl-empty pl-mono">
            Couldn&apos;t load products{error?.message ? ` — ${error.message}` : ""}.
          </div>
        ) : safeData?.length === 0 ? (
          <div className="pl-empty pl-mono">Nothing stocked here yet.</div>
        ) : (
          <ChhathPuja product={safeData} key={activeQuery || activePrice || "all"} />
        )}
        {view && (
          <div className="pl-footer">
            <button
              className="pl-view-all"
              onClick={() => (window.location.href = "/home/machines")}
            >
              View full catalog
            </button>
          </div>
        )}
      </div>
    </section>
  );
}