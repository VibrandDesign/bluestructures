import { Module } from "@modules/_";

export class Inview extends Module {
  constructor(element) {
    super(element);
    console.log(this.element);
  }
}
