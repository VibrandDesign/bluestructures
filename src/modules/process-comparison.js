import gsap from "@/lib/gsap";
import { reduced } from "@/lib/gsap";
import { onDestroy, onMount } from "@/modules/_";

/**
 * Process Comparison Tab Component
 * Implements WCAG-compliant tabs with automatic activation
 * Only active on mobile (max-width: 767px)
 */
export default function processComparison(element) {
  // Media query for mobile only
  const mobileMediaQuery = window.matchMedia("(max-width: 767px)");

  // Get all necessary elements
  const tablist = element.querySelector('[role="tablist"]');
  const tabs = Array.from(element.querySelectorAll('.process-comparison_tablist_button'));
  const panels = Array.from(element.querySelectorAll(".process-comparison_panel"));

  if (!tablist || tabs.length === 0 || panels.length === 0) {
    console.warn("Process comparison: Missing required elements");
    return;
  }

  // Generate unique IDs based on element's position in DOM
  const componentIndex = Array.from(
    document.querySelectorAll('[data-module="process-comparison"]')
  ).indexOf(element);

  // Set up ARIA attributes (always, regardless of media query)
  tabs.forEach((tab, index) => {
    const tabId = `process-comparison-tab-${componentIndex}-${index}`;
    const panelId = `process-comparison-panel-${componentIndex}-${index}`;
    const panel = panels[index];

    // Set tab attributes
    tab.setAttribute("role", "tab");
    tab.id = tabId;
    tab.setAttribute("aria-controls", panelId);
    
    // Set panel attributes
    if (panel) {
      panel.id = panelId;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("tabindex", "0");
      
      // Find and use the h4 heading inside the panel as label
      const heading = panel.querySelector(".process-comparison_panel_header_title");
      if (heading) {
        const headingId = `process-comparison-heading-${componentIndex}-${index}`;
        heading.id = headingId;
        panel.setAttribute("aria-labelledby", headingId);
      }
    }
  });

  // Store cleanup functions
  let cleanup = null;

  /**
   * Initialize the tab component interactions
   */
  function init() {
    // Only initialize interactions on mobile
    if (!mobileMediaQuery.matches) {
      return;
    }

    // State management
    let currentIndex = 0;
    let isAnimating = false;

    /**
     * Update CSS variables for the active tab indicator
     */
    const updateIndicatorPosition = (index, animate = true) => {
      const activeTab = tabs[index];
      if (!activeTab) return;

      const tablistRect = tablist.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();

      const width = tabRect.width;
      const height = tabRect.height;
      const left = tabRect.left - tablistRect.left;

    gsap.set(tablist, {
        "--width": `${width}px`,
        "--height": `${height}px`,
        "--left": `${left}px`,
    });
      
    };

    /**
     * Switch to a specific tab
     */
    const switchTab = async (newIndex, animate = true) => {
      if (newIndex === currentIndex || isAnimating || newIndex < 0 || newIndex >= tabs.length) {
        return;
      }

      isAnimating = true;

      const oldPanel = panels[currentIndex];
      const newPanel = panels[newIndex];
      const oldTab = tabs[currentIndex];
      const newTab = tabs[newIndex];

      // Update ARIA attributes
      oldTab.setAttribute("aria-selected", "false");
      oldTab.setAttribute("tabindex", "-1");
      newTab.setAttribute("aria-selected", "true");
      newTab.removeAttribute("tabindex");

      // Focus the new tab (automatic activation)
      newTab.focus();

      const rotateDegree = 2;

      // Update indicator position
      updateIndicatorPosition(newIndex, animate);

      // Animate panel transition
      if (animate && !reduced) {
        // Fade out old panel
        await gsap.to(oldPanel, {
            transformOrigin: "bottom center",
            rotateZ: currentIndex == 0 ? `-${rotateDegree}deg` : `${rotateDegree}deg`,
          opacity: 0,
          duration: 0.3,
          ease: "power2.inOut",
        });

        // Hide old panel
        oldPanel.style.display = "none";
        newPanel.style.display = "flex";

        // Fade in new panel
        gsap.fromTo(
          newPanel,
          { opacity: 0,
            transformOrigin: "bottom center",
            rotateZ: currentIndex == 0 ? `${rotateDegree}deg` : `-${rotateDegree}deg`,
           },
          {
            rotateZ: '0deg',
            opacity: 1,
            duration: 0.4,
            ease: "power2.inOut",
          }
        );
      } else {
        // Instant switch for reduced motion
        oldPanel.style.display = "none";
        newPanel.style.display = "flex";
        gsap.set(oldPanel, { opacity: 0 });
        gsap.set(newPanel, { opacity: 1 });
      }

      

      currentIndex = newIndex;
      isAnimating = false;
    };

    /**
     * Keyboard navigation handler
     */
    const handleKeydown = (event) => {
      const { key } = event;
      let newIndex = currentIndex;
      let handled = false;

      switch (key) {
        case "ArrowRight":
          newIndex = (currentIndex + 1) % tabs.length;
          handled = true;
          break;
        case "ArrowLeft":
          newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
          handled = true;
          break;
        case "Home":
          newIndex = 0;
          handled = true;
          break;
        case "End":
          newIndex = tabs.length - 1;
          handled = true;
          break;
      }

      if (handled) {
        event.preventDefault();
        switchTab(newIndex);
      }
    };

    /**
     * Click handler for tabs
     */
    const handleTabClick = (event) => {
      const tab = event.currentTarget;
      const newIndex = tabs.indexOf(tab);
      if (newIndex !== -1) {
        switchTab(newIndex);
      }
    };

    // Add event listeners
    tabs.forEach((tab) => {
      tab.addEventListener("click", handleTabClick);
      tab.addEventListener("keydown", handleKeydown);
    });

    // Initialize first tab as active
    tabs[0].setAttribute("aria-selected", "true");
    tabs[0].removeAttribute("tabindex");
    
    // Set all other tabs to inactive
    tabs.slice(1).forEach((tab) => {
      tab.setAttribute("aria-selected", "false");
      tab.setAttribute("tabindex", "-1");
    });

    // Hide all panels except the first one
    panels.forEach((panel, index) => {
      if (index === 0) {
        panel.style.display = "flex";
        gsap.set(panel, { opacity: 1 });
      } else {
        panel.style.display = "none";
        gsap.set(panel, { opacity: 0 });
      }
    });

    // Set initial indicator position
    updateIndicatorPosition(0, false);

    // Mark as initialized
    element.setAttribute("data-initialized", "");

    // Handle window resize
    const handleResize = () => {
      if (mobileMediaQuery.matches) {
        updateIndicatorPosition(currentIndex, false);
      }
    };

    window.addEventListener("resize", handleResize);

    // Store cleanup function
    cleanup = () => {
      // Remove event listeners
      tabs.forEach((tab) => {
        tab.removeEventListener("click", handleTabClick);
        tab.removeEventListener("keydown", handleKeydown);
      });
      window.removeEventListener("resize", handleResize);
      
      // Reset all inline styles on panels
      panels.forEach((panel) => {
        panel.style.display = "";
        panel.style.opacity = "";
      });
      
      // Reset CSS variables on tablist
      gsap.set(tablist, {
        "--width": "0px",
        "--height": "0px",
        "--left": "var(--save-space)",
      });
      
      // Reset ARIA selected states to initial state
      tabs.forEach((tab, index) => {
        if (index === 0) {
          tab.setAttribute("aria-selected", "true");
          tab.removeAttribute("tabindex");
        } else {
          tab.setAttribute("aria-selected", "false");
          tab.setAttribute("tabindex", "-1");
        }
      });
      
      // Remove initialized attribute
      element.removeAttribute("data-initialized");
    };
  }

  /**
   * Handle media query changes
   */
  function handleMediaChange(e) {
    if (e.matches) {
      // Mobile: Initialize
      init();
    } else {
      // Desktop: Cleanup
      if (cleanup) {
        cleanup();
        cleanup = null;
      }
    }
  }

  // Register lifecycle hooks
  onMount(() => {
    // Initial check and setup
    if (mobileMediaQuery.matches) {
      init();
    }

    // Listen for media query changes
    mobileMediaQuery.addEventListener("change", handleMediaChange);
  });

  onDestroy(() => {
    // Cleanup on destroy
    if (cleanup) {
      cleanup();
    }
    mobileMediaQuery.removeEventListener("change", handleMediaChange);
  });
}

