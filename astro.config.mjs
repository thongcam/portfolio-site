import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";

import sitemap from "@astrojs/sitemap";

import react from "@astrojs/react";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [sitemap(), react()],
  output: "server",

  adapter: netlify({
    edgeMiddleware: true,
  }),

  site: "https://thong.cam",

  image: {
    domains: ["astro.build", "thong.cam", "admin.thong.cam","localhost:3000"],
    remotePatterns: [{ protocol: process.env.NODE_ENV === "development" ? "http" : "https" }],
    layout: "constrained",
    breakpoints: [400, 750, 1024, 1668, 2048, 2560],
  },

  prefetch: {
    defaultStrategy: "viewport",
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
