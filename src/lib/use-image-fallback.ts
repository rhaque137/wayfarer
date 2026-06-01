"use client";

import { useEffect } from "react";
import { PLACEHOLDER_IMAGE } from "@/lib/destination-images";

export function useImageFallback(selector = "[data-destination-image]") {
  useEffect(() => {
    const id = window.setTimeout(() => {
      document.querySelectorAll<HTMLImageElement>(selector).forEach((img) => {
        if (img.complete && img.naturalWidth === 0) {
          img.src = PLACEHOLDER_IMAGE.url;
        }
      });
    }, 1200);

    return () => window.clearTimeout(id);
  }, [selector]);
}
