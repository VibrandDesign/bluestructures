import { Scroll } from "@lib/scroll";
import { Pages } from "@lib/pages";

// history.scrollRestoration = "manual";

const IMG_URL =
  "https://webflow-dev-setup-xi.vercel.app/public/bd.002_Bake6_CyclesBake_COMBINED.png";

class _App {
  private scroll = Scroll;
  pages = Pages;

  constructor() {
    const img = document.createElement("img");
    img.src = IMG_URL;
    console.log(img);
    document.body.appendChild(img);
  }
}

export const App = new _App();
