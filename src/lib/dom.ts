import { type TransitionParams } from "@lib/pages";
import { createModules } from "@/modules/_/create";
import gsap from "@lib/gsap";

export class _Dom {
  modules: any[] = createModules() || [];

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
