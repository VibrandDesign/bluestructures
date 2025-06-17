import { Module, Observe, Track } from "@modules/_";

export class Inview extends Track {
  constructor(element) {
    super(element);
    console.log(this.element);
  }

  track(value) {
    console.log("scroll", value);
  }
}
