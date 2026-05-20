export const cmsURL = import.meta.env.DEV
  ? "http://localhost:3000"
  : import.meta.env.PUBLIC_CMS_URL_PROD;
