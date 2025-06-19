const modules = import.meta.glob("../*.{ts,js}", { eager: true });
// console.log("modules -> []", modules);

export function createCycles(dataAttribute = "cycle") {
  return Array.from(document.querySelectorAll(`[data-${dataAttribute}]`))
    .map((element) => {
      const attributeValue = (element as HTMLElement).dataset[dataAttribute];

      const modulePath = modules[`./../${attributeValue}.ts`]
        ? `./../${attributeValue}.ts`
        : `./../${attributeValue}.js`;

      if (modules[modulePath]) {
        // Expecting a default export function
        const moduleFn = (
          modules[modulePath] as {
            default: (el: HTMLElement, dataset: DOMStringMap) => any;
          }
        ).default;
        if (typeof moduleFn === "function") {
          try {
            return moduleFn(
              element as HTMLElement,
              (element as HTMLElement).dataset
            );
          } catch (error) {
            console.warn(
              `Failed to call default function for ${dataAttribute} "${attributeValue}":`,
              error
            );
            return null;
          }
        } else {
          console.warn(
            `Default export is not a function for ${dataAttribute} "${attributeValue}"`
          );
          return null;
        }
      } else {
        console.warn(`${dataAttribute} not found: "${attributeValue}"`);
        return null;
      }
    })
    .filter((item) => item !== null);
}
