import Swiper, { A11y } from "@/lib/swiper";

export default function (element, dataset) {
  // Media query for carousel activation (≤ 991px)
  const CAROUSEL_BREAKPOINT = 991;
  const carouselMediaQuery = window.matchMedia(`(max-width: ${CAROUSEL_BREAKPOINT}px)`);
  
  let swiperInstance = null;
  let isCarouselActive = false;
  
  // Get carousel elements
  const carouselEl = element.querySelector('[data-element="carousel"]');
  
  if (!carouselEl) {
    console.warn('process: [data-element="carousel"] not found');
    return;
  }
  
  // Generate unique ID for accessibility
  const carouselId = `process-carousel-${Math.random().toString(36).substr(2, 9)}`;
  
  /**
   * Initialize Swiper carousel
   */
  function initCarousel() {
    if (swiperInstance || !isCarouselActive) return;
    
    swiperInstance = new Swiper(carouselEl, {
      modules: [A11y],
      direction: 'horizontal',
      slidesPerView: 1.15,
      spaceBetween: 20,
      centeredSlides: true,
      speed: 750,
      containerModifierClass: 'carousel-',
      slideActiveClass: 'process-carousel-slide-active',
      wrapperClass: 'process_carousel_list',
      slideClass: 'process_carousel_list_slide',
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
        containerMessage: 'Prozess-Übersicht Carousel',
        prevSlideMessage: 'Vorherige Phase',
        nextSlideMessage: 'Nächste Phase',
        slideLabelMessage: 'Monat {{index}} von {{slidesLength}}',
        firstSlideMessage: 'Das ist der erste Monat im Prozess',
        lastSlideMessage: 'Das ist der letzte Monat im Prozess',
        notificationClass: 'carousel_notification',
        slideRole: 'listitem',
        id: carouselId,
      },
    });
    
    // Add initialized class
    element.setAttribute('data-initialized', true);
  }
  
  /**
   * Destroy Swiper carousel
   */
  function destroyCarousel() {
    if (!swiperInstance) return;
    
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

