import type { APIContext } from "astro";
import { cmsURL } from "@/constants";

export const prerender = false;

interface CaseStudyEntry {
  slug: string;
  updatedAt?: string;
}

interface PostEntry {
  slug: string;
  updatedAt?: string;
  publishedDate?: string;
}

interface TagEntry {
  slug: string;
}

function urlEntry(loc: string, lastmod?: string) {
  return `  <url>\n    <loc>${loc}</loc>${
    lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""
  }\n  </url>`;
}

export async function GET({ site, cache }: APIContext) {
  const base = site?.origin ?? "https://thong.cam";

  const [caseStudiesResponse, postsResponse, tagsResponse] = await Promise.all([
    fetch(`${cmsURL}/api/case-studies/all`, { credentials: "include" }),
    fetch(`${cmsURL}/api/posts/all`, { credentials: "include" }),
    fetch(`${cmsURL}/api/tags/all`, { credentials: "include" }),
  ]);

  const [caseStudies, posts, tags]: [CaseStudyEntry[], PostEntry[], TagEntry[]] =
    await Promise.all([
      caseStudiesResponse.json(),
      postsResponse.json(),
      tagsResponse.json(),
    ]);

  // A failing endpoint answers with `{ error: … }`, not an array — a sitemap
  // missing one section is better than a 500 for the whole file.
  const list = <T,>(value: unknown): T[] => (Array.isArray(value) ? value : []);

  const entries = [
    urlEntry(base + "/"),
    urlEntry(base + "/about"),
    ...list<CaseStudyEntry>(caseStudies).map((cs) =>
      urlEntry(`${base}/case-studies/${cs.slug}`, cs.updatedAt),
    ),
    urlEntry(base + "/blog"),
    ...list<PostEntry>(posts).map((post) =>
      urlEntry(`${base}/blog/${post.slug}`, post.updatedAt),
    ),
    // Tag pages only list posts that already appear above, so they carry no
    // lastmod of their own.
    ...list<TagEntry>(tags).map((tag) => urlEntry(`${base}/blog/tags/${tag.slug}`)),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>`;

  // The CDN caches for a year, invalidated by tag when content changes
  cache.set({
    maxAge: 31536000,
    tags: ["global", "about", "case-studies", "posts", "tags"],
  });

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
