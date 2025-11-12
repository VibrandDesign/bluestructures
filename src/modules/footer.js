import { onMount } from "@/modules/_";

/**
 * Footer Module
 * Automatically updates the copyright year if it differs from the current year
 */
export default function (element, dataset) {
  /**
   * Update the year in the footer if it differs from the current year
   */
  function updateYear() {
    const yearElement = element.querySelector('[data-element="year"]');
    
    if (!yearElement) {
      console.warn('footer: Year element not found');
      return;
    }

    const currentYear = new Date().getFullYear().toString();
    const displayedYear = yearElement.textContent.trim();

    // Only update if the year differs
    if (displayedYear !== currentYear) {
      yearElement.textContent = currentYear;
    }
  }

  /**
   * Initialize on mount
   */
  onMount(() => {
    updateYear();
  });
}

