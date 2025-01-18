# Webflow Developer Setup

My (as fast as it can get) dev setup for using big boys code inside of Webflow, bundling and css splitting, with live reload.

**Needs**

A terminal (also the one inside VScode or something is fine). A code editor (VScode, Cursor, whatever). A vercel account.

| **Package** | **Why**          | **???** |
| ----------- | ---------------- | ------- |
| Bun         | because YES      |
| Vercel      | CI/CD, Functions |

```shell
pnpm i -g vercel bun
```

```shell
yarn global add vercel bun
```

```shell
npm i -g vercel bun
```

> If you are on windows godspeed go google how to install those stuffs I have no idea I'm sorry good luck

Strongly suggesting also degit so you can get a clean version when you start a new project without git history.

```shell
pnpm i -g degit
```

#### Capabilities

##### Baseline

Bundle js and handle packages.
Bundle css and handle @imports
CI/CD
Live Reload

##### Api & Scripts

#### Rationale

Develoopment on webflow. Fast. Direct deployment, CI/CD. Both js and css.Live reload.

---

## Installation & Setup

```html
<!-- How to get the dual script working -->
<script>
  function onErrorLoader() {
    const script = document.createElement("script");
    script.src = "...";
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

### Simple Dev

### Script Running

### Api deployment
