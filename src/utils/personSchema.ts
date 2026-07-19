export const PERSON_ID = "https://thong.cam/#person";
export const WEBSITE_ID = "https://thong.cam/#website";

interface ContactLink {
  title: string;
  url: string;
}

/** Lightweight reference for pages that link to the Person without redefining it. */
export const personRef = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: "Thong Cam",
};

/** Full Person definition — include on the homepage only. */
// Only social/identity profile links belong in sameAs — not documents or mailto links.
const SAME_AS_DOMAINS = ["linkedin.com", "github.com"];

export function buildPersonSchema(contactLinks: ContactLink[] = []) {
  const sameAs = contactLinks
    .map((link) => link.url)
    .filter((url) =>
      SAME_AS_DOMAINS.some((domain) => url.includes(domain)),
    );

  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Thong Cam",
    alternateName: ["Cam Duy Thông"],
    url: "https://thong.cam",
    jobTitle: "Product Designer",
    description:
      "Product designer with a background in electrical engineering, currently designing at FPT Retail and pursuing a Master's in Human-Computer Interaction at the University of Twente and Aalto University.",
    knowsAbout: [
      "Product Design",
      "User Research",
      "Human-Computer Interaction",
      "Full-stack Development",
      "Electronic Prototyping",
    ],
    alumniOf: [
      { "@type": "CollegeOrUniversity", name: "Aalto University" },
      { "@type": "CollegeOrUniversity", name: "University of Twente" },
    ],
    worksFor: { "@type": "Organization", name: "FPT Retail" },
    sameAs,
  };
}

export function buildWebsiteSchema(siteName: string) {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: "https://thong.cam",
    name: siteName,
    inLanguage: "en",
    author: { "@id": PERSON_ID },
  };
}
