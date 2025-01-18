export const CONFIG = {
  // Build configuration
  BUILD_DIRECTORY: "dist",
  ENTRY_POINTS: ["src/app.js", "src/styles/index.css"],

  // Server configuration
  SERVE_PORT: 3000,
  SERVE_ORIGIN: `http://localhost:3000`,

  // Development features
  MINIFY: process.env.NODE_ENV === "production",
  SOURCEMAP: "external",
  EXPERIMENTAL_CSS: true,
} as const;
