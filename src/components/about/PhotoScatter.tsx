import { useCallback, useEffect, useRef, useState } from "react";

export interface ScatterPhoto {
  url: string;
  /** Resolution candidates, built server-side — see outsideOfWork.astro. */
  srcSet?: string;
  sizes?: string;
  alt: string;
  description: string;
}

interface Props {
  photos: ScatterPhoto[];
}

/**
 * Layout constants, per breakpoint.
 *
 * Positions are percentages of the container, so the scatter holds its shape
 * as the container resizes and the two layouts can be expressed as CSS custom
 * properties that a media query swaps — no JS breakpoint, and therefore no
 * hydration mismatch or first-paint flash.
 *
 * Desktop spreads the photos across the full width, overlapping; mobile puts
 * them on a 2x2 grid in reading order.
 */
const DESKTOP_CARD_WIDTH = 41.4;
const MOBILE_CARD_WIDTH = 48;

/**
 * The 2x2 grid's second row, as a percentage of the container's height.
 * Rows overlap slightly, which is what keeps the grid reading as a stack of
 * snapshots rather than a gallery.
 */
const MOBILE_ROW_TOP = 48;

/**
 * Widest the scatter is allowed to get while still in the stacked layout.
 *
 * Card width is a percentage of the container, and a card's height follows
 * from its width — so without a cap the photos kept growing all the way to
 * the `md` breakpoint and, at ~740px, stood more than twice as tall as the
 * space set aside for them. The cap holds them at roughly the size they are
 * on a phone.
 */
const MOBILE_MAX_WIDTH = 380;

/**
 * Height of a polaroid as a multiple of its width: 9.7% padding above the
 * square photo, the photo itself (the card less its 8% side padding), then
 * the 29% caption strip below.
 */
const CARD_ASPECT = 0.097 + (1 - 2 * 0.08) + 0.29;

/**
 * Container height as a multiple of its width, for the stacked layout.
 *
 * Solves `H = MOBILE_ROW_TOP * H + cardHeight` — the grid has to be tall
 * enough for the second row to start at its offset and still finish inside
 * the container. Expressed as an aspect ratio rather than a fixed height so
 * it tracks the width the cards are actually sized from; a fixed height is
 * what let them overflow onto the section below.
 */
const MOBILE_ASPECT =
  (CARD_ASPECT * (MOBILE_CARD_WIDTH / 100)) / (1 - MOBILE_ROW_TOP / 100);

/**
 * How far past the container's right edge the last photo sits, widening the
 * run the photos are distributed along.
 *
 * Only to the right: the statement sits immediately to the left of the
 * scatter, and anything hanging off that side has to be covered by the blur
 * when a photo is opened — which would put the blur over the copy. There is
 * nothing but section padding to the right. The section clips overflow on the
 * x axis, so the overhang can never widen the page.
 */
const DESKTOP_OVERHANG = 3;

/** Vertical jitter, in percent of container height — echoes the design's stagger. */
const DESKTOP_TOP_OFFSETS = [4, 14, 0, 10];

/** Side-by-side layout: tilts simply alternate along the row. */
const desktopRotation = (index: number) => (index % 2 === 0 ? 8 : -8);

/**
 * Stacked layout: tilts mirror between rows, so the bottom pair leans the
 * opposite way to the pair above — [+8, -8] over [-8, +8] — instead of the
 * two rows repeating the same lean.
 */
const mobileRotation = (index: number) => {
  const row = Math.floor(index / 2);
  const leansRight = index % 2 === 0;
  return (row % 2 === 0) === leansRight ? 8 : -8;
};

function desktopPosition(index: number, total: number) {
  const span = 100 + DESKTOP_OVERHANG - DESKTOP_CARD_WIDTH;
  const left = total > 1 ? (index * span) / (total - 1) : span / 2;
  return { left, top: DESKTOP_TOP_OFFSETS[index % DESKTOP_TOP_OFFSETS.length] };
}

function mobilePosition(index: number) {
  return {
    left: (index % 2) * (100 - MOBILE_CARD_WIDTH),
    top: Math.floor(index / 2) * MOBILE_ROW_TOP,
  };
}

/**
 * Resting shadow, deepening as a photo sits higher in the stack.
 *
 * Soft rather than crisp: the blur runs well ahead of the offset and the
 * alpha stays low, so a photo reads as resting on the page rather than
 * stamped onto it.
 */
