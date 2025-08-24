import {
  onMount,
  onDestroy,
  onPageOut,
  onView,
  onTrack,
  onPageIn,
} from "@/modules/_";
import gsap from "@lib/gsap";
// import { Raf, Resize } from "@/lib/subs";/
import State from "@lib/hey";

export default function (element: HTMLElement, dataset: DOMStringMap) {
  // console.log("cycle", element);
  // State.on("something", () => {});

  onPageIn(async () => {
    // console.log("onPageIn");
    await gsap.to(element, {
      duration: 0.2,
      backgroundColor: "green",
    });
  });

  onPageOut(
    async () => {
      console.log("onPageOut");
      await gsap.to(element, {
        duration: 1,
        backgroundColor: "blue",
      });

      await gsap.to(element, {
        duration: 1,
        autoAlpha: 0,
      });
    }
    // {
    //   element,
    // }
  );

  onMount(() => {
    // element.style.backgroundColor = "red";
    // console.log("onMount");
    observer.start();
  });

  const observer = onView(element, {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
    autoStart: false,
    once: false,
    callback: ({ isIn }) => {
      // console.log("inView", isIn);
    },
  });

  // const track = onTrack(element, {
  //   bounds: [0, 1],
  //   top: "center",
  //   bottom: "center",
  //   callback: (value) => {
  //     console.log("track", value);
  //   },
  // });

  onDestroy(() => {
    // console.log("onDestroy");
  });

  // return () => {};
}
