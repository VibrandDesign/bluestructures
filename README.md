# Webflow Developer Setup

My (as fast as it can get) dev setup for using big boys code inside of Webflow, bundling and css splitting, with live reload.

_This is part of the lessons for [TheCodeFlowCo](https://www.thecodeflow.co/), but it felt too good to not share with everyone._

**If you're setting up for the first time please [read these instructions](./docs/setup.md)**

<details>

<summary> TLDR </summary>

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

</details>

**[Changelog](./docs/changelog.md)**

**[Rationale](./docs/rationale.md)**

## Usage

This is a local & deployed setup to write code in Webflow, from you code editor of choice. It automatically deploys to production for everyone to see, while allowing you to develop and see the changes you make without having to switch scritps. It makes it easy to bundle your packages and your code (instead of using CDNs), CSS included.
It also automatically handles live reload for when the dev script is running, so that your website reloads on save.

Supports deploying API routes if you ever need a server (think calling an API and creating CMS collections dinamically, scraping websites and generate content, ...).

Finally enables scripts to be run locally from the same project. Useful for example for uploading loads of CMS items from a spreadsheet or a site migration from wordpress.

None of this things are done automatically, and expect you to write the code. This is just the shell that makes it easy to dev, test and deploy.

Assuming you've followed the first [first install guide](./docs/setup.md), what follows are instructions for setting up every time you start a new project, and generally on how to use the project.

<details>

<summary> Multiple vs single entry points. </summary>
This guide is focussed on the way I work, with a single entry point. I do this since I'm most of the time either doing a single page or using page transitions, so I want all my js and css to live in a single source.

If this doesn't fit your needs, [here's some pointers on how to use with multiple entry points](./docs/multiple-entry-points.md).

</details>

Something that you might need to work with and understand is the `config.ts` file, [that sets up how this thing operates](./docs/config.md)

---

### Webflow Project Setup

#### Javascript

This is the script tag for our webflow project. My take is put it in the `head` code, and with the `defer` tag you'll (in most cases) get the best performance you can get.

<details>

<summary> Deploy to Vercel first! </summary>
To leverage CI/CD you'll have to deploy the website to vercel before going through this first section. Do it either via cli or by linking the project through the Vercel interface.

</details>

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

Usually I use 2 additional stylesheet. One to be displayed in the designer (`index.css`) and one to be displayed only on the deployed website (`out.css`), and that's why this is setup this way. You can add and modify your entrypoints as you please from the `config.ts` file.

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

> WATCH OUT! The setup for the file that's used inside the designer, since we can't use javascript in it, it's a bit wobbly. Meaning the two files will be active at the same time, and this can cause some issues. [Here's what those are and how you can fix those](./docs/css-issues.md).

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

[In depth examples](./docs/javascript.md)

Same goes for `css` files. It'll auto refresh when changes are made, you can use `@import` rules and combine multiple files into single ones.

#### Ideas

You'll work inside the `src/` folder, and `app.js` is your main javascript entry points. You'll use this to import other scripts.

<details>

<summary> Multiple entry points </summary>
If you'll use multiple files as entry point (ie one per page), after you've modified the config for that, you might want to rename your entry points accordingly (`home.js`, `about.js`, ...).

Same things for CSS.

You'll want to modify those in the `bin/config.ts`.

</details>

Same goes for `.css` files and `styles/index.css`.

---

### Api deployment

This allows you create API routes, handled by vercel. Use if for whatever. You can make cronjobs to scrape websites, API calls that fill your CMS of items automagically. Whatever. SOme examples will eventually come.

This levergaes vercel `api` route.

To run those locally.

```shell
bun api
```

To run those locally with vercel capabilities (recommended).

```shell
vercel dev
```

Those will auto deploy when deploying to vercel.

---

### Script Running

This is the setup to run scripts form your terminal. Again, do whatever. Good example is to run CMS migration from an old website (ie Wordpress), upload CMS items in one swoop.

TBD

---

You should almost never need this, but if you're curious about the inner workings and how this thing works [look here](./docs/bin.md)
