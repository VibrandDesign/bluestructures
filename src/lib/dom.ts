import { type TransitionParams } from "@lib/pages";
import { createModules } from "@/modules/_/create";
import gsap from "@lib/gsap";

/*
Example Component Lifecycle

start() // starts the component, including obseerrver and such
animateIn() // animates the component in /triggered by the observer or manually
stop() // stops the component, including observer and such
animateOut() // animates the component out /triggered by the observer or manually
destroy() // destroys the component, including observer and such

page transition

pageOut() {
    stop()
    animateOut() (if in view)
    destroy()
}

pageIn() {
    start()
    animateIn()
}
*/

export class _Dom {
  private modules = createModules();

  constructor() {}

  #create() {
    this.modules = [];
    this.modules = createModules();
  }

  /** -- Lifecycles */

  async pageOut({ from, trigger, wrapper, destination }: TransitionParams) {
    // console.log(destination);

    await Promise.allSettled([
      // new Promise((resolve) => setTimeout(resolve, 100)),
      await gsap.to(wrapper, {
        duration: 0.3,
        opacity: 0,
      }),
      // ...
    ]);
  }

  async pageIn({ to, trigger, wrapper }: TransitionParams) {
    this.#create();

    await Promise.allSettled([
      // new Promise((resolve) => setTimeout(resolve, 100)),
      await gsap.to(wrapper, {
        duration: 0.8,
        opacity: 1,
      }),
      // ...
    ]);
  }
}

export const Dom = new _Dom();
