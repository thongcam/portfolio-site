import { cmsURL } from "@/constants";

const GLOBAL_ENDPOINTS = [
  "homepage",
  "logos",
  "contacts",
  "settings",
  "nav",
  "footer",
] as const;

export interface GlobalsData {
  homepageData: any;
  logos: any;
  contacts: any;
  settings: any;
  nav: any;
  footer: any;
}

async function fetchGlobals(): Promise<GlobalsData> {
  const [homepageData, logos, contacts, settings, nav, footer] =
    await Promise.all(
      GLOBAL_ENDPOINTS.map((name) =>
        fetch(`${cmsURL}/api/globals/${name}`, {
          credentials: "include",
        }).then((res) => res.json()),
      ),
    );

  return { homepageData, logos, contacts, settings, nav, footer };
}

/**
 * Fetches all CMS globals in one parallel batch. Pass Astro.locals so
 * repeated calls within the same request (layout, navbar, footer, page)
 * share a single in-flight fetch instead of each re-requesting the CMS.
 */
export default async function getGlobals(
  locals?: App.Locals,
): Promise<GlobalsData> {
  if (locals) {
    if (!locals.globalsPromise) {
      locals.globalsPromise = fetchGlobals();
    }
    return locals.globalsPromise;
  }

  return fetchGlobals();
}
