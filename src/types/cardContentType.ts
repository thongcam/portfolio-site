export interface CardContentType {
    title: string;
    description: Object;
    subDescription: string | null;
    linkLabel: string;
    url: string;
    thumbnailImage: {
      width: number;
      height: number;
      url: string;
      alt: string;
      sizes: {
        cardThumbnail: {
          width: number;
          height: number;
          url: string;
        }
      }
    };

  }