function restingShadow(stackPosition: number, total: number) {
  const lift = total > 1 ? stackPosition / (total - 1) : 1;
  const near = 1.5 + lift * 1.5;
  const far = 4 + lift * 5;
  return `0 ${near.toFixed(1)}px ${(near * 3).toFixed(1)}px rgba(0,0,0,0.05), 0 ${far.toFixed(1)}px ${(far * 2.2).toFixed(1)}px rgba(0,0,0,0.06)`;
}

/**
 * Shadow while a photo is lifted — held between finger and table, or opened.
 * Further off the page than the resting state, so the blur grows and the
 * alpha barely does: a lifted photo casts a wider, fainter shadow, not a
 * darker one.
 */
const LIFTED_SHADOW =
  "0 8px 24px rgba(0,0,0,0.07), 0 20px 48px rgba(0,0,0,0.09)";

/**
 * Layering.
 *
 * The blur has to sit *between* the opened photo and the rest of the scatter:
 * `backdrop-filter` only blurs what is painted beneath it, so an overlay
 * below the photos would blur the section behind them and leave the photos
 * themselves sharp — which is the opposite of the effect. So a resting photo
 * sits under the blur, and the opened one is lifted above it.
 */
const zForResting = (stackPosition: number) => 1 + stackPosition;
const zForBlur = (total: number) => 1 + total;
const zForOpen = (total: number) => 2 + total;

/** How far a pointer may travel before a press counts as a drag, not a click. */
const DRAG_THRESHOLD = 5;

/** How long the tap hint stays up once the scatter is scrolled to. */
const HINT_DURATION = 5000;

