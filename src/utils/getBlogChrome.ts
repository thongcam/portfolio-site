import { cmsURL } from "@/constants";
import getBlogData from "@utils/getBlogData";
import getGlobals from "@utils/getGlobals";
import type { CardContentType } from "@customTypes/cardContentType";
import type { ContactLinkType } from "@customTypes/contactLinkType";
import type { PostListItemType, TagType } from "@customTypes/postType";

export interface BlogChrome {
  blog: any;
  posts: PostListItemType[];
  tags: TagType[];
  /** The three promoted case studies, as card content. */
  promotedCaseStudies: CardContentType[];
  /** The links the author card shows, already filtered to the CMS selection. */
  authorContactLinks: ContactLinkType[];
  settings: any;
}

/**
 * Everything the blog index, a tag page and a post page have in common: the
 * Blog global, the post and tag lists, the promoted case studies and the
 * author card's contact links.
 *
 * Both underlying fetchers are request-scoped through Astro.locals, so a page
 * calling this alongside its own `getGlobals` does not re-request anything.
 */
export default async function getBlogChrome(
  locals: App.Locals,
): Promise<BlogChrome> {
  const [{ blog, posts, tags }, { contacts, settings }] = await Promise.all([
    getBlogData(locals),
    getGlobals(locals),
  ]);

  // Showcased case studies come back as ids at depth 0; each collection's
  // `/:id/thumbnail` endpoint returns the flattened card content.
  const ids: string[] = blog?.caseStudies?.showcasedProjects ?? [];
  const promotedCaseStudies = (
    await Promise.all(
      ids.map(async (id) => {
        try {
          const res = await fetch(`${cmsURL}/api/case-studies/${id}/thumbnail`);
          if (!res.ok) return null;
          const data = await res.json();
          return data?.error ? null : (data as CardContentType);
        } catch {
          return null;
        }
      }),
    )
  ).filter((entry): entry is CardContentType => entry !== null);

  // An empty selection means "all", matching how the homepage hero picks its
  // links — so the card is never left without a way to reach the author.
  const allContactLinks = (contacts?.contactLinks ?? []) as ContactLinkType[];
  const selection: string[] = blog?.author?.contactLinks ?? [];
  const authorContactLinks = selection.length
    ? allContactLinks.filter((link) => link.id && selection.includes(link.id))
    : allContactLinks;

  return {
    blog,
    posts,
    tags,
    promotedCaseStudies,
    authorContactLinks,
    settings,
  };
}
