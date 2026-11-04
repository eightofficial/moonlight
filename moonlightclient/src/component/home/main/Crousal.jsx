"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import "./crousal.scss";
import { useQuery } from "@tanstack/react-query";
import { slider } from "@/services/home/GetProduct";
import { motion } from "framer-motion";
import { ArrowLeftIcon, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * STOCKROOM — cinematic banner carousel
 * Full-bleed image slides, segmented progress bars instead of dots,
 * autoplay that pauses on hover/focus, keyboard arrows, and touch swipe.
 */

const AUTOPLAY_MS = 5500;

export default function BannerCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(null);
  const trackRef = useRef(null);

  // 1. Fetch data first so it's available for callbacks
  const { data = [], isLoading } = useQuery({
    queryKey: ["itema"],
    queryFn: slider,
  });

  const dataLength = data?.length || 0;

  const goTo = useCallback(
    (i) => {
      if (dataLength === 0) return;
      setIndex(((i % dataLength) + dataLength) % dataLength);
    },
    [dataLength],
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Autoplay
  useEffect(() => {
    if (paused || dataLength === 0) return;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const t = setTimeout(() => goTo(index + 1), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [index, paused, goTo, dataLength]);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }
    const node = trackRef.current;
    node?.addEventListener("keydown", onKey);
    return () => node?.removeEventListener("keydown", onKey);
  }, [next, prev]);

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      delta < 0 ? next() : prev();
    }
    touchStartX.current = null;
  }

  const handelClick = (slug) => {
    window.location.href = "/home/machines/" + slug;
  };

  function LoadingSkeleton() {
    return (
      <motion.div
        className="cb-root cb-skeleton w-full "
        initial={{ opacity: 0.85 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="cb-skeleton-slide" />
        <div className="cb-skeleton-content">
          <div className="cb-skeleton-line cb-skeleton-title" />
          <div className="cb-skeleton-line cb-skeleton-desc" />
          <div className="cb-skeleton-line cb-skeleton-desc short" />
          <div className="cb-skeleton-row">
            <div className="cb-skeleton-pill" />
            <div className="cb-skeleton-button" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!data || dataLength === 0) {
    return (
      <div className="cb-root w-full py-16 text-center text-black">
        No carousel slides available.
      </div>
    );
  }

  return (
    <motion.div
      className={`cb-root ${paused ? "cb-paused" : ""} w-full `}
      ref={trackRef}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured products"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      initial={{ y: 50, opacity: 1 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* <div className="cb-progress-row">
        {data.map((_, i) => (
          <div
            key={i}
            className={`cb-progress-track ${i < index ? "done" : ""} ${i === index ? "active" : ""
              }`}
            onClick={() => goTo(i)}
            role="button"
            aria-label={`Go to slide ${i + 1}`}
          >
            <div className="cb-progress-fill" />
          </div>
        ))}
      </div> */}

      {data.map((s, i) => {
        const slideImage = s.slider_image || s.images?.[0] || "";
        return (
          <div
            className={`cb-slide ${i === index ? "active" : ""}`}
            key={s.id || s.title || i}
            aria-hidden={i !== index}
          >
            <img className="cb-slide-image" src={slideImage} alt={s.name || "Slider image"} />
            <div className="cb-slide-scrim" />
          </div>
        );
      })}

      {/* <div className="cb-content w-full max-w-[1200px]">
        <h2 className="cb-title">{data[index]?.name}</h2>
        <p className="cb-desc">{data[index]?.desc}</p>
        <div className="cb-cta-row">
          <span className="cb-price cb-mono">{data[index]?.price}</span>
          <button
            className="cb-cta-btn py-1 px-2 md:py-4 md:px-8"
            onClick={() => handelClick(data[index]?.slug)}
          >
            {data[index]?.cta || "Buy Now"}
          </button>
        </div>
      </div> */}

      {/* <div className="cb-counter cb-mono flex flex-row-reverse right-[70px] md:right-[250px] items-center justify-center gap-8">
        <button
          className="cb-arrow prev "
          onClick={next}
          aria-label="Previous slide"
        >
          <ChevronLeft size={16} className="rotate-180" />
        </button>
        <button
          className="cb-arrow next"
          onClick={prev}
          aria-label="Next slide"
        >
          <ChevronRight size={16} className="rotate-180"/>
        </button>


 
      </div> */}
    </motion.div>
  );
}
