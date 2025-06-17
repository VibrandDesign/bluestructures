import { Module, Observe, Track } from "@modules/_";

export class Inview extends Track {
  constructor(element) {
    super(element);
    // console.log(this.element);
  }

  /**
   value from 0 to 1 tracking the it position in the element
   */

  track(value) {
    // console.log("scroll", value);
  }

  /**
   Callbacks that mark the elemnt being in or out,
   including the direction of entry or exit (1 or -1, up or down)
   */

  isIn(data) {
    // console.log("isIn", data);
  }

  isOut(data) {
    // console.log("isOut", data);
  }
}
