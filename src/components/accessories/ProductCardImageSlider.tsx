"use client";

import React, { useState, useEffect } from "react";

interface ProductCardImageSliderProps {
  image: string;
  images?: string[];
  name: string;
  autoSlideInterval?: number;
  priority?: boolean;
}

export default function ProductCardImageSlider({
  image,
  images = [],
  name,
  autoSlideInterval = 2800,
  priority = false
}: ProductCardImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Normalize image list: collect all unique non-empty images
  const imageList = React.useMemo(() => {
    const list: string[] = [];
    if (images && Array.isArray(images) && images.length > 0) {
      images.forEach(img => {
        if (img && typeof img === "string" && img.trim() && !list.includes(img.trim())) {
          list.push(img.trim());
        }
      });
    }
    if (image && typeof image === "string" && image.trim() && !list.includes(image.trim())) {
      list.unshift(image.trim());
    }
    if (list.length === 0) {
      list.push("/shop_accessories.png");
    }
    return list;
  }, [image, images]);

  // Cycle images ONLY when hovered to prevent background performance drain
  useEffect(() => {
    if (imageList.length <= 1 || !isHovered) return;

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      setCurrentIndex((prev) => (prev + 1) % imageList.length);
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [imageList, isHovered, autoSlideInterval]);

  const primarySrc = imageList[0];

  return (
    <div 
      className="relative w-full aspect-square flex items-center justify-center overflow-hidden rounded-xl bg-muted/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentIndex(0);
      }}
      onTouchStart={() => {
        if (imageList.length > 1) {
          setCurrentIndex((prev) => (prev + 1) % imageList.length);
        }
      }}
    >
      {/* Primary & Hover Images */}
      <div className="w-full h-full flex items-center justify-center relative">
        {imageList.map((src, idx) => {
          const isVisible = idx === currentIndex;
          // Only render visible image or primary image to minimize DOM memory footprint
          if (!isVisible && idx !== 0) {
            return null;
          }

          return (
            <img
              key={`${src}-${idx}`}
              src={src}
              alt={`${name} - view ${idx + 1}`}
              loading={priority && idx === 0 ? "eager" : "lazy"}
              decoding="async"
              className={`absolute inset-0 w-full h-full object-contain p-2 rounded-xl transition-all duration-500 ease-in-out ${
                isVisible
                  ? "opacity-100 scale-100 z-10"
                  : "opacity-0 scale-95 z-0 pointer-events-none"
              } ${isHovered && isVisible ? "scale-[1.05]" : ""}`}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/shop_accessories.png";
              }}
            />
          );
        })}
      </div>

      {/* Pagination indicators when hovered or has multiple images */}
      {imageList.length > 1 && (
        <div className={`absolute bottom-2 left-0 right-0 flex justify-center items-center gap-1.5 z-20 pointer-events-none transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-40 sm:opacity-0"}`}>
          {imageList.map((_, idx) => (
            <span
              key={idx}
              className={`h-1 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "w-3 bg-emerald-500 shadow-sm"
                  : "w-1 bg-black/40 dark:bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
