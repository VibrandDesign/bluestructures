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
const page: Array<() => Promise<void>> = [];

export function onPage(fn: () => Promise<void>) {
  page.push(fn);
}

export async function runPage() {
  await Promise.allSettled(page.map((fn) => fn()));
  page.length = 0;
  //   console.log("page -> []", page);
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
