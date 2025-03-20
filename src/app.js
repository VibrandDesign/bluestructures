import { something } from "@modules/something.js";

// console.log(process.env.NODE_ENV);

export class App {
  constructor() {
    console.log("App3");
  }
}

// something();

const app = new App();
