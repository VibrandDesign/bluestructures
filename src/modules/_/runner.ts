/*

mount()
destroy()

pageIn()
pageOut()

view()
track()


*/

import { Observe, ObserveConfig, Track } from "@/modules/_";

/** -- <stores> */
const destroy: Array<() => void> = [];
const mount: Array<() => void> = [];

/** -- <lifecycle> */
export function onMount(fn: () => void) {
  mount.push(fn);
}

export function onDestroy(fn: () => void) {
  destroy.push(fn);
}

export function runDestroy() {
  destroy.forEach((fn) => fn());
  destroy.length = 0;
  //   console.log("destroy -> []", destroy);
}

export function runMount() {
  mount.forEach((fn) => fn());
  mount.length = 0;
  //   console.log("mount -> []", mount);
}

/** -- <animation> */
const pageOut: Array<() => Promise<void>> = [];
const pageIn: Array<() => Promise<void>> = [];

export function onPageOut(
  fn: () => Promise<void>,
  { element }: { element?: HTMLElement } = {}
) {
  if (element) {
    let observer: Observe;

    queueMicrotask(() => {
      observer = onView(element, {
        threshold: 0,
        autoStart: true,
      });
    });

    pageOut.push(async () => {
      let { inView } = observer;
      console.log("observed", inView);

      // observer.destroy();
      if (inView) {
        return await fn();
      } else {
        return Promise.resolve();
      }
    });
  } else {
    pageOut.push(fn);
  }
}

export async function runPageOut() {
  await Promise.allSettled(pageOut.map((fn) => fn()));
  pageOut.length = 0;
  //   console.log("page -> []", page);
}

export function onPageIn(fn: () => Promise<void>) {
  pageIn.push(fn);
}

export async function runPageIn() {
  await Promise.allSettled(pageIn.map((fn) => fn()));
  pageIn.length = 0;
}

export function onView(
  element: HTMLElement,
  { root, rootMargin, threshold, autoStart, once, callback }: ObserveConfig
) {
  const observer = new Observe(element, {
    root,
    rootMargin,
    threshold,
    autoStart,
    once,
    callback,
  });

  onDestroy(() => {
    observer.destroy();
  });

  return observer;
}

export function onTrack(
  element: HTMLElement,
  config: {
    bounds?: [number, number];
    top?: "top" | "center" | "bottom";
    bottom?: "top" | "center" | "bottom";
    callback?: (value: number) => void;
  } = {}
) {
  const track = new Track(element, config);

  onDestroy(() => {
    track.destroy();
  });

  return track;
}
