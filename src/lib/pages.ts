import { App } from "@/app";
import { Dom } from "@lib/dom";
import { Core } from "@unseenco/taxi";
import { Transition } from "@lib/page-transitions";
import { Scroll } from "@lib/scroll";

const PAGES_CONFIG = {
  links: "a:not([target]):not([href^=\\#]):not([data-taxi-ignore])",
  removeOldContent: true,
  allowInterruption: false,
  bypassCache: false,
};

export interface TransitionParams {
  from?: Element | HTMLElement;
  to?: Element | HTMLElement;
  trigger: HTMLAnchorElement;
  wrapper: HTMLElement | any;
  destination?: string;
}

export class _Pages extends Core {
  constructor() {
    super({
      ...PAGES_CONFIG,
      transitions: {
        default: Transition,
      },
    });
  }

  async transitionOut({ from, trigger }: TransitionParams) {
    await Promise.allSettled([
      Dom.pageOut({
        from,
        trigger,
        wrapper: this.wrapper,
        destination: new URL(trigger.href).pathname,
      }),
      // Gl.pageOut(),
      // ...
    ]);

    Scroll.toTop();
  }

  async transitionIn({ to, trigger }: TransitionParams) {
    Scroll.resize();

    await Promise.allSettled([
      Dom.pageIn({ to, trigger, wrapper: this.wrapper }),
      // Gl.pageIn()
      // ...
    ]);
  }
}

export const Pages = new _Pages();
