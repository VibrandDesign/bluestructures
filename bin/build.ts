import { CONFIG } from "./config";

async function build() {
  console.log("📦 Building production bundle...");
  try {
    await Bun.build({
      entrypoints: CONFIG.ENTRY_POINTS,
      outdir: CONFIG.BUILD_DIRECTORY,
      minify: CONFIG.MINIFY,
      sourcemap: CONFIG.SOURCEMAP,
      experimentalCss: CONFIG.EXPERIMENTAL_CSS,
    });
    console.log("✅ Build complete!");
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

build();
