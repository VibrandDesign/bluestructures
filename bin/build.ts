import { CONFIG } from "./config";
import type { BuildConfig } from "bun";
import { writeFileSync } from "fs";
import { join } from "path";
// console.log(process.env.NODE_ENV);

async function build() {
  console.log("📦 Building production bundle...");
  try {
    // Build JS files
    const result = await Bun.build({
      ...(CONFIG.bun as BuildConfig),
    });

    console.log("result -> []", result);

    // Build CSS files separately
    const cssResult = await Bun.build({
      entrypoints: CONFIG.css.entrypoints,
      outdir: "dist",
      experimentalCss: true,
      sourcemap: "external",
      target: "browser",
    } as BuildConfig);

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

    // Generate build manifest
    const buildManifest = {
      timestamp: new Date().toISOString(),
      javascript: {
        files: Array.from(result.outputs.values()).map((output) => ({
          path: output.path,
          size: output.size,
          type: output.type,
        })),
      },
      css: {
        files: Array.from(cssResult.outputs.values()).map((output) => ({
          path: output.path,
          size: output.size,
          type: output.type,
        })),
      },
    };

    // Save build manifest to dist folder
    const manifestPath = join(process.cwd(), "dist", "build-manifest.json");
    writeFileSync(manifestPath, JSON.stringify(buildManifest, null, 2));
    console.log(`\n📝 Build manifest saved to: ${manifestPath}`);

    // Generate HTML page to display the manifest
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Build Manifest</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            background-color: #f5f5f5;
        }
        h1 {
            color: #333;
            margin-bottom: 2rem;
        }
        pre {
            background-color: #fff;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .timestamp {
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 1rem;
        }
    </style>
</head>
<body>
    <h1>Build Manifest</h1>
    <div class="timestamp">Generated at: ${new Date().toLocaleString()}</div>
    <pre>${JSON.stringify(buildManifest, null, 2)}</pre>
</body>
</html>`;

    const htmlPath = join(process.cwd(), "dist", "index.html");
    writeFileSync(htmlPath, htmlContent);
    console.log(`\n📄 Build manifest HTML page saved to: ${htmlPath}`);
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

build();
