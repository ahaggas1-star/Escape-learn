import type { MetadataRoute } from "next";

// بيان PWA (قرار #12: Web/PWA).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "قِيَم — منصة القيم الأسرية",
    short_name: "قِيَم",
    description: "منصة أسرية تحوّل القيم التربوية إلى أهداف ومهام عملية مع تلعيب آمن.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f7fb",
    theme_color: "#4d3d60",
    dir: "rtl",
    lang: "ar",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
