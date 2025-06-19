import { Scroll } from "@lib/scroll";
// import { Dom } from "@lib/dom";
import { Pages } from "@lib/pages";

// history.scrollRestoration = "manual";

class _App {
  private scroll = Scroll;
  // dom = Dom;
  pages = Pages;

  constructor() {}
}

export const App = new _App();
