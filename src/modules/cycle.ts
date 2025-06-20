import {
  onMount,
  onDestroy,
  onPage,
  onView,
  onTrack,
  onPageIn,
} from "@/modules/_";
import gsap from "@lib/gsap";
// import { Raf, Resize } from "@/lib/subs";

export default function (element: HTMLElement, dataset: DOMStringMap) {
  console.log("cycle", element);

  onPageIn(async () => {
    // await gsap.to(element, {
    //   duration: 1,
    //   backgroundColor: "green",
    // });
  });

  onMount(() => {
    element.style.backgroundColor = "red";
    console.log("onMount");
  });

  // App.state.on("something", () => {});

  onPage(async () => {
    await gsap.to(element, {
      duration: 1,
      backgroundColor: "blue",
    });

    await gsap.to(element, {
      duration: 1,
      autoAlpha: 0,
    });
  });

  const observer = onView(element, {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
    autoStart: true,
    once: false,
    callback: ({ isIn }) => {
      console.log("inView", isIn);
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
    console.log("onDestroy");
  });

  // return () => {};
}
