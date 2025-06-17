import gsap from "@lib/gsap";

type SubscriberFn = (data: any) => void;

class Subscribable {
  #subscribers: { fn: SubscriberFn; priority: number; id: symbol }[] = [];

  add(fn: SubscriberFn, priority = 0, id = Symbol()) {
    const index = this.#subscribers.findIndex((sub) => sub.priority > priority);
    if (index === -1) {
      this.#subscribers.push({ fn, priority, id });
    } else {
      this.#subscribers.splice(index, 0, { fn, priority, id });
    }
    return () => this.remove(id);
  }

  remove(id: symbol) {
    this.#subscribers = this.#subscribers.filter((f) => f.id !== id);
  }

  notify(data: any) {
    if (this.#subscribers.length < 1) return;
    this.#subscribers.forEach((f) => f.fn(data));
  }
}

/** Raf */
class _Raf extends Subscribable {
  constructor() {
    super();
    gsap.ticker.add(this.update.bind(this));
  }

  update(deltaTime: number, time: number) {
    this.notify({ deltaTime, time: time * 0.01 });
  }
}

/** Resize */
class _Resize extends Subscribable {
  width = window.innerWidth;
  height = window.innerHeight;
  private timeoutId: number | null = null;
  private readonly debounceDelay = 100;

  constructor() {
    super();
    window.addEventListener("resize", this.update.bind(this));
  }

  update(data: any) {
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }

    this.timeoutId = window.setTimeout(() => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      if (newWidth !== this.width || newHeight !== this.height) {
        this.width = newWidth;
        this.height = newHeight;
        this.notify({ width: this.width, height: this.height });
      }

      this.timeoutId = null;
    }, this.debounceDelay);
  }
}

export const Raf = new _Raf();
export const Resize = new _Resize();
