import { globEagerPlugin } from "./plugins/glob";
import { getPageFiles } from "./pages";
import { existsSync } from "fs";
import { resolve } from "path";

const cssEntrypoints = ["src/styles/app.css", "src/styles/out.css"];

const appFile = existsSync(resolve("src/app.ts"))
  ? "src/app.ts"
  : existsSync(resolve("src/app.js"))
  ? "src/app.js"
  : null;

const pages = getPageFiles().map((page) => {
  return `src/pages/${page}`;
});

export const CONFIG = {
  bun: {
    entrypoints: [...(appFile ? [appFile] : []), ...pages],
    outdir: "dist",
    sourcemap: "external",
    target: "browser",
    format: "iife",
    minify: process.env.NODE_ENV === "production",
    plugins: [globEagerPlugin()],
  },
  css: {
    entrypoints: cssEntrypoints,
  },
  // Server Info for websocket
  SERVE_PORT: 6545,
  SERVE_ORIGIN: `http://localhost:6545`,
};
