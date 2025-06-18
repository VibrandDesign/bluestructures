// This file is used to expose environment variables at build time
export const ENV = {
  NODE_ENV: Bun.env.NODE_ENV || "development",
  VERCEL_URL: Bun.env.VERCEL_URL || "",
} as const;
