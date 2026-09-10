import { defineConfig, envField } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import { cacheCloudflare } from "@astrojs/cloudflare/cache";

import react from "@astrojs/react";

import tailwindcss from "@tailwindcss/vite";

/**
 * Build options that apply to the browser bundle only.
 *
 *   - `sourcemap: "hidden"` emits .map files without a `sourceMappingURL`
 *     comment, so browsers never fetch them and the original source is not
 *     handed to every visitor — the maps are there to be loaded deliberately
 *     in DevTools, or handed to an error tracker. Note this hides the
 *     reference, not the file: the maps are uploaded as static assets and
 *     remain fetchable at `/_astro/<chunk>.js.map`.
 *
 *   - `minify.compress.dropConsole` / `dropDebugger` discard `console.*`
 *     calls and `debugger` statements. Only call expressions go; a reference
 *     passed around rather than invoked — `.catch(console.error)`, or
 *     `console.warn.bind(...)`, both of which mux-player does — has to
 *     survive, since dropping it would change what the code means.
 *
 * Both are deliberately kept off the server build: the Cloudflare Worker
 * keeps its logging so `wrangler tail` stays useful, and no sourcemaps are
 * emitted for it (they were ~2.8MB of files that wrangler never uploads,
 * since `upload_source_maps` is not set).
 *
 * The scoping has to go through Vite 8's Environment API. Astro builds four
 * environments (astro, prerender, client, ssr) from a single Vite config, and
 * `config.build.ssr` reads `true` in every one of them, so the older
 * client/server distinction cannot tell them apart. Setting these on
 * `vite.build` directly applies them to all four — which for the minify
 * option breaks the Worker at startup ("Invalid URL string" during
 * prerender), and for sourcemaps litters `dist/server` with dead .map files.
 * Reaching into `environments.client` is what keeps them to the browser.
 *
 * Rolldown's minifier options rather than the older `esbuild.drop`, since
 * Vite 8 minifies with oxc (`build.minify` defaults to 'oxc' for client).
 */
function clientBundleOptions() {
  return {
    name: "client-bundle-options",
    apply: "build",
    configResolved(config) {
      const client = config.environments?.client;
      if (!client) return;

      client.build.sourcemap = "hidden";

      const output = (client.build.rolldownOptions ??= {}).output ??= {};
      output.minify = { compress: { dropConsole: true, dropDebugger: true } };
    },
  };
}

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  output: "server",

  // Astro 7 changed the default from `true` to `'jsx'` (React-style
  // whitespace collapsing). Pinned explicitly to preserve the exact
  // rendering behavior this site had under Astro 6.
  compressHTML: true,

  adapter: cloudflare({
    imageService: { build: 'cloudflare-binding', runtime: 'cloudflare-binding' }
  }),

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
    plugins: [tailwindcss(), clientBundleOptions()],
  },
});
