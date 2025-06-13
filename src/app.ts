import { createModules } from "./modules/_/create";

class App {
  constructor() {
    console.log("app.js/ts::", performance.now());
    this.init();
  }

  init() {
    const modules = createModules();
  }
}

new App();
