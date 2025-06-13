interface BuildOutput {
  path: string;
}

function generateIndexHtml(outputs: BuildOutput[]) {
  const jsLinks = outputs
    .filter(
      (output) =>
        output.path.endsWith(".js") && !output.path.endsWith(".js.map")
    )
    .map((output) => {
      const relativePath = output.path.split("/dist/")[1];
      return `<li>
        <a href="/${relativePath}" target="_blank">${relativePath}</a>
        <code class="script-tag">&lt;script defer src="http://localhost:3000/${relativePath}"&gt;&lt;/script&gt;</code>
      </li>`;
    })
    .join("\n");

  const cssLinks = outputs
    .filter((output) => output.path.endsWith(".css"))
    .map((output) => {
      const relativePath = output.path.split("/dist/")[1];
      return `<li>
        <a href="/${relativePath}" target="_blank">${relativePath}</a>
        <code class="script-tag">&lt;link rel="stylesheet" href="http://localhost:3000/${relativePath}"&gt;</code>
      </li>`;
    })
    .join("\n");

  const mapLinks = outputs
    .filter((output) => output.path.endsWith(".js.map"))
    .map((output) => {
      const relativePath = output.path.split("/dist/")[1];
      return `<li class="map-file"><a href="/${relativePath}" target="_blank">${relativePath}</a></li>`;
    })
    .join("\n");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Generated Files</title>
        <style>
          body { font-family: system-ui; padding: 2rem; }
          a { color: #0066cc; text-decoration: none; }
          a:hover { text-decoration: underline; }
          ul { list-style: none; padding: 0; }
          li { margin: 0.5rem 0; }
          .map-file { font-size: 0.8em; opacity: 0.5; }
          h2, h3 { margin-top: 2rem; }
          h2:first-child { margin-top: 0; }
          .script-tag {
            display: block;
            margin-top: 0.25rem;
            font-size: 0.9em;
            color: #666;
            font-family: monospace;
          }
        </style>
      </head>
      <body>
        <h2>JavaScript Files:</h2>
        <ul>${jsLinks}</ul>

        <h2>CSS Files:</h2>
        <ul>${cssLinks}</ul>
        
        ${mapLinks ? `<h3>Source Maps:</h3><ul>${mapLinks}</ul>` : ""}
      </body>
    </html>
  `;
}

export function generateResponse(filePath: string, outputs: BuildOutput[]) {
  // Ignore favicon requests
  if (filePath === "/favicon.ico") {
    return new Response(null, { status: 204 });
  }

  // Serve index page
  if (filePath === "/") {
    const html = generateIndexHtml(outputs);
    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  }

  // Serve files from dist
  const file = Bun.file(`dist${filePath}`);
  const contentType =
    {
      ".js": "application/javascript",
      ".css": "text/css",
      ".html": "text/html",
    }[filePath.match(/\.[^.]+$/)?.[0] || ""] || "text/plain";

  return new Response(file, {
    headers: {
      "Content-Type": contentType,
    },
  });
}
