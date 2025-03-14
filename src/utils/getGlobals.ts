import { cmsURL } from "@/constants";

export default async function getGlobals()  {
    const homepageDataResponse = await fetch(`${cmsURL}/api/globals/homepage`, {
        credentials: "include",
      });
      
      const homepageData = await homepageDataResponse.json();
      
      const logosResponse = await fetch(`${cmsURL}/api/globals/logos`, {
        credentials: "include",
      });
      
      const logos = await logosResponse.json();
      
      const contactsResponse = await fetch(`${cmsURL}/api/globals/contacts`, {
        credentials: "include",
      });
      
      const contacts = await contactsResponse.json();
      
      const settingsResponse = await fetch(`${cmsURL}/api/globals/settings`, {
        credentials: "include",
      });
      
      const settings = await settingsResponse.json();

      return {homepageData, logos, contacts, settings};
}