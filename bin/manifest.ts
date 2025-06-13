import { writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

interface BuildOutput {
  path: string;
  size: number;
  type: string;
}

interface DistFile {
  path: string;
  size: number;
  type: string;
  lastModified: string;
}

interface BuildManifest {
  timestamp: string;
  javascript: {
    files: BuildOutput[];
  };
  css: {
    files: BuildOutput[];
  };
  distFiles: DistFile[];
}

function getDistFiles(distPath: string): DistFile[] {
  const files: DistFile[] = [];

  function scanDirectory(dir: string) {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else {
        const stats = statSync(fullPath);
        const relativePath = fullPath.replace(distPath, "").replace(/^\//, "");
        files.push({
          path: relativePath,
          size: stats.size,
          type: entry.name.split(".").pop() || "",
          lastModified: stats.mtime.toISOString(),
        });
      }
    }
  }

  scanDirectory(distPath);
  return files;
}

export function generateBuildManifest(
  jsResult: any,
  cssResult: any
): BuildManifest {
  const distPath = join(process.cwd(), "dist");

  return {
    timestamp: new Date().toISOString(),
    javascript: {
      files: Array.from(jsResult.outputs.values()).map((output: any) => ({
        path: output.path,
        size: output.size,
        type: output.type,
      })),
    },
    css: {
      files: Array.from(cssResult.outputs.values()).map((output: any) => ({
        path: output.path,
        size: output.size,
        type: output.type,
      })),
    },
    distFiles: getDistFiles(distPath),
  };
}

export function saveManifestFiles(manifest: BuildManifest) {
  const distPath = join(process.cwd(), "dist");

  // Save JSON manifest
  const manifestPath = join(distPath, "build-manifest.json");
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n📝 Build manifest saved to: ${manifestPath}`);

  // Generate and save HTML page
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
        h2 {
            color: #444;
            margin-top: 2rem;
            margin-bottom: 1rem;
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
        .file-list {
            background-color: #fff;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .file-item {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid #eee;
        }
        .file-item:last-child {
            border-bottom: none;
        }
        .file-path {
            font-family: monospace;
            color: #0066cc;
            text-decoration: none;
            transition: color 0.2s ease;
        }
        .file-path:hover {
            color: #004499;
            text-decoration: underline;
        }
        .file-info {
            color: #666;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <h1>Build Manifest</h1>
    <div class="timestamp">Generated at: ${new Date().toLocaleString()}</div>
    
    <h2>All Files in Dist Directory</h2>
    <div class="file-list">
        ${manifest.distFiles
          .map(
            (file) => `
            <div class="file-item">
                <a href="${file.path}" target="_blank" class="file-path">${
              file.path
            }</a>
                <span class="file-info">
                    ${(file.size / 1024).toFixed(2)} KB • 
                    ${file.type.toUpperCase()} • 
                    Last modified: ${new Date(
                      file.lastModified
                    ).toLocaleString()}
                </span>
            </div>
        `
          )
          .join("")}
    </div>

    <h2>Full Manifest</h2>
    <pre>${JSON.stringify(manifest, null, 2)}</pre>
</body>
</html>`;

  const htmlPath = join(distPath, "index.html");
  writeFileSync(htmlPath, htmlContent);
  console.log(`\n📄 Build manifest HTML page saved to: ${htmlPath}`);
}
