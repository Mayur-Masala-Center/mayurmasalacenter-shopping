"use client";

import { useState } from "react";
import Image from "next/image";
import { Product } from "@/lib/types";
import { useCart } from "./CartContext";
import { useLightbox } from "./LightboxContext";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { open } = useLightbox();

  const allPhotos = [product.image_url, ...(product.image_urls || [])].filter(
    (u): u is string => Boolean(u)
  );
  const [activePhoto, setActivePhoto] = useState(0);
  const currentImage = allPhotos[activePhoto] || null;

  const hasDiscount = product.mrp != null && product.mrp > product.price;

  return (
    <div className="group bg-white/70 border border-turmeric-300/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex flex-col">
      <div className="relative aspect-square bg-turmeric-50">
        {currentImage ? (
          <>
            <button
              type="button"
              onClick={() => open({ src: currentImage, alt: product.name })}
              className="absolute inset-0 w-full h-full cursor-zoom-in"
              aria-label={`View larger image of ${product.name}`}
            >
              <Image
                src={currentImage}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </button>
            <span
              aria-hidden
              className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-tamarind-900/60 text-cream text-sm flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
            >
              🔍
            </span>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🌶️</div>
        )}
      </div>

      {allPhotos.length > 1 && (
        <div className="flex gap-1.5 px-3 pt-2">
          {allPhotos.map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActivePhoto(idx)}
              className={`relative w-9 h-9 rounded-md overflow-hidden border shrink-0 ${
                idx === activePhoto ? "border-vermillion-500" : "border-tamarind-900/10"
              }`}
              aria-label={`Show photo ${idx + 1}`}
            >
              <Image src={url} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-tamarind-900 leading-snug">{product.name}</h3>
        {product.description && (
          <p className="text-xs text-tamarind-800/70 mt-1 line-clamp-2">{product.description}</p>
        )}
        {product.sizes && product.sizes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {product.sizes.map((size) => (
              <span
                key={size}
                className="text-[11px] font-medium text-tamarind-800/70 bg-turmeric-50 border border-turmeric-300/40 rounded-full px-2 py-0.5"
              >
                {size}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="flex items-baseline gap-1.5">
            {hasDiscount && (
              <span className="text-xs text-tamarind-800/40 line-through">₹{product.mrp}</span>
            )}
            <span className="font-display text-lg text-vermillion-500">₹{product.price}</span>
          </span>
          <button
            onClick={() => addItem(product)}
            className="text-xs font-semibold bg-vermillion-500 hover:bg-vermillion-400 text-cream px-3 py-2 rounded-full transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
