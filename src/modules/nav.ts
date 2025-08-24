import State from "@lib/hey";

export default function (element: HTMLElement) {
  console.log("nav", element);

  State.on("PAGE", (data) => {
    console.log("page changed");
  });
}
