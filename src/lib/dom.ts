import { type TransitionParams } from "@lib/pages";
import { createModules } from "@/modules/_/create";
import { createCycles, runDestroy, runMount, runPage } from "@/lifecycle/_";
import gsap from "@lib/gsap";

export class _Dom {
  modules: any[] = [];
  cycles: any[] = [];

  constructor() {
    this.#create();
  }

  #create() {
    this.modules = [];
    this.modules = createModules();

    this.cycles = createCycles();
    runMount();

    this.start();
  }

  /** -- Lifecycles */

  async pageOut({ from, trigger, wrapper, destination }: TransitionParams) {
    // console.log(destination);

    await Promise.allSettled([
      await runPage(),
      // new Promise((resolve) => setTimeout(resolve, 100)),
      // await gsap.to(wrapper, {
      //   duration: 0.3,
      //   opacity: 0,
      // }),
      // ...
    ]);

    this.destroy();
    runDestroy();
  }

  async pageIn({ to, trigger, wrapper }: TransitionParams) {
    this.#create();

    await Promise.allSettled([
      // new Promise((resolve) => setTimeout(resolve, 100)),
      // await gsap.to(wrapper, {
      //   duration: 0.2,
      //   opacity: 1,
      // }),
      // ...
    ]);
  }

  start() {
    this.modules.forEach((module) => {
      if (module.start) module.start();
    });
  }

  destroy() {
    this.modules.forEach((module) => {
      if (module.destroy) module.destroy();
    });
  }
}

export const Dom = new _Dom();
