import { cmsURL } from "@/constants";
import type { PostListItemType, TagType } from "@customTypes/postType";

export interface BlogData {
  /** Every published post, newest first. */
  posts: PostListItemType[];
  /** Every tag that has at least one published post, with its count. */
  tags: TagType[];
  /** The Blog global: headings, promoted case studies, author card. */
  blog: any;
}

async function fetchBlogData(): Promise<BlogData> {
  const [posts, tags, blog] = await Promise.all([
    fetch(`${cmsURL}/api/posts/all`, { credentials: "include" }).then((res) =>
      res.json(),
    ),
    fetch(`${cmsURL}/api/tags/all`, { credentials: "include" }).then((res) =>
      res.json(),
    ),
    fetch(`${cmsURL}/api/globals/blog`, { credentials: "include" }).then(
      (res) => res.json(),
    ),
  ]);

  return {
    // An endpoint that errors returns `{ error: … }` rather than an array —
    // guard so a CMS hiccup renders an empty blog instead of throwing.
    posts: Array.isArray(posts) ? posts : [],
    tags: Array.isArray(tags) ? tags : [],
    blog,
  };
}

/**
 * The blog's shared data in one parallel batch, mirroring getGlobals: pass
 * Astro.locals so the index, a post page and its "Continue reading" section
 * share a single in-flight fetch per request.
 */
export default async function getBlogData(
  locals?: App.Locals,
): Promise<BlogData> {
  if (locals) {
    if (!locals.blogPromise) {
      locals.blogPromise = fetchBlogData();
    }
    return locals.blogPromise;
  }

  return fetchBlogData();
}
