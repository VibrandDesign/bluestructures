import { onMount, onDestroy } from "@/modules/_";
import { Resize } from "@/lib/subs";
import gsap from "@/lib/gsap";
import { ScrollTrigger } from "@/lib/gsap";
import { Scroll } from "@/lib/scroll";

/**
 * Benefits Scroll Module
 * Handles dynamic height calculations and CSS variables for the benefits section
 * with sticky navigation and scrollable cards
 */
export default function (element, dataset) {
  // Get the section and main elements
  const section = element.closest('section');
  const sectionInner = section?.querySelector('.section_inner');
  const mainElement = element.querySelector('[data-element="main"]');
  const cardsList = mainElement?.querySelector('.benefits-scroll_main_list');
  const cards = cardsList?.querySelectorAll('.benefits-scroll_main_list_item');
  const navLinks = element.querySelectorAll('.benefits-scroll_nav_list_item_link');

    const activeNavClass = 'is-active'

  if (!section || !sectionInner || !mainElement || !cardsList || !cards.length) {
    console.warn('benefits-scroll: Required elements not found');
    return;
  }

  if (navLinks.length !== cards.length) {
    console.warn('benefits-scroll: Number of nav links does not match number of cards');
  }

  // Store ScrollTrigger instances for cleanup
  const scrollTriggers = [];
  
  // Store main timeline reference for navigation
  let mainTimeline = null;

  /**
   * Gets the gap value from the CSS variable --item-gap
   */
  function getItemGap() {
    const gapValue = getComputedStyle(section).getPropertyValue('--item-gap').trim();
    // Convert rem to pixels
    if (gapValue.includes('rem')) {
      const remValue = parseFloat(gapValue);
      const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
      return remValue * rootFontSize;
    }
    return parseFloat(gapValue) || 0;
  }

  // Store measured card heights to ensure consistency
  let measuredCardHeights = [];
  let measuredItemGap = 0;

  // Animation durations (in timeline units)
  const ENTRY_DURATION = 0.35;
  const PAUSE_DURATION = 0.3;
  const EXIT_DURATION = 0.35;
  const CARD_CYCLE = ENTRY_DURATION + PAUSE_DURATION + EXIT_DURATION; // Total: 1.0

  /**
   * Update ScrollTrigger and Lenis after height changes
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
   * Scroll to a specific card using timeline labels
   */
  function scrollToCard(cardIndex) {
    if (cardIndex < 0 || cardIndex >= cards.length) return;
    if (!mainTimeline || !mainTimeline.scrollTrigger) return;

    // Get the label position from timeline.labels object
    const labelName = `card-${cardIndex}`;
    const labelTime = mainTimeline.labels[labelName];
    
    if (labelTime === null || labelTime === undefined) {
      console.warn(`Label ${labelName} not found in timeline`);
      return;
    }
    
    // Calculate progress in timeline (0-1)
    const totalDuration = mainTimeline.duration();
    const progress = labelTime / totalDuration;
    
    // Get ScrollTrigger info
    const scrollTrigger = mainTimeline.scrollTrigger;
    const scrollStart = scrollTrigger.start;
    const scrollEnd = scrollTrigger.end;
    
    // Calculate scroll distance
    const scrollDistance = scrollEnd - scrollStart;
    
    // Target scroll position
    const targetScroll = scrollStart + (scrollDistance * progress);
    
    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  }

  /**
   * Calculate and update all CSS variables
   */
  function updateCalculations() {
    // 0. Reset all GSAP transforms before measuring to ensure accurate heights
    cards.forEach((card) => {
      const cardElement = card.querySelector('.benefits-scroll_card');
      if (cardElement) {
        gsap.set(cardElement, { clearProps: 'all' });
      }
      gsap.set(card, { clearProps: 'all' });
    });

    // Force a reflow to ensure transforms are cleared before measuring
    void section.offsetHeight;

    // 1. Get the height of .section_inner and set --sticky-offset to center it in the viewport
    // Formula: (viewport height / 2) - (element height / 2)
    const sectionInnerHeight = sectionInner.offsetHeight;
    const viewportHeight = window.innerHeight;
    const stickyOffset = (viewportHeight / 2) - (sectionInnerHeight / 2);
    section.style.setProperty('--sticky-offset', `${stickyOffset}px`);

    // 2. Get initial section height (before we change it)
    // We need to temporarily reset it to get the natural height
    const currentSectionHeight = section.style.getPropertyValue('--section-height');
    section.style.setProperty('--section-height', 'auto');
    const initialSectionHeight = section.offsetHeight;
    
    // 3. Measure each card's height and store them (after clearing transforms)
    measuredCardHeights = [];
    let totalCardsHeight = 0;
    
    cards.forEach((card, index) => {
      const height = card.offsetHeight;
      measuredCardHeights.push(height);
      totalCardsHeight += height;
    });

    const cardCount = cards.length;
    measuredItemGap = getItemGap();

    // 4. Calculate --section-height
    // Formula: initialHeight + sumOfCardHeights + ((cardCount - 1) * gap)
    const calculatedSectionHeight = initialSectionHeight + totalCardsHeight + ((cardCount - 1) * measuredItemGap);
    section.style.setProperty('--section-height', `${calculatedSectionHeight}px`);

    // 5. Calculate and set --top for each card (starting from 2nd card)
    cards.forEach((card, index) => {
      if (index === 0) {
        // First card doesn't need --top (it's positioned normally)
        card.style.removeProperty('--top');
      } else {
        // For cards 2+: only use previous card's height + gap (not cumulative)
        const previousCardHeight = measuredCardHeights[index - 1];
        const topValue = previousCardHeight + measuredItemGap;
        card.style.setProperty('--top', `${topValue}px`);
      }
    });
  }

  /**
   * Create ScrollTrigger animation with global timeline for the section
   */
  function createCardAnimations() {
    // Kill existing ScrollTriggers
    scrollTriggers.forEach(st => st.kill());
    scrollTriggers.length = 0;

    // Use the already measured card heights from updateCalculations
    const cardHeights = measuredCardHeights;
    const itemGap = measuredItemGap;
    const totalCardsHeight = cardHeights.reduce((sum, height) => sum + height, 0);
    const cardCount = cards.length;
    const totalScrollDistance = totalCardsHeight + ((cardCount - 1) * itemGap);

    // Get the sticky offset for proper start positioning
    const sectionInnerHeight = sectionInner.offsetHeight;

    // Create main timeline
    mainTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: `top+=${(sectionInnerHeight / 2)} center`,
        end: `+=${totalScrollDistance}`,
        scrub: true,
        pin: false,
      }
    });

    // Add animations for each card to the timeline
    cards.forEach((card, index) => {
      // Add label for this card position
      
      const cardElement = card.querySelector('.benefits-scroll_card');
      if (!cardElement) return;

      const isFirstCard = index === 0;
      const isLastCard = index === cards.length - 1;

      // Set initial states
      if (isFirstCard) {
        navLinks[index].classList.add(activeNavClass)
        gsap.set(cardElement, {
          opacity: 1,
          scale: 1
        });
        // Card 0: Label at position 0
        mainTimeline.addLabel(`card-0`, 0);
      } else {
        gsap.set(cardElement, {
          opacity: 0.5,
          scale: 0.8,
          transformOrigin: 'top center'
        });
      }

      // Calculate timeline positions for this card
      const cardStartTime = index * CARD_CYCLE;
      const entryEndTime = cardStartTime + ENTRY_DURATION;
      const exitStartTime = entryEndTime + PAUSE_DURATION;

      // Move card up during entry (for cards 2+)
      if (!isFirstCard) {
        const previousCardHeight = cardHeights[index - 1];
        const moveDistance = previousCardHeight + itemGap;
        mainTimeline.to(card, {
          y: -moveDistance,
          duration: 0.35,
          ease: 'Power2.inOut'
        }, "<");
      }

      // Entry animation: Fade in & scale up (skip for first card)
      if (!isFirstCard) {
        mainTimeline.to(cardElement, {
          opacity: 1,
          scale: 1,
          transformOrigin: 'top center',
          duration: 0.35,
          ease: 'Power2.inOut',
          onComplete: () => {
            navLinks.forEach(navlink => {
                navlink.classList.remove(activeNavClass);
            })

            navLinks[index].classList.add(activeNavClass)
          },
          onReverseComplete: () => {
            navLinks.forEach(navlink => {
                navlink.classList.remove(activeNavClass);
            })

            navLinks[index - 1].classList.add(activeNavClass)
          }
            
        }, '<');

        // Add label after entry animation completes (card is fully visible)
        // Card 1: 0.35
        // Card 2: 0.35 + 0.3 + 0.35 = 1.0
        // Card 3: 1.0 + 0.3 + 0.35 = 1.65
        // Formula: ENTRY_DURATION + (index - 1) * (PAUSE_DURATION + ENTRY_DURATION)
        const labelPosition = ENTRY_DURATION + (index - 1) * (PAUSE_DURATION + ENTRY_DURATION);
        mainTimeline.addLabel(`card-${index}`, labelPosition);
      }

    

      // Exit animation: Fade out & scale down (skip for last card)
      if (!isLastCard) {
        mainTimeline.to(cardElement, {
          opacity: 0.5,
          scale: 0.8,
          transformOrigin: 'center bottom',
          duration: 0.35,
          ease: 'Power2.inOut'
        }, isFirstCard ? null : "+=0.3");
        
        // Move card up by its own height + gap during exit animation
        const cardHeight = cardHeights[index];
        const moveDistance = cardHeight + itemGap;
        mainTimeline.to(card, {
          y: `-=${moveDistance}`,
          duration: 0.35,
          ease: 'Power2.inOut'
        }, "<");
      }
    });

    // Store the ScrollTrigger instance for cleanup
    if (mainTimeline.scrollTrigger) {
      scrollTriggers.push(mainTimeline.scrollTrigger);
    }
  }

  /**
   * Setup navigation click handlers
   */
  function setupNavigation() {
    navLinks.forEach((link, index) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToCard(index);
      });
    });
  }

  /**
   * Initialize calculations on mount
   */
  onMount(() => {
    // Setup navigation click handlers
    setupNavigation();

    // Wait for fonts to be loaded before measuring heights
    document.fonts.ready.then(() => {
      // Use requestAnimationFrame to ensure DOM is fully ready after fonts load
      requestAnimationFrame(() => {
        // Initial calculation
        updateCalculations();
        
        // Create card animations after calculations are done
        // Use another RAF to ensure measurements are complete
        requestAnimationFrame(() => {
          createCardAnimations();
          
          // Update ScrollTrigger and Lenis after animations are created
          updateScrollSystems();
        });
        
        // Mark as initialized
        element.setAttribute('data-initialized', '');
      });
    });
  });

  /**
   * Subscribe to resize events to recalculate on viewport changes
   */
  let resizeUnsubscribe;
  
  onMount(() => {
    resizeUnsubscribe = Resize.add(() => {
      // Kill existing ScrollTriggers before recalculating
      scrollTriggers.forEach(st => st.kill());
      scrollTriggers.length = 0;
      
      // Recalculate and recreate animations
      updateCalculations();
      createCardAnimations();
      
      // Update ScrollTrigger and Lenis after recalculation
      updateScrollSystems();
    });
  });

  /**
   * Cleanup
   */
  onDestroy(() => {
    if (resizeUnsubscribe) {
      resizeUnsubscribe();
    }
    
    // Kill all ScrollTriggers
    scrollTriggers.forEach(st => st.kill());
    scrollTriggers.length = 0;
  });
}

