/** A tag as `/api/tags/all` and every post listing return it. */
export interface TagType {
  id: string;
  name: string;
  slug: string;
  /** Number of published posts carrying the tag. Absent on a post's own tags. */
  count?: number;
}

/** A post as `/api/posts/all` returns it — enough to draw a listing row. */
export interface PostListItemType {
  id: string;
  title: string;
  slug: string;
  publishedDate: string;
  updatedAt?: string;
  tags: TagType[];
  thumbnail: {
    url: string;
    alt: string;
    width: number;
    height: number;
  } | null;
}
