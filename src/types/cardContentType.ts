export interface CardContentType {
    title: string;
    description: string;
    subDescription: string | null;
    linkText: string;
    external: boolean;
    gray: boolean;
    image: {
      source: string;
      alt: string;
      alignRight: boolean;
    };
    ellipseDecorator: boolean;
  }