export default function PhotoScatter({ photos }: Props) {
  const containerRef = useRef<HTMLUListElement>(null);

  /** Drag displacement per photo, in px, on top of its laid-out position. */
  const [offsets, setOffsets] = useState(() => photos.map(() => ({ x: 0, y: 0 })));
  /**
   * Stack order, lowest first. Photos move to the end when they come forward.
   * Seeded in reverse so the leftmost photo starts on top — and, since the
   * resting shadow is keyed to stack position, carries the deepest shadow too.
   */
  const [stack, setStack] = useState(() =>
    photos.map((_, i) => photos.length - 1 - i),
  );
  const [dragging, setDragging] = useState<number | null>(null);
  const [opened, setOpened] = useState<number | null>(null);
  const [hintVisible, setHintVisible] = useState(false);
  /**
   * How far the blur has to reach past the container on each side, in px.
   *
   * Measured from the resting photos rather than set as a fixed inset: a
   * tilted card's bounding box depends on its size and angle, both of which
   * change with the breakpoint, so any hand-picked padding is either too
   * small to cover the cards or large enough to bleed over the copy around
   * the scatter. Nothing moves while a photo is open except that photo, which
   * sits above the blur anyway, so measuring once per open is enough.
   */
  const [blurReach, setBlurReach] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  const gesture = useRef<{
    index: number;
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
    /** Whether a photo was open when this press began. */
    dismissed: boolean;
  } | null>(null);

  const bringToFront = useCallback((index: number) => {
    setStack((current) => [...current.filter((i) => i !== index), index]);
  }, []);

  const dismissHint = useCallback(() => setHintVisible(false), []);

  // The hint runs once, when the scatter first comes into view, and is also
  // cut short by any interaction — it has done its job by then.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer: number | undefined;
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          obs.disconnect();
          setHintVisible(true);
          timer = window.setTimeout(() => setHintVisible(false), HINT_DURATION);
        });
      },
      { threshold: 0.4 },
    );

    observer.observe(container);
    return () => {
      observer.disconnect();
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (opened === null) return;
    const container = containerRef.current;
    if (!container) return;

    const box = container.getBoundingClientRect();
    const reach = { top: 0, right: 0, bottom: 0, left: 0 };

    container
      .querySelectorAll<HTMLElement>("[data-photo]")
      .forEach((card, index) => {
        if (index === opened) return;
        // The tilt lives on the card's child, and an element's bounding box
        // does not grow to fit a transformed descendant — so measuring the
        // card itself would return the upright box and miss the corners the
        // rotation throws out, which is precisely what has to be covered.
        const tilted = (card.firstElementChild as HTMLElement | null) ?? card;
        const b = tilted.getBoundingClientRect();
        reach.top = Math.max(reach.top, box.top - b.top);
        reach.left = Math.max(reach.left, box.left - b.left);
        reach.right = Math.max(reach.right, b.right - box.right);
        reach.bottom = Math.max(reach.bottom, b.bottom - box.bottom);
      });

    // A little slack so the blur's own edge never lands exactly on a card's.
    const slack = 8;
    setBlurReach({
      top: Math.max(0, reach.top) + slack,
      right: Math.max(0, reach.right) + slack,
      bottom: Math.max(0, reach.bottom) + slack,
      left: Math.max(0, reach.left) + slack,
    });
  }, [opened]);

  // An opened photo closes on the next click anywhere. Registered a tick late
  // so the click that opened it does not immediately close it again.
  useEffect(() => {
    if (opened === null) return;

    const close = () => setOpened(null);
    const id = window.setTimeout(() => {
      document.addEventListener("pointerdown", close);
      document.addEventListener("keydown", onEscape);
    }, 0);

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    return () => {
      window.clearTimeout(id);
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", onEscape);
    };
  }, [opened]);

  const onPointerDown = (event: React.PointerEvent, index: number) => {
    // A press on another photo may reach the document-level close listener —
    // closing is what it should do. A press on the open photo must not, or it
    // would be closed there and reopened here.
    if (opened === index) event.stopPropagation();

    dismissHint();

    // Deliberately not raising the photo here. A press while another photo is
    // open only puts that one down, and raising the pressed photo as well
    // would move two things when the reader asked for one. Whatever the press
    // turns out to be — a drag, or a click that opens — raises it instead.
    gesture.current = {
      index,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: offsets[index].x,
      originY: offsets[index].y,
      moved: false,
      dismissed: opened !== null,
    };

    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return;

    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;

    if (!current.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

    if (!current.moved) {
      current.moved = true;
      bringToFront(current.index);
      setDragging(current.index);
      // Picking a photo up puts the open one down.
      setOpened(null);
    }

    const container = containerRef.current;
    // Clamped to a generous box around the container: "freely", but not so
    // freely that a photo can be flung out and widen the page.
    const limitX = container ? container.clientWidth * 0.6 : 400;
    const limitY = container ? container.clientHeight * 0.6 : 300;
    const clamp = (value: number, limit: number) =>
      Math.min(limit, Math.max(-limit, value));

    const next = {
      x: clamp(current.originX + dx, limitX),
      y: clamp(current.originY + dy, limitY),
    };

    setOffsets((all) => all.map((o, i) => (i === current.index ? next : o)));
  };

  const endGesture = (event: React.PointerEvent) => {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return;

    const element = event.currentTarget as HTMLElement;
    if (element.hasPointerCapture(event.pointerId)) {
      element.releasePointerCapture(event.pointerId);
    }

    if (!current.moved) {
      if (current.dismissed) {
        // Something was already open. This press closes it and goes no
        // further — including when it landed on a different photo, which
        // takes a second press to open. Dismissing and opening in one click
        // makes it impossible to simply put a photo down by clicking near it.
        setOpened(null);
      } else {
        bringToFront(current.index);
        setOpened(current.index);
      }
    }

    gesture.current = null;
    setDragging(null);
  };

  /**
   * The keyboard path. Unlike a click, this opens the focused photo even when
   * another is open: there is no "click away" for a keyboard, Escape is the
   * dismiss gesture, and pressing Enter twice with nothing visibly happening
   * the first time would be baffling.
   */
  const toggleOpen = (index: number) => {
    dismissHint();
    bringToFront(index);
    setOpened((value) => (value === index ? null : index));
  };

  if (!photos.length) return null;

  return (
    <ul
      ref={containerRef}
      className="relative w-full max-w-[var(--scatter-max-w)] list-none aspect-[1/var(--scatter-aspect)] md:aspect-auto md:h-[382px] md:max-w-none"
      style={
        {
          "--scatter-aspect": MOBILE_ASPECT.toFixed(4),
          "--scatter-max-w": `${MOBILE_MAX_WIDTH}px`,
        } as React.CSSProperties
      }
    >
      {/* Sits under the opened photo and over everything else, so the rest of
          the scatter recedes while a description is being read. */}
      <li
        aria-hidden="true"
        className={`pointer-events-none absolute backdrop-blur-[3px] transition-opacity duration-300 ${
          opened === null ? "opacity-0" : "opacity-100"
        }`}
        style={{
          top: -blurReach.top,
          right: -blurReach.right,
          bottom: -blurReach.bottom,
          left: -blurReach.left,
          zIndex: zForBlur(photos.length),
          background: "rgba(255,255,255,0.3)",
        }}
      />

      {photos.map((photo, index) => {
        const desktop = desktopPosition(index, photos.length);
        const mobile = mobilePosition(index);
        const stackPosition = stack.indexOf(index);
        const isOpen = opened === index;
        const isDragging = dragging === index;
        const lifted = isOpen || isDragging;

        const openLeftDesktop = (100 - DESKTOP_CARD_WIDTH) / 2;
        const openLeftMobile = (100 - MOBILE_CARD_WIDTH) / 2;

        return (
          <li
            key={index}
            data-photo
            className="absolute left-[var(--m-left)] top-[var(--m-top)] w-[var(--m-w)] touch-none select-none md:left-[var(--d-left)] md:top-[var(--d-top)] md:w-[var(--d-w)]"
            style={
              {
                "--m-left": `${isOpen ? openLeftMobile : mobile.left}%`,
                "--m-top": `${isOpen ? 0 : mobile.top}%`,
                "--m-w": `${MOBILE_CARD_WIDTH}%`,
                "--m-rot": isOpen ? "0deg" : `${mobileRotation(index)}deg`,
                "--d-left": `${isOpen ? openLeftDesktop : desktop.left}%`,
                "--d-top": `${isOpen ? 0 : desktop.top}%`,
                "--d-w": `${DESKTOP_CARD_WIDTH}%`,
                "--d-rot": isOpen ? "0deg" : `${desktopRotation(index)}deg`,
                // Drives the entrance stagger in outsideOfWork.astro.
                "--photo-index": index,
                zIndex: isOpen
                  ? zForOpen(photos.length)
                  : zForResting(stackPosition),
                transform: isOpen
                  ? "translate3d(0,0,0)"
                  : `translate3d(${offsets[index].x}px, ${offsets[index].y}px, 0)`,
                // No transition mid-drag, or the photo lags the pointer.
                transition: isDragging
                  ? "none"
                  : "transform 420ms cubic-bezier(0.2,0.8,0.2,1), left 420ms cubic-bezier(0.2,0.8,0.2,1), top 420ms cubic-bezier(0.2,0.8,0.2,1)",
              } as React.CSSProperties
            }
            onPointerDown={(event) => onPointerDown(event, index)}
            onPointerMove={onPointerMove}
            onPointerUp={endGesture}
            onPointerCancel={endGesture}
          >
            {/* Rotation and scale live on their own element so they can stay
                animated while the drag translate above them does not. */}
            {/* `--rot` picks the breakpoint's tilt through a static pair of
                classes, so the two angles can differ per layout while the
                transform itself stays a single inline value. */}
            <div
              className="[--rot:var(--m-rot)] transition-transform duration-[420ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] md:[--rot:var(--d-rot)]"
              style={{
                transform: `rotate(var(--rot)) scale(${lifted ? 1.12 : 1})`,
              }}
            >
              <div
                className="relative transition-transform duration-[520ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
                style={{
                  transformStyle: "preserve-3d",
                  transform: isOpen ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                <button
                  type="button"
                  onClick={(event) => {
                    // The pointer gesture already decided click vs. drag;
                    // this is the keyboard and assistive-tech path.
                    if (event.detail !== 0) return;
                    toggleOpen(index);
                  }}
                  aria-expanded={isOpen}
                  className="block w-full cursor-grab bg-white px-[8%] pb-[29%] pt-[9.7%] text-left active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-600"
                  style={{
                    backfaceVisibility: "hidden",
                    boxShadow: lifted
                      ? LIFTED_SHADOW
                      : restingShadow(stackPosition, photos.length),
                    transition: "box-shadow 420ms cubic-bezier(0.2,0.8,0.2,1)",
                  }}
                >
                  <img
                    src={photo.url}
                    srcSet={photo.srcSet}
                    sizes={photo.sizes}
                    alt={photo.alt}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="aspect-square w-full object-cover"
                  />
                  <span className="sr-only">{photo.description}</span>
                </button>

                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-white px-[8%] pb-[29%] pt-[9.7%]"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    boxShadow: lifted
                      ? LIFTED_SHADOW
                      : restingShadow(stackPosition, photos.length),
                  }}
                >
                  <p className="flex aspect-square w-full items-start text-h3 italic text-text-accent-blue">
                    {photo.description}
                  </p>
                </div>
              </div>

              {/* Tap hint: a dot with a ring pulsing out from under it, on the
                  polaroid's blank caption strip rather than over the photo.
                  88% down the card is the middle of that strip: the padding
                  above the square image is 9.7% of the card's width and the
                  image itself 84%, leaving the bottom 29% blank. */}
              {index === 0 && hintVisible && !isOpen && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-[88%] -translate-x-1/2 -translate-y-1/2"
                >
                  <span className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-text-primary/70" />
                  <span className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-text-primary/40" />
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
