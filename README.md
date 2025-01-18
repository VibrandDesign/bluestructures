# Webflow Developer Setup

My (as fast as it can get) dev setup for using big boys code inside of Webflow, bundling and css splitting, with live reload.

**If you're setting up for the first time please [read these instructions](./docs/setup.md)**

Here's a set of commands you should run from yout project(s) folder to get up and running.

```shell
# create folder for your new project
mkdir {PROJECT_NAME}

# get into that folder
cd {PROJECT_NAME}

# clone this repo inside your folder
degit vallafederico/...

# install all base packages
bun install

# start the dev server
bun dev
```

#### Capabilities

##### Baseline

Bundle js and handle packages.
Bundle css and handle @imports
CI/CD
Live Reload

##### Api & Scripts

#### Rationale

Develoopment on webflow. Fast. Direct deployment, CI/CD. Both js and css. Live reload. Git Integration.

## Usage

This is a place where you can write your code, have it deploy on webflow both in dev and in production. You'll install packages (instead of using CDNs), create a bundle and see it do its magic on your website.

Assuming you've followed the first [first install guide](./docs/setup.md), what follows are instructions for setting up every time you start a new project, and generally on how to use the project.

---

### Webflow Project Setup

#### Javascript

To leverage CI/CD you'll have to deploy the website to vercel before going through this first section. DO it either via

This is the script tag for our webflow project. My take is put it in the `head` code, and with the `defer` tag you'll (in most cases) get the best performance you can get.

```html
<!-- How to get the dual script working -->
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

> This assumes you're bundling a single script, not a script per page. If you want a script per page you'll have to modify the config and have one of this script tag per script.

#### CSS

> WATCH OUT! The setup for the file that's used inside the designer, since we can't use javascript in it, it's a bit wobbly. Meaning the two files will be active at the same time, and this can cause some issues. Here's what those are and how yu can fix those.

Usually I use 2 additional stylesheet. One to be displayed in the designer, and one to be displayed only on the deployed website (ie to unhide preloader that block the view and stuffs).

```html
<!-- this goes in the project settings, and it's not going to be active inside the designer -->
<link
  rel="stylesheet"
  href="http://localhost:6545/styles/out.css"
  onerror="this.onerror=null;this.href='{YOUR VERCEL PROJECT URL}/styles/out.css'"
/>

<!-- this will be active inside the designer and can cause the aforementioned issues. suggestion is to put it inside a code embed made into a component -->
<link rel="stylesheet" href="{YOUR VERCEL PROJECT URL}/styles/out.css" />
<link rel="stylesheet" href="http://localhost:6545/styles/index.css" />
```

Congrats, you're (hopefully) now up and running.

### Simple Dev

```shell
bun dev
```

Will run the script in dev mode. If you've linked the script correctly you should see something in the console and your script running.

When you push to git or run vercel deploy your last script version will be live on the website and will be seen by it's users. If you have the dev script running you'll see the dev one instead.
Pretty cool uh.

To install packages you can just use

```shell
bun add {PACKAGE_NAME}
```

and then import those in your files as recommended by the package.

```javascript
import { something } from "something";
```

[Usage Examples]()

#### Concepts

You'll work inside the `src/` folder, and `app.js` is your main javascript entry points. You'll use this to import other scripts.

If you'll use multiple files as entry point (ie one per page), after you've modified the config for that, you might want to rename your entry points accordingly (`home.js`, `about.js`, ...).

Same goes for `.css` files and `styles/index.css`.

You'll find some basic wasy of handling in the project itself.

---

### Api deployment

This allows you create API routes, handled by vercel. Use if for whatever. You can make cronjobs to scrape websites, API calls that fill your CMS of items automagically. Whatever. SOme examples will eventually come.

This levergaes vercel `api` route.

To run those locally.

```shell
bun api
```

To run those locally with vercel capabilities.

```shell
vercel dev
```

Those will auto deploy when deploying to vercel.

---

### Script Running

This is the setup to run scripts form your terminal. Again, do whatever. Good example is to run CMS migration from an old website (ie Wordpress), upload CMS items in one swoop.

TBD
