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
      sourcemap: "external",
      target: "browser",
      minify: process.env.NODE_ENV === "production",
    });

    console.log("✅ Build complete!");

    // Log all generated files
    console.log("\n📁 Generated files:");
    console.log("\nJavaScript files:");
    for (const output of result.outputs.values()) {
      console.log(`  - ${output.path}`);
    }

    console.log("\nCSS files:");
    for (const output of cssResult.outputs.values()) {
      console.log(`  - ${output.path}`);
    }
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

build();
