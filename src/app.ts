import { Scroll } from "@lib/scroll";
import { Dom } from "@lib/dom";
import { Pages } from "@lib/pages";
import { apiPath } from "@utils/api-path";

// import handleEditor from "@webflow/detect-editor";

// history.scrollRestoration = "manual";

class _App {
  private scroll = Scroll;
  dom = Dom;
  pages = Pages;

  constructor() {
    console.log("app.js/ts::", performance.now());

    console.log("apiPath", apiPath("test"));

    fetch(apiPath("test"))
      .then((res) => res.json())
      .then((data) => {
        console.log("data", data);
      });
  }
}

export const App = new _App();
