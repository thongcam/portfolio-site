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
    return {themeColorLight, themeColorLighter};
}