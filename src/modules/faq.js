import gsap from "@/lib/gsap";
import { reduced, ScrollTrigger } from "@/lib/gsap";
import { Scroll } from "@/lib/scroll";
import { onDestroy } from "@/modules/_";
import { prefersReducedMotion } from "@/utils/media";

/**
 * FAQ Accordion Component
 * Implements WCAG-compliant accordion pattern with GSAP animations
 * Supports reduced motion preferences
 * Includes FAQ Schema JSON-LD for SEO
 */
export default function (element, dataset) {
  // Get all FAQ items
  const faqItems = Array.from(element.querySelectorAll('[data-element="item"]'));
  
  if (!faqItems || faqItems.length === 0) {
    console.warn('faq: [data-element="item"] elements not found');
    return;
  }

  // Determine module index
  const moduleIndex = Array.from(
    document.querySelectorAll('[data-module="faq"]')
  ).indexOf(element);

  // Check if initial open is set
  const initialOpen = dataset.initialOpen === "true";
  
  // Store GSAP animations for cleanup
  const animations = new Map();
  
  // Check for reduced motion preference
  const prefersReduced = prefersReducedMotion();
  const animationDuration = prefersReduced ? 0 : 0.4;
  const animationEase = "Power2.out";

  /**
   * Update ScrollTrigger and Lenis after accordion height changes
   */
  function updateScrollSystems() {
    // Use requestAnimationFrame to ensure DOM updates are complete
    requestAnimationFrame(() => {
      // Refresh ScrollTrigger to recalculate positions
      ScrollTrigger.refresh();
      
      // Resize Lenis to recalculate scroll limits
      if (Scroll && typeof Scroll.resize === 'function') {
        Scroll.resize();
      }
    });
  }

  /**
   * Extract text content from an element, handling nested elements
   */
  function getTextContent(element) {
    return element.textContent?.trim() || "";
  }

  /**
   * Extract HTML content from an element
   */
  function getHtmlContent(element) {
    return element.innerHTML?.trim() || "";
  }

  /**
   * Initialize ARIA attributes for all FAQ items
   */
  function initializeAriaAttributes() {
    faqItems.forEach((item, itemIndex) => {
      const button = item.querySelector('.faq_item_trigger');
      const dropdown = item.querySelector('.faq_item_dropdown');
      
      if (!button || !dropdown) {
        console.warn(`faq: Missing button or dropdown for item ${itemIndex}`);
        return;
      }

      // Generate IDs based on module and item index
      const buttonId = `faq-${moduleIndex}-${itemIndex}`;
      const dropdownId = `faq-${moduleIndex}-${itemIndex}-panel`;

      // Set button attributes
      button.id = buttonId;
      button.setAttribute('aria-controls', dropdownId);
      
      // Set dropdown attributes
      dropdown.id = dropdownId;
      dropdown.setAttribute('aria-labelledby', buttonId);
      
      // Set initial aria-expanded state
      const isInitiallyOpen = initialOpen && itemIndex === 0;
      button.setAttribute('aria-expanded', isInitiallyOpen ? 'true' : 'false');
      
      // Set initial hidden state for closed items
      if (!isInitiallyOpen) {
        dropdown.setAttribute('hidden', '');
      }
    });
  }

  /**
   * Open accordion item with GSAP animation
   */
  function openAccordion(item, button, dropdown) {
    // Remove hidden attribute before animation
    dropdown.removeAttribute('hidden');
    
    // Get the actual height
    const height = dropdown.scrollHeight;
    
    // Set initial state
    gsap.set(dropdown, {
      height: 0,
      opacity: 0,
    });

    // Animate to full height and opacity
    const animation = gsap.to(dropdown, {
      height: height,
      opacity: 1,
      duration: animationDuration,
      ease: animationEase,
      onUpdate: () => {
        // Update ScrollTrigger and Lenis after height change
        updateScrollSystems();
      },
      onComplete: () => {
        // Set height to auto after animation completes
        gsap.set(dropdown, {
          height: 'auto',
        });
        
        
      }
    });

    // Rotate icon
    const icon = button.querySelector('.faq_item_trigger_icon');
    if (icon) {
      gsap.to(icon, {
        rotation: 90,
        duration: animationDuration,
        ease: animationEase
      });
    }

    // Update ARIA attributes
    button.setAttribute('aria-expanded', 'true');
    
    // Store animation for potential cleanup
    animations.set(dropdown, animation);
  }

  /**
   * Close accordion item with GSAP animation
   */
  function closeAccordion(item, button, dropdown) {
    // Get current height
    const height = dropdown.scrollHeight;
    
    // Set height to actual height before animating
    gsap.set(dropdown, {
      height: height,
      overflow: 'hidden'
    });

    // Animate to 0 height and opacity
    const animation = gsap.to(dropdown, {
      height: 0,
      opacity: 0,
      duration: animationDuration,
      ease: animationEase,
      onUpdate: () => {
        // Update ScrollTrigger and Lenis after height change
        updateScrollSystems();
      },
      onComplete: () => {
        // Set hidden attribute after animation completes
        dropdown.setAttribute('hidden', '');
          
      }
    });

    // Rotate icon back
    const icon = button.querySelector('.faq_item_trigger_icon');
    if (icon) {
      gsap.to(icon, {
        rotation: 0,
        duration: animationDuration,
        ease: animationEase
      });
    }

    // Update ARIA attributes
    button.setAttribute('aria-expanded', 'false');
    
    // Store animation for potential cleanup
    animations.set(dropdown, animation);
  }

  /**
   * Close all accordion items except the specified one
   */
  function closeAllExcept(excludeItem) {
    faqItems.forEach((item) => {
      // Skip the item we want to keep open
      if (item === excludeItem) return;
      
      const button = item.querySelector('.faq_item_trigger');
      const dropdown = item.querySelector('.faq_item_dropdown');
      
      if (!button || !dropdown) return;
      
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      
      // Close if currently expanded
      if (isExpanded) {
        closeAccordion(item, button, dropdown);
      }
    });
  }

  /**
   * Toggle accordion item
   * Only one accordion can be open at a time per module
   */
  function toggleAccordion(item, button, dropdown) {
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    
    if (isExpanded) {
      // If clicking on an already open accordion, close it
      closeAccordion(item, button, dropdown);
    } else {
      // Before opening, close all other accordions in this module
      closeAllExcept(item);
      // Then open the clicked accordion
      openAccordion(item, button, dropdown);
    }
  }

  /**
   * Handle keyboard events (WCAG compliance)
   */
  function handleKeyDown(event, button, dropdown) {
    const key = event.key;
    
    // Space or Enter toggles the accordion
    if (key === ' ' || key === 'Enter') {
      event.preventDefault();
      const item = button.closest('[data-element="item"]');
      toggleAccordion(item, button, dropdown);
    }
  }

  /**
   * Setup event listeners for all FAQ items
   */
  function setupEventListeners() {
    faqItems.forEach((item, itemIndex) => {
      const button = item.querySelector('.faq_item_trigger');
      const dropdown = item.querySelector('.faq_item_dropdown');
      
      if (!button || !dropdown) return;

      // Click handler
      button.addEventListener('click', () => {
        toggleAccordion(item, button, dropdown);
      });

      // Keyboard handler
      button.addEventListener('keydown', (event) => {
        handleKeyDown(event, button, dropdown);
      });
    });
  }

  /**
   * Initialize accordion state (open first item if initialOpen is true)
   */
  function initializeAccordionState() {
    if (initialOpen && faqItems.length > 0) {
      const firstItem = faqItems[0];
      const firstButton = firstItem.querySelector('.faq_item_trigger');
      const firstDropdown = firstItem.querySelector('.faq_item_dropdown');
      
      if (firstButton && firstDropdown) {
        // Set initial state without animation
        firstDropdown.removeAttribute('hidden');
        gsap.set(firstDropdown, {
          height: 'auto',
          opacity: 1
        });
        
        // Rotate icon
        const icon = firstButton.querySelector('.faq_item_trigger_icon');
        if (icon) {
          gsap.set(icon, { rotation: 90 });
        }
        
        // Update ScrollTrigger and Lenis after initial open
        updateScrollSystems();
      }
    }
  }

  /**
   * Generate and inject FAQ Schema JSON-LD
   */
  function generateFAQSchema() {
    const faqData = faqItems.map((item) => {
      const button = item.querySelector('.faq_item_trigger');
      const dropdown = item.querySelector('.faq_item_dropdown');
      
      if (!button || !dropdown) return null;

      const question = getTextContent(button.querySelector('span:first-of-type'));
      const answerElement = dropdown.querySelector('.w-richtext');
      // Use HTML content for answer to support headings, lists, paragraphs, etc.
      const answer = answerElement ? getHtmlContent(answerElement) : getHtmlContent(dropdown);

      if (!question || !answer) return null;

      return {
        "@type": "Question",
        "name": question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": answer
        }
      };
    }).filter(Boolean);

    if (faqData.length === 0) return;

    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqData
    };

    // Check if script already exists
    const existingScript = document.querySelector(`script[data-faq-schema="${moduleIndex}"]`);
    if (existingScript) {
      existingScript.textContent = JSON.stringify(schema, null, 2);
    } else {
      // Create and inject script tag
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-faq-schema', moduleIndex.toString());
      script.textContent = JSON.stringify(schema, null, 2);
      document.head.appendChild(script);
    }
  }

  /**
   * Handle resize events to update accordion heights
   */
  function handleResize() {
    faqItems.forEach((item) => {
      const button = item.querySelector('.faq_item_trigger');
      const dropdown = item.querySelector('.faq_item_dropdown');
      
      if (!button || !dropdown) return;
      
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      
      // Only update if expanded and not currently animating
      if (isExpanded && !dropdown.hasAttribute('hidden')) {
        const animation = animations.get(dropdown);
        if (!animation || !animation.isActive()) {
          // Get new height and update if different
          const newHeight = dropdown.scrollHeight;
          const currentHeight = gsap.getProperty(dropdown, 'height');
          
          if (typeof currentHeight === 'number' && Math.abs(currentHeight - newHeight) > 1) {
            gsap.set(dropdown, {
              height: newHeight
            });
          }
        }
      }
    });
  }

  // Initialize everything
  initializeAriaAttributes();
  setupEventListeners();
  initializeAccordionState();
  generateFAQSchema();

  // Set initialized attribute
  element.setAttribute('data-initialized', 'true');

  // Setup resize listener
  const resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(element);

  // Cleanup function
  onDestroy(() => {
    // Remove initialized attribute
    element.removeAttribute('data-initialized');

    // Kill all animations
    animations.forEach((animation) => {
      if (animation && animation.kill) {
        animation.kill();
      }
    });
    animations.clear();

    // Disconnect resize observer
    resizeObserver.disconnect();

    // Remove event listeners by cloning buttons (removes all listeners)
    faqItems.forEach((item) => {
      const button = item.querySelector('.faq_item_trigger');
      if (button && button.parentNode) {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
      }
    });

    // Remove schema script
    const schemaScript = document.querySelector(`script[data-faq-schema="${moduleIndex}"]`);
    if (schemaScript) {
      schemaScript.remove();
    }
  });
}

