"use client";

import { useEffect } from "react";

const MAPBOX_CSS_ID = "wayfarer-mapbox-css";
const MAPBOX_CSS_HREF = "https://api.mapbox.com/mapbox-gl-js/v3.20.0/mapbox-gl.css";

export function useMapboxCss(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;
    if (document.getElementById(MAPBOX_CSS_ID)) return;

    const link = document.createElement("link");
    link.id = MAPBOX_CSS_ID;
    link.rel = "stylesheet";
    link.href = MAPBOX_CSS_HREF;
    document.head.appendChild(link);
  }, [enabled]);
}
