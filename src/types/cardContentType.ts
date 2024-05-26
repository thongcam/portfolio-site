export interface CardContentType {
    title: string;
    description: string;
    subDescription: string | null;
    linkText: string;
    external: boolean;
    url: string;
    image: {
      src: string;
      alt: string;
    };

  }