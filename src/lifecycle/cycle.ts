import { onMount, onDestroy, onPage, onView, onTrack } from "@/lifecycle/_";
import gsap from "@lib/gsap";

export default function (element: HTMLElement, dataset: DOMStringMap) {
  console.log("cycle", element);

  onMount(() => {
    // console.log("onMount");
    element.style.backgroundColor = "red";
  });

  onPage(async () => {
    await gsap.to(element, {
      duration: 0.2,
      backgroundColor: "blue",
    });

    await gsap.to(element, {
      duration: 1,
      autoAlpha: 0,
    });
  });

  onDestroy(() => {
    console.log("onDestroy");
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

  const track = onTrack(element, {
    bounds: [0, 1],
    top: "center",
    bottom: "center",
    callback: (value) => {
      //   console.log("track", value);
    },
  });
}
