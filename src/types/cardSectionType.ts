import type { CardContentType } from "./cardContentType";

export interface CardSectionType {
    numbering: string;
    title: string;
    subheading: string | null;
    bg: "white" | "gray";
    imageAlign: "right" | "left";
    decorator: "ellipse" | "rectangle";
    content: CardContentType;
}