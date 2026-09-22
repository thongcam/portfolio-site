import { cmsURL } from "@/constants";

/**
 * The About global. Request-scoped through Astro.locals, in line with
 * getGlobals and getBlogData, so nothing re-fetches within one render.
 */
async function fetchAbout(): Promise<any> {
  const response = await fetch(`${cmsURL}/api/globals/about`, {
    credentials: "include",
  });
  return response.json();
}

export default async function getAboutData(locals?: App.Locals): Promise<any> {
  if (locals) {
    if (!locals.aboutPromise) {
      locals.aboutPromise = fetchAbout();
    }
    return locals.aboutPromise;
  }

  return fetchAbout();
}
