export const CONFIG = {
  // Build configuration
  BUILD_DIRECTORY: "dist",
  ENTRY_POINTS: ["src/app.js", "src/styles/index.css"],

  // Server configuration
  SERVE_PORT: 6545,
  SERVE_ORIGIN: `http://localhost:6545`,

  // Development features
  MINIFY: process.env.NODE_ENV === "production",
  SOURCEMAP: "external",
  EXPERIMENTAL_CSS: true,
} as const;
