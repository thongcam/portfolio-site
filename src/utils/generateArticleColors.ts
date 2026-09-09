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
    const themeColorRamp500 = Color.hsl({
        ...themeColor.hsl().object(),
        l: 48,
    });

    return {themeColorLight, themeColorLighter, themeColorRamp500};
}