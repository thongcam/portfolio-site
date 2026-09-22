import type { PostListItemType } from "@customTypes/postType";

/**
 * The "Continue reading" selection: the posts sharing the most tags with the
 * current one, newest first within each tier.
 *
 * Posts with no tag in common are not excluded — they sort last, so the
 * section still fills its three slots on a blog whose tags do not overlap
 * much. `posts` is already newest-first from the CMS, so ranking only has to
 * be stable to keep that order as the tie-break.
 */
export default function relatedPosts(
  current: { id: string; tags: { id: string }[] },
  posts: PostListItemType[],
  limit = 3,
): PostListItemType[] {
  const currentTags = new Set(current.tags.map((tag) => tag.id));

  return posts
    .filter((post) => post.id !== current.id)
    .map((post, index) => ({
      post,
      index,
      shared: post.tags.filter((tag) => currentTags.has(tag.id)).length,
    }))
    .sort((a, b) => b.shared - a.shared || a.index - b.index)
    .slice(0, limit)
    .map((entry) => entry.post);
}
