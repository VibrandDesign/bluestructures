import { createModules } from "./modules/_/create";

export class App {
  constructor() {
    console.log("Single App File", performance.now());
    this.init();
  }

  init() {
    const modules = createModules();
  }
}

new App();
