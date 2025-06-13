import { CONFIG } from "./config";
import type { BuildConfig } from "bun";
// console.log(process.env.NODE_ENV);

async function build() {
  console.log("📦 Building production bundle...");
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
    });

    console.log("✅ Build complete!");
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

build();
