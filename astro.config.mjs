import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
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
    domains: ["astro.build", "thong.cam", "admin.thong.cam"],
    remotePatterns: [{ protocol: "https" }],
  },

  prefetch: {
    defaultStrategy: "viewport",
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
