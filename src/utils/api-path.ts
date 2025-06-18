import { config } from "../config/build-config";

const basePath = "/api/";

// Use the build configuration
const isDev = config.NODE_ENV === "development";
const vercelUrl = config.VERCEL_URL;

export const apiPath = (route: string = "") => {
  // In development
  if (isDev) {
    // Use the same protocol as the current page
    const protocol =
      typeof window !== "undefined" ? window.location.protocol : "http:";
    return `${protocol}//localhost:6546${basePath}${route}`;
  }

  // In production, use Vercel URL
  if (!vercelUrl) {
    throw new Error("VERCEL_URL is not set, API will not work in production");
  }

  return `https://${vercelUrl}${basePath}${route}`;
};
