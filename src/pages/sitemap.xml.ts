import type { APIContext } from "astro";
import { cmsURL } from "@/constants";

export const prerender = false;

interface CaseStudyEntry {
  slug: string;
  updatedAt?: string;
}

function urlEntry(loc: string, lastmod?: string) {
  return `  <url>\n    <loc>${loc}</loc>${
    lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""
  }\n  </url>`;
}

export async function GET({ site, cache }: APIContext) {
  const base = site?.origin ?? "https://thong.cam";

  const response = await fetch(`${cmsURL}/api/case-studies/all`, {
    credentials: "include",
  });
  const caseStudies: CaseStudyEntry[] = await response.json();

  const entries = [
    urlEntry(base + "/"),
    ...caseStudies.map((cs) =>
      urlEntry(`${base}/case-studies/${cs.slug}`, cs.updatedAt),
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>`;

  // The CDN caches for a year, invalidated by tag when content changes
  cache.set({
    maxAge: 31536000,
    tags: ["global", "case-studies"],
  });

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
