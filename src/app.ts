import { createModules } from "./modules/_/create";

class App {
  constructor() {
    console.log("Single App File", performance.now());
    this.init();
  }

  init() {
    const modules = createModules();
    console.log("modules -> []", modules);
  }
}

new App();
