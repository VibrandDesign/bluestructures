import Swiper, { A11y } from "@/lib/swiper";

export default function (element, dataset) {
  // Media query for carousel activation (≤ 991px)
  const CAROUSEL_BREAKPOINT = 991;
  const carouselMediaQuery = window.matchMedia(`(max-width: ${CAROUSEL_BREAKPOINT}px)`);
  
  // REM value for spaceBetween (Swiper doesn't support rem)
  const SPACE_BETWEEN_REM = 5.625;
  
  let swiperInstance = null;
  let isCarouselActive = false;
  let resizeObserver = null;
  
  // Get carousel elements
  const carouselEl = element.querySelector('[data-element="carousel"]');
  const wrapperEl = carouselEl?.querySelector('.steps_carousel_list[role="list"]');
  
  if (!carouselEl) {
    console.warn('steps-to-success: [data-element="carousel"] not found');
    return;
  }
  
  if (!wrapperEl) {
    console.warn('steps-to-success: wrapper element .steps_carousel_list[role="list"] not found');
    return;
  }
  
  // Remove empty duplicate wrapper div (Webflow artifact)
  const emptyWrappers = carouselEl.querySelectorAll('.steps_carousel_list:not([role="list"])');
  emptyWrappers.forEach(el => el.remove());
  
  // Generate unique ID for accessibility
  const carouselId = `steps-carousel-${Math.random().toString(36).substr(2, 9)}`;
  
  /**
   * Calculate spaceBetween in pixels from rem value
   */
  function calculateSpaceBetween() {
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    return rootFontSize * SPACE_BETWEEN_REM;
  }
  
  /**
   * Update Swiper spaceBetween on resize
   */
  function handleResize() {
    if (!swiperInstance) return;
    
    const newSpaceBetween = calculateSpaceBetween();
    swiperInstance.params.spaceBetween = newSpaceBetween;
    swiperInstance.update();
  }
  
  /**
   * Initialize Swiper carousel
   */
  function initCarousel() {
    if (swiperInstance || !isCarouselActive) return;
    
    const spaceBetweenPx = calculateSpaceBetween();
    
    swiperInstance = new Swiper(carouselEl, {
      modules: [A11y],
      direction: 'horizontal',
      slidesPerView: 1.15,
      spaceBetween: spaceBetweenPx,
      centeredSlides: true,
      speed: 750,
      containerModifierClass: 'steps-carousel-',
      slideActiveClass: 'steps-carousel-slide-active',
      wrapperClass: 'steps_carousel_list',
      slideClass: 'steps_carousel_list_slide',
      breakpoints: {
        419: {
          slidesPerView: 1.5,
          centeredSlides: false,
        },
        589: {
          slidesPerView: 1.8,
        },
        768: {
          slidesPerView: 2.2,
        },
      },
      a11y: {
        containerMessage: 'Schritte zum Erfolg Carousel',
        prevSlideMessage: 'Vorheriger Schritt',
        nextSlideMessage: 'Nächster Schritt',
        slideLabelMessage: 'Schritt {{index}} von {{slidesLength}}',
        firstSlideMessage: 'Das ist der erste Schritt',
        lastSlideMessage: 'Das ist der letzte Schritt',
        notificationClass: 'carousel_notification',
        slideRole: 'listitem',
        id: carouselId,
      },
    });
    
    // Add initialized class
    element.setAttribute('data-initialized', true);
    
    // Setup ResizeObserver to update spaceBetween when root font size changes
    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(document.documentElement);
  }
  
  /**
   * Destroy Swiper carousel
   */
  function destroyCarousel() {
    if (!swiperInstance) return;
    
    // Disconnect ResizeObserver
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    
    swiperInstance.destroy(true, true);
    swiperInstance = null;
    
    // Remove initialized class
    element.setAttribute('data-initialized', false);
  }
  
  /**
   * Handle media query change
   */
  function handleMediaChange(e) {
    isCarouselActive = e.matches;
    
    if (isCarouselActive) {
      // Initialize carousel when entering mobile view
      initCarousel();
    } else {
      // Destroy carousel when entering desktop view
      destroyCarousel();
    }
  }
  
  // Check initial media query state
  isCarouselActive = carouselMediaQuery.matches;
  
  // Initialize carousel if we're in mobile view
  if (isCarouselActive) {
    initCarousel();
  }
  
  // Listen for media query changes
  carouselMediaQuery.addEventListener('change', handleMediaChange);
  
  // Cleanup
  return () => {
    destroyCarousel();
    carouselMediaQuery.removeEventListener('change', handleMediaChange);
  };
}

