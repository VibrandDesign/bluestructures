import { Scroll } from "@lib/scroll";
import { Dom } from "@lib/dom";
import { Pages } from "@lib/pages";

class _App {
  private scroll = Scroll;
  dom = Dom;
  pages = Pages;

  constructor() {
    console.log("app.js/ts::", performance.now());
  }
}

export const App = new _App();
