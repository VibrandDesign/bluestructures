import { onMount, onDestroy } from "@/modules/_";
import { Resize } from "@/lib/subs";

/**
 * Parses the speed attribute from the dataset
 * @param {string} dataSpeed - JSON string like "{desktop: 1500, tablet: 1200, mobile-l: 1000, mobile: 800}"
 * @returns {Object} Parsed speed values by breakpoint
 */
function parseSpeedAttribute(dataSpeed) {
  try {
    // Remove curly braces and parse the key-value pairs
    const cleaned = dataSpeed
      .replace(/[{}]/g, "")
      .replace(/\\"/g, "")
      .replace(/"/g, "");
    
    const result = {};
    const pairs = cleaned.split(",");
    
    pairs.forEach((pair) => {
      const [key, value] = pair.split(":").map((s) => s.trim());
      result[key] = parseInt(value, 10);
    });
    
    return result;
  } catch (error) {
    console.error("Error parsing speed attribute:", error);
    return {};
  }
}

/**
 * Gets the current breakpoint based on window width
 * Matches the CSS media query breakpoints:
 * - Desktop: (min-width: 992px)
 * - Tablet: (max-width: 991px)
 * - Mobile-L: (max-width: 767px)
 * - Mobile: (max-width: 479px)
 * @param {number} width - Current window width
 * @returns {string} Current breakpoint name
 */
function getCurrentBreakpoint(width) {
  if (width >= 992) return "desktop";
  if (width >= 768 && width < 992) return "tablet";
  if (width >= 480 && width < 768) return "mobile-l";
  return "mobile";
}

/**
 * Sets the CSS variable based on current breakpoint
 * @param {HTMLElement} element - The component element
 * @param {Object} speeds - Speed values by breakpoint
 */
function updateSpeedVariable(element, speeds) {
  const currentBreakpoint = getCurrentBreakpoint(Resize.width);
  const speedValue = speeds[currentBreakpoint] || 0;
  const speedWithUnit = `${speedValue}ms`;
  element.style.setProperty("--speed", speedWithUnit);
}

export default function (element, dataset) {
  const listElement = element.querySelector('[role="list"]');
  
  if (!listElement) {
    console.warn("hero-marquee: No [role='list'] element found");
    return;
  }

  // Parse speed values from data-speed attribute
  const speeds = parseSpeedAttribute(dataset.speed || "{}");

  // Duplicate the list
  const clonedList = listElement.cloneNode(true);
  clonedList.setAttribute("aria-hidden", "true");
  
  // Insert the cloned list after the original
  listElement.parentElement.appendChild(clonedList);

  // Set initial speed variable
  updateSpeedVariable(element, speeds);

  // Subscribe to resize events to update speed on breakpoint changes
  let resizeUnsubscribe;
  
  onMount(() => {
    // Update speed variable on window resize
    resizeUnsubscribe = Resize.add(({ width }) => {
      updateSpeedVariable(element, speeds);
    });
    
    // Mark component as initialized
    element.setAttribute("data-initialized", "");
  });

  onDestroy(() => {
    if (resizeUnsubscribe) {
      resizeUnsubscribe();
    }
  });
}

