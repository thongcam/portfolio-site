import Color, { type ColorInstance } from "color";

export default function generateArticleColors(themeColor: ColorInstance) {
    const themeColorLight = Color.hwb({
        ...themeColor.hwb().object(),
        w: 70,
        alpha: 0.75,
    });
    
    const themeColorLighter = Color.hwb({
        ...themeColor.hwb().object(),
        w: 95,
        b: 0,
        alpha: 0.5,
    });
    return {themeColorLight, themeColorLighter};
}