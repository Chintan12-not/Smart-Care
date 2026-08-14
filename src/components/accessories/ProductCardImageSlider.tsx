"use client";

import React, { useState, useEffect } from "react";

interface ProductCardImageSliderProps {
  image: string;
  images?: string[];
  name: string;
  autoSlideInterval?: number;
}

export default function ProductCardImageSlider({
  image,
  images = [],
  name,
  autoSlideInterval = 3000
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

  useEffect(() => {
    if (imageList.length <= 1) return;

    // Cycle through images one by one automatically
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % imageList.length);
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [imageList, autoSlideInterval]);

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Sliding & Fading Product Images */}
      <div className="w-full h-full flex items-center justify-center relative">
        {imageList.map((src, idx) => (
          <img
            key={`${src}-${idx}`}
            src={src}
            alt={`${name} - view ${idx + 1}`}
            className={`absolute inset-0 w-full h-full object-contain p-1 rounded-xl transition-all duration-700 ease-in-out ${
              idx === currentIndex
                ? "opacity-100 scale-100 z-10"
                : "opacity-0 scale-95 z-0 pointer-events-none"
            } ${isHovered && idx === currentIndex ? "scale-[1.06]" : ""}`}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/shop_accessories.png";
            }}
          />
        ))}
      </div>

      {/* Pagination indicators when product has multiple images */}
      {imageList.length > 1 && (
        <div className="absolute bottom-1.5 left-0 right-0 flex justify-center items-center gap-1 z-20 pointer-events-none">
          {imageList.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "w-4 bg-emerald-500 shadow-sm"
                  : "w-1.5 bg-black/30 dark:bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
