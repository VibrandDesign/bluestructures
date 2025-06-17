export class Module {
  element: HTMLElement;

  constructor(element: HTMLElement) {
    this.element = element;
  }

  /* -- animation
  animateIn > animate out
  animateOut > page out
  */

  async animateIn() {}
  async animateOut() {}

  /* -- lifecycle
  pageIn >
  pageOut >
  */

  async pageIn() {}
  async pageOut() {}

  /* -- functional
  start > modules observes, get ready, whatever
  stop > modules uobserves, stop, whatever
  destroy > all listeners and such get destroyed
  */

  start() {}
  stop() {}
  destroy() {}
}
