import gsap from "@/lib/gsap";
import { ScrollTrigger } from "@/lib/gsap";

export default function (element, dataset) {
  // Get all list items
  const listItems = element.querySelectorAll('[role="listitem"]');
  
  if (!listItems || listItems.length === 0) {
    console.warn('tools-tease: [role="listitem"] elements not found');
    return;
  }
  
  // Set initial state for all list items
  gsap.set(listItems, {
    opacity: 0,
    y: 40,
  });
  
  // Create staggered fade-up animation on scroll
  const animation = gsap.to(listItems, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: "power2.out",
    stagger: {
      each: 0.1,
      from: "start",
    },
    scrollTrigger: {
      trigger: element,
      start: "top 70%", // Animation starts when top of element hits 80% of viewport
      end: "center 50%", // Animation ends when bottom hits 20% of viewport
      toggleActions: "play none none reverse", // play on enter, reverse on leave back
        // markers: true, // Uncomment for debugging
        scrub: true
    }
  });
  
  // Cleanup
  return () => {
    animation.kill();
    ScrollTrigger.getAll().forEach(st => {
      if (st.trigger === element) {
        st.kill();
      }
    });
  };
}

