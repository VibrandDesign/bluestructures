const basePath = "/api/";

export const apiPath = (route: string = "") => {
  // In development, use the same protocol as the current page
  if (typeof window !== "undefined") {
    const protocol = window.location.protocol;
    return `${protocol}//localhost:6546${basePath}${route}`;
  }

  // Fallback for server-side rendering
  return `http://localhost:6546${basePath}${route}`;
};
