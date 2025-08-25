import { Scroll } from "@lib/scroll";
import { Pages } from "@lib/pages";

// history.scrollRestoration = "manual";

class _App {
  private scroll = Scroll;
  pages = Pages;

  constructor() {}
}

export const App = new _App();
