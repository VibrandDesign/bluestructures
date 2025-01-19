# Understand and fixing dual script CSS issues.

Sadly I don't have a better solution. I was even thinking to make a chrome extension to handle the dual scripting capabilities but felt a bit overkill and personally I don't want to have to install more things than needed. I'll eventually make an Webflow app, but I'd prefer not to.

This is the CSS you'll want to have active inside the designer.

```html
<link rel="stylesheet" href="{YOUR VERCEL PROJECT URL}/styles/out.css" />
<link rel="stylesheet" href="http://localhost:6545/styles/index.css" />
```

Webflow doesn't allow us to execute javascript in here, so we can't make sure only a single script is active at a time.

What's happening here is the first CSS file that's active is the one from your last live deployment, coming from vercel.

The second one is instead the one you're running from your terminal, the one you're writing at the moment.

```css
/* deployed one */

.body {
  background-color: red;
}

/* local one */

.body {
  background-color: black;
}
```

In this example, the two files have a conflict, but it'll not be an issue even when actie at the same time. Since the same property is overridden by the last file, the background color will be black.

```css
/* deployed one */

.body {
  background-color: red;
}

/* local one */

.body {
  /* background-color: black; */
}
```

In this second example, the second background color is commented out. If you've set your background color in Webflow to blue, you might expect the body to honor that, but while your local script doesn't set the bg color anymore, the one you have deployed still will.

To fix this, if you see some weird behaviour in your CSS, my suggestion would be 1. comment out all related styles, 2. push so the deployed file doesn't set anything, 3. make the changes you want to make in your local file.

This way there will be no issues and you'll see exactly what you're getting.
