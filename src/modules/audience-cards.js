import { onMount, onDestroy } from "@/modules/_";
import { Resize } from "@/lib/subs";
import gsap from "@/lib/gsap";
import { ScrollTrigger } from "@/lib/gsap";
import Swiper, { A11y, Navigation } from "@/lib/swiper";

/**
 * Audience Cards Module
 * - On desktop (> 679px): Fade up animation with bounce easing and stagger
 * - On mobile (<= 679px): Swiper carousel with navigation
 */
export default function (element, dataset) {
  const carouselEl = element.querySelector('[data-element="carousel"]');
  const nextButton = element.querySelector('[data-element="next-button"]');
  const prevButton = element.querySelector('[data-element="prev-button"]');
  const slides = element.querySelectorAll('.audience-cards_slide');

  if (!carouselEl || !slides.length) {
    console.warn('audience-cards: Required elements not found');
    return;
  }

  const MOBILE_BREAKPOINT = 679;
  let swiperInstance = null;
  let scrollTriggerInstance = null;
  let currentMode = null; // 'desktop' or 'mobile'

  gsap.set(slides, {
    yPercent: 100,
  })

  /**
   * Initialize desktop animations with GSAP ScrollTrigger
   * Fade up with bounce easing and stagger
   */
  function initDesktopAnimations() {
    // Create ScrollTrigger animation
    scrollTriggerInstance = ScrollTrigger.create({
      trigger: element,
      start: 'top 60%',
      onEnter: () => {
        gsap.to(slides, {
          yPercent: 0,
          duration: 1.5,
          ease: 'back.out(1.2)', // Bounce easing
          stagger: 0.2, // Staggered animation
          clearProps: 'transform', // Clear props after animation
        });
      },
      markers: true,
      once: true, // Only trigger once
    });

    currentMode = 'desktop';
  }

  /**
   * Destroy desktop animations
   */
  function destroyDesktopAnimations() {
    if (scrollTriggerInstance) {
      scrollTriggerInstance.kill();
      scrollTriggerInstance = null;
    }

    // Reset inline styles
    gsap.set(slides, {
      clearProps: 'all',
    });
  }

  /**
   * Initialize mobile carousel with Swiper
   */
  function initMobileCarousel() {
    // Generate unique ID for accessibility
    const carouselId = `audience-cards-carousel-${Math.random().toString(36).substr(2, 9)}`;

    // Initialize Swiper
    swiperInstance = new Swiper(carouselEl, {
      modules: [A11y, Navigation],
      direction: 'horizontal',
      slidesPerView: 1,
      spaceBetween: 16,
      speed: 600,
      containerModifierClass: 'audience-cards-carousel-',
      slideActiveClass: 'audience-cards-carousel-slide-active',
      wrapperClass: 'audience-cards_wrapper',
      slideClass: 'audience-cards_slide',
      navigation: {
        nextEl: nextButton,
        prevEl: prevButton,
        disabledClass: 'is-disabled',
      },
      a11y: {
        containerMessage: 'Audience Cards Carousel',
        prevSlideMessage: 'Vorherige Karte',
        nextSlideMessage: 'Nächste Karte',
        slideLabelMessage: 'Karte {{index}} von {{slidesLength}}',
        firstSlideMessage: 'Das ist die erste Karte',
        lastSlideMessage: 'Das ist die letzte Karte',
        notificationClass: 'carousel_notification',
        id: carouselId,
      },
    });

    // Set initialized attribute
    element.setAttribute('data-initialized', 'true');
    currentMode = 'mobile';
  }

  /**
   * Destroy mobile carousel
   */
  function destroyMobileCarousel() {
    if (swiperInstance) {
      swiperInstance.destroy(true, true);
      swiperInstance = null;
    }

    // Remove initialized attribute
    element.setAttribute('data-initialized', 'false');
  }

  /**
   * Check viewport width and initialize appropriate mode
   */
  function checkAndInitialize() {
    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

    // Already in correct mode, do nothing
    if ((isMobile && currentMode === 'mobile') || (!isMobile && currentMode === 'desktop')) {
      return;
    }

    // Switch from desktop to mobile
    if (isMobile && currentMode === 'desktop') {
      destroyDesktopAnimations();
      initMobileCarousel();
      return;
    }

    // Switch from mobile to desktop
    if (!isMobile && currentMode === 'mobile') {
      destroyMobileCarousel();
      initDesktopAnimations();
      return;
    }

    // First initialization
    if (isMobile) {
      initMobileCarousel();
    } else {
      initDesktopAnimations();
    }
  }

  /**
   * Initialize on mount
   * Delayed to ensure other modules (like benefits-scroll) finish their calculations first
   */
  onMount(() => {
    // Wait for fonts to be loaded before measuring and animating
    document.fonts.ready.then(() => {
      // Use requestAnimationFrame to ensure DOM is fully ready
      requestAnimationFrame(() => {
        // Use another RAF to ensure other modules have completed their calculations
        requestAnimationFrame(() => {
          // Initial check and setup
          checkAndInitialize();
          
          // Refresh ScrollTrigger to recalculate positions after all DOM changes
          ScrollTrigger.refresh();
        });
      });
    });
  });

  /**
   * Subscribe to resize events
   */
  let resizeUnsubscribe;

  onMount(() => {
    resizeUnsubscribe = Resize.add(() => {
      checkAndInitialize();
    });
  });

  /**
   * Cleanup on destroy
   */
  onDestroy(() => {
    if (resizeUnsubscribe) {
      resizeUnsubscribe();
    }

    destroyDesktopAnimations();
    destroyMobileCarousel();
  });
}

