import { defineConfig, envField } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import { cacheCloudflare } from "@astrojs/cloudflare/cache";

import react from "@astrojs/react";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  output: "server",

  // Astro 7 changed the default from `true` to `'jsx'` (React-style
  // whitespace collapsing). Pinned explicitly to preserve the exact
  // rendering behavior this site had under Astro 6.
  compressHTML: true,

  adapter: cloudflare(),

  // Route caching provider — Astro.cache.set()/context.cache.set() sets
  // Cloudflare-CDN-Cache-Control + Cache-Tag under the hood; invalidate() uses
  // the Worker Cache API. Browser-facing Cache-Control is NOT touched by this
  // provider — pages still set it explicitly.
  cache: {
    provider: cacheCloudflare(),
  },

  site: "https://thong.cam",

  image: {
    domains: ["astro.build", "thong.cam", "admin.thong.cam"],
    // Scoped to localhost (any port) for the local dev CMS — unlike a bare
    // domain string, remotePatterns properly matches regardless of port on
    // both Astro's own check and the adapter's generated allowlist.
    remotePatterns: [{ protocol: "http", hostname: "localhost" }],
    layout: "constrained",
    breakpoints: [400, 750, 1024, 1668, 2048, 2560],
  },

  prefetch: {
    defaultStrategy: "viewport",
  },

  env: {
    schema: {
      PAYLOAD_WEBHOOK_SECRET: envField.string({
        context: "server",
        access: "secret",
      }),
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
