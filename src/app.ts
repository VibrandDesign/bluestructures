import { createModules } from "./modules/_/create";
import { Raf, Resize } from "@lib/subs";

class App {
  constructor() {
    console.log("app.js/ts::", performance.now());
    this.init();

    Raf.add(this.update.bind(this));
    Resize.add(this.resize.bind(this));
  }

  init() {
    const modules = createModules();
  }

  update(data: any) {
    // console.log("update", data);
  }

  resize(data: any) {
    console.log("resize", data);
  }
}

new App();
