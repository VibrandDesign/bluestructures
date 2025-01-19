# Webflow Developer Setup

> A lightning-fast development setup for professional Webflow development with bundling, CSS splitting, and live reload.

_Part of [TheCodeFlowCo](https://www.thecodeflow.co/) lessons, shared for the community._

## Quick Start

```bash
# Create and enter project directory
mkdir your-project && cd your-project

# Clone this repo
degit vallafederico/...

# Install dependencies
bun install

# Start development
bun dev
```

## Features

- 🚀 Local development with live reload
- 📦 Automatic bundling of JS and CSS
- 🔄 Seamless production deployment
- 🛠️ API routes support
- 💻 Local script execution
- ⚡ Optimized for speed

## Documentation

- [First-time Setup](./docs/setup.md)
- [Configuration Guide](./docs/config.md)
- [Changelog](./docs/changelog.md)
- [Project Rationale](./docs/rationale.md)

## Project Setup

### JavaScript Integration

Add this script to your Webflow project's head:

```html
<script>
  function onErrorLoader() {
    const script = document.createElement("script");
    script.src = "{YOUR VERCEL PROJECT URL/app.js}";
    script.defer = "true";
    document.head.appendChild(script);
  }
</script>

<script
  defer
  src="http://localhost:6545/app.js"
  onerror="onErrorLoader()"
></script>
```

### CSS Integration

Add these stylesheets to your Webflow project:

```html
<!-- Production CSS -->
<link
  rel="stylesheet"
  href="http://localhost:6545/styles/out.css"
  onerror="this.onerror=null;this.href='{YOUR VERCEL PROJECT URL}/styles/out.css'"
/>

<!-- Designer CSS -->
<link rel="stylesheet" href="{YOUR VERCEL PROJECT URL}/styles/out.css" />
<link rel="stylesheet" href="http://localhost:6545/styles/index.css" />
```

> **Note**: See [CSS setup notes](./docs/css-issues.md) for handling potential styling conflicts.

## Development Workflow

### Local Development

```bash
bun dev        # Start development server
bun add pkg    # Install packages
```

### API Development

```bash
bun api        # Run API locally
vercel dev     # Run with Vercel capabilities
```

## Advanced Topics

- [Multiple Entry Points](./docs/multiple-entry-points.md)
- [JavaScript Usage](./docs/javascript.md)
- [Internal Architecture](./docs/bin.md)

## Project Structure

```
src/
  ├── app.js           # Main JavaScript entry
  └── styles/
      └── index.css    # Main CSS entry
api/                   # API routes
bin/                   # Build scripts
docs/                  # Documentation
```

## Important stuffs

> **Note**: If you're not using any API routes, delete the api folder so you don't deploy random stuffs to vercel

## License

This project is licensed under the [MIT License](./LICENSE) © [Federico Valla](https://github.com/vallafederico)
