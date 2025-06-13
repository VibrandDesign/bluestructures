import { globEagerPlugin } from "./plugins/glob";
import { getPageFiles } from "./pages";
import { existsSync } from "fs";
import { resolve } from "path";

const entries = getPageFiles().map((page) => {
  return `src/pages/${page}`;
});

// console.log("entries -> []", entries);

const appFile = existsSync(resolve("src/app.ts"))
  ? "src/app.ts"
  : existsSync(resolve("src/app.js"))
  ? "src/app.js"
  : null;

export const CONFIG = {
  bun: {
    entrypoints: [
      ...(appFile ? [appFile] : []),
      "src/styles/index.css",
      "src/styles/out.css",
      ...entries,
    ],
    outdir: "dist",
    experimentalCss: true,
    sourcemap: "external",
    target: "browser",
    format: "iife",
    minify: process.env.NODE_ENV === "production",
    plugins: [globEagerPlugin()],
  },

  // Server Info for websocket
  SERVE_PORT: 6545,
  SERVE_ORIGIN: `http://localhost:6545`,
};
