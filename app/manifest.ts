import type { MetadataRoute } from "next";

/** Installable to the home screen — most people arrive on a phone. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Book Music",
    short_name: "Book Music",
    description: "Every book has a soundtrack.",
    start_url: "/",
    display: "standalone",
    background_color: "#F4F1EA",
    theme_color: "#F4F1EA",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
