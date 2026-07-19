// <mux-player> is a native custom element (@mux/mux-player), rendered directly
// as HTML from server-side JSX — no React wrapper/hydration needed.
import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "mux-player": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        "playback-id"?: string;
        muted?: boolean;
        loop?: boolean;
        playsinline?: boolean;
      };
    }
  }
}
