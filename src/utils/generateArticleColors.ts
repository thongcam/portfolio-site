import Color, { type ColorInstance } from "color";

export default function generateArticleColors(themeColor: ColorInstance) {
    const themeColorLight = Color.hsl({
        ...themeColor.hsl().object(),
        // w: 50,
        l: 88,
        alpha: 0.75,
    });
    
    const themeColorLighter = Color.hsl({
        ...themeColor.hsl().object(),
        l: 95,
        alpha: 0.3,
    });
    /**
     * The theme colour at step 500 of its own ramp.
     *
     * Reading the palette back out of Figma, each family holds its hue and
     * saturation roughly constant across the ramp and moves only HSL
     * lightness — step 500 sits at 47.5% for yellow and 48.4% for blue. So a
     * ramp step is reproducible for an arbitrary colour by keeping hue and
     * saturation and pinning lightness.
     *
     * Note this says nothing about contrast: the palette's own yellow-500
     * (#dba017) is only 2.3:1 on white, so a yellow theme yields a pale
     * label. See the note where this is used.
     */
    const hsl = themeColor.hsl().object();
    const atLightness = (l: number) => Color.hsl({...hsl, l});

    // What the intro actually renders on: themeColorLighter is 30% opaque, so
    // measure against it composited over the page's white, not against white.
    const sectionBackground = Color("#ffffff").mix(atLightness(95), 0.3);

    // Step 500 is only a starting point. A light hue's 500 can be far below
    // readable — the palette's own yellow-500 is 2.3:1 on white — so darken
    // from there until the label clears WCAG AA for normal text. Hues whose
    // 500 already passes are left exactly at 500.
    const CONTRAST_TARGET = 4.5;
    let lightness = 48;
    while (
        lightness > 0 &&
        sectionBackground.contrast(atLightness(lightness)) < CONTRAST_TARGET
    ) {
        lightness -= 0.5;
    }
    const themeColorRamp500 = atLightness(lightness);

    // Step 400 sits about 8 points lighter than 500 — the mean gap across the
    // reference ramps (yellow 5.5, blue 11.2, cyan 6.7). No contrast floor
    // here: this is a decorative rule, not text.
    const themeColorRamp400 = atLightness(56);

    return {themeColorLight, themeColorLighter, themeColorRamp500, themeColorRamp400};
}