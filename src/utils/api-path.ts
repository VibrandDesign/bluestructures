const basePath = "/api/";

const vercelUrl = "webflow-dev-setup-xi.vercel.app";
const useSSL = true;

const isDev = process.env.NODE_ENV === "development";

export const apiPath = (route: string = "") => {
  // In development
  if (isDev) {
    return `${useSSL ? "https" : "http"}://localhost:6546${basePath}${route}`;
  }

  return `https://${vercelUrl}${basePath}${route}`;
};
