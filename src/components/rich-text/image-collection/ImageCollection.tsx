import type { SerializedEditorState } from "lexical";
import LightboxImage from "../lightbox-image/LightboxImage";
import { buildSrcSet, preferredSrc, type MediaLike } from "../imageSources";
import { IMAGE_COLLECTION_SIZES } from "../constants";

interface ImageCollectionRow {
    id?: string;
    image: MediaLike;
    caption?: SerializedEditorState;
}

/**
 * Renders a set of media assets as a CSS multi-column flow. Each figure is
 * `break-inside-avoid` so an image is never split across a column boundary,
 * and carries only a bottom margin — the column gap handles the horizontal
 * rhythm, and a top margin on the first item of each column would break the
 * alignment between columns.
 */
export default function ImageCollection({images} : {images? : ImageCollectionRow[]}) {
    if (!images?.length) return null;

    return (
        <div className="columns-xs gap-5">
            {images.map((row, index) => (
                <LightboxImage
                    key={row.id ?? index}
                    src={preferredSrc(row.image)}
                    alt={row.image.alt}
                    caption={row.caption}
                    width={row.image.width}
                    height={row.image.height}
                    srcSet={buildSrcSet(row.image)}
                    sizes={IMAGE_COLLECTION_SIZES}
                    className="flex flex-col gap-2 mb-5 break-inside-avoid"
                />
            ))}
        </div>
    )
}
