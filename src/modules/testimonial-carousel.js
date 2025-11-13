import Swiper, { A11y, Navigation } from "@/lib/swiper";

export default function (element, dataset) {
  // Get carousel elements
  const carouselEl = element.querySelector('[data-element="carousel"]');
  const nextButton = element.querySelector('[data-element="next-button"]');
  const prevButton = element.querySelector('[data-element="prev-button"]');
  
  if (!carouselEl) {
    console.warn('testimonial-carousel: [data-element="carousel"] not found');
    return;
  }
  
  // Generate unique ID for accessibility
  const carouselId = `testimonial-carousel-${Math.random().toString(36).substr(2, 9)}`;
  
  // Initialize Swiper carousel
  const swiperInstance = new Swiper(carouselEl, {
    modules: [A11y, Navigation],
    direction: 'horizontal',
    slidesPerView: 1,
    spaceBetween: 16,
    speed: 750,
    containerModifierClass: 'testimonial-carousel-',
    slideActiveClass: 'testimonial-carousel-slide-active',
    wrapperClass: 'testimonial-carousel_wrapper',
    slideClass: 'testimonial-carousel_slide',
    navigation: {
      nextEl: nextButton,
      prevEl: prevButton,
      disabledClass: 'is-disabled',
    },
    breakpoints: {
      480: {
        slidesPerView: 1.2,
      },
      768: {
        slidesPerView: 2,
      },
      992: {
        slidesPerView: 2.5,
      },
      1280: {
        slidesPerView: 3,
      },
    },
    a11y: {
      containerMessage: 'Testimonial Carousel',
      prevSlideMessage: 'Vorheriges Testimonial',
      nextSlideMessage: 'Nächstes Testimonial',
      slideLabelMessage: 'Testimonial {{index}} von {{slidesLength}}',
      firstSlideMessage: 'Das ist das erste Testimonial',
      lastSlideMessage: 'Das ist das letzte Testimonial',
      notificationClass: 'carousel_notification',
      slideRole: 'listitem',
      id: carouselId,
    },
  });
  
  // Add initialized class
  element.setAttribute('data-initialized', true);
  
  // Cleanup
  return () => {
    if (swiperInstance) {
      swiperInstance.destroy(true, true);
      element.setAttribute('data-initialized', false);
    }
  };
}

