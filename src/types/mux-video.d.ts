// <mux-video> is a native custom element (@mux/mux-video), rendered directly
// as HTML from server-side JSX — no React wrapper/hydration needed.
import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "mux-video": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        "playback-id"?: string;
        poster?: string;
        controls?: boolean;
        muted?: boolean;
        loop?: boolean;
        playsinline?: boolean;
      };
    }
  }
}
