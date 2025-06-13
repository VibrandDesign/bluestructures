import { watch } from "fs";
import { ServerWebSocket } from "bun";
import { generateResponse } from "./generateResponse";
import { liveReloadCode } from "./live-reload";
import { CONFIG } from "./config";
import type { BuildConfig } from "bun";
import { existsSync } from "fs";
import { resolve } from "path";
import { getPageFiles } from "./pages";

let currentBuildResult: any = null;
const clients = new Set<ServerWebSocket<unknown>>();

// Separate build function
async function rebuildFiles() {
  console.log("🔄 Rebuilding...");
  try {
    // Build JS files
    const result = await Bun.build({
      ...(CONFIG.bun as BuildConfig),
    });

    // Build CSS files separately
    const cssResult = await Bun.build({
      entrypoints: CONFIG.css.entrypoints,
      outdir: "dist",
      experimentalCss: true,
      sourcemap: "external",
      target: "browser",
    } as BuildConfig);

    // Process JS files
    for (const output of result.outputs) {
      if (output.path.endsWith(".js")) {
        const content = await Bun.file(output.path).text();
        const vercelUrl = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : null;
        const liveReloadUrls = `"${CONFIG.SERVE_ORIGIN}"`;

        await Bun.write(
          output.path,
          content +
            (process.env.NODE_ENV !== "production"
              ? "\n" +
                liveReloadCode
                  .replace("PORT_NUMBER", CONFIG.SERVE_PORT.toString())
                  .replace("ORIGIN_URL", liveReloadUrls)
              : "")
        );
      }
    }

    currentBuildResult = { outputs: [...result.outputs, ...cssResult.outputs] };
    clients.forEach((client) => client.send("reload"));
    console.log("✅ Build complete");
  } catch (error) {
    console.error("❌ Build failed:", error);
    // Keep the previous build result if the new build fails
    if (!currentBuildResult) {
      throw error; // Only throw if we don't have a previous build
    }
  }
}

// Start the server once
const server = Bun.serve({
  port: CONFIG.SERVE_PORT,
  fetch(req) {
    const url = new URL(req.url);

    // Handle WebSocket connections
    if (url.pathname === "/_reload") {
      const upgraded = server.upgrade(req);
      if (!upgraded) {
        return new Response("Failed to upgrade", { status: 400 });
      }
      return;
    }

    return generateResponse(url.pathname, currentBuildResult?.outputs || []);
  },
  websocket: {
    open(ws: ServerWebSocket<unknown>) {
      clients.add(ws);
    },
    close(ws: ServerWebSocket<unknown>) {
      clients.delete(ws);
    },
    message() {},
  },
});

console.log(`Server running at ${CONFIG.SERVE_ORIGIN}`);

// Watch for changes and only rebuild
watch("src", { recursive: true }, async (event, filename) => {
  if (!filename) return;

  console.log(`File ${filename} has been ${event}`);

  // If the change is in the pages directory, we need to update the page list
  if (filename.startsWith("pages/")) {
    // Update the CONFIG.bun.entrypoints with the new page list
    const appFile = existsSync(resolve("src/app.ts"))
      ? "src/app.ts"
      : existsSync(resolve("src/app.js"))
      ? "src/app.js"
      : null;

    const pages = getPageFiles().map((page) => {
      return `src/pages/${page}`;
    });

    CONFIG.bun.entrypoints = [...(appFile ? [appFile] : []), ...pages];
  }

  try {
    await rebuildFiles();
  } catch (error) {
    console.error("❌ Build failed:", error);
    // Don't crash the server, just log the error
  }
});

// Initial build
rebuildFiles();
