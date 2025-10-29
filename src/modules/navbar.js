import { Scroll } from "@/lib/scroll";
import { Resize } from "@/lib/subs";
import gsap from "@/lib/gsap";
import State from "@lib/hey";

export default function (element, dataset) {
  let isScrolled = false;
  let isOpen = false;
  let isMobile = false;
  
  // Get the container and mobile navigation elements
  const container = element.querySelector('.is-navbar-container');
  const trigger = element.querySelector('[data-element="primary-trigger"]');
  const dropdown = element.querySelector('[data-element="primary-dropdown"]');
  const dragCloser = dropdown?.querySelector('.navbar_primary_dropdown_drag-closer');
  
  if (!container) {
    console.warn('navbar: .is-navbar-container not found');
    return;
  }

  if (!trigger || !dropdown) {
    console.warn('navbar: mobile navigation elements not found');
    return;
  }

  // Create backdrop element for mobile navigation
  const backdrop = document.createElement('div');
  backdrop.setAttribute('data-element', 'navbar-backdrop');
  backdrop.style.position = 'fixed';
  backdrop.style.inset = '0';
  backdrop.style.pointerEvents = 'none';
  backdrop.style.backdropFilter = 'blur(0px)';
  backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0)';
  backdrop.style.display = 'none'; // Hidden by default
  backdrop.style.zIndex = '98'; // Behind navbar
  
  // Insert backdrop before navbar
  element.parentNode.insertBefore(backdrop, element);

  // Mobile breakpoint
  const MOBILE_BREAKPOINT = 767;
  const mobileMediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);

  /**
   * Setup accessibility attributes
   */
  function setupAccessibility() {
    const triggerId = 'navbar-mobile-trigger';
    const dropdownId = 'navbar-mobile-dropdown';
    
    trigger.id = triggerId;
    trigger.setAttribute('aria-controls', dropdownId);
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-label', 'Hauptmenü öffnen');
    
    dropdown.id = dropdownId;
    dropdown.setAttribute('aria-hidden', 'true');
  }

  /**
   * Get the current width of the navbar container
   */
  function getContainerWidth() {
    return container.offsetWidth;
  }

  /**
   * Calculate dropdown max height
   * 100vh - (2 x navbar top margin)
   */
  function getDropdownHeight() {
    const navbarRect = element.getBoundingClientRect();
    const topMargin = navbarRect.top;
    return window.innerHeight - (2 * topMargin) - element.offsetHeight;
  }

  /**
   * Animation Timelines
   */
  let openTimeline = null;
  let closeTimeline = null;

  /**
   * Create open animation timeline
   */
  function createOpenTimeline() {
    const height = getDropdownHeight();
    const listItems = dropdown.querySelectorAll('.navbar_primary_list_item');
    const listItemLinks = dropdown.querySelectorAll('.navbar_primary_list_item_link > div');
    
    const tl = gsap.timeline({ paused: true });
    
    // Set initial states
    gsap.set(listItemLinks, { yPercent: 100, opacity: 0 });
    
    // Animate backdrop blur and background
    tl.to(backdrop, {
      backdropFilter: 'blur(16px)',
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      duration: 0.8,
      ease: 'power2.out'
    }, 0);
    
    // Animate dropdown height
    tl.to(dropdown, {
      height: height,
      duration: 0.8,
      ease: 'power2.out'
    }, 0);
    
    // Animate list item links staggered
    tl.to(listItemLinks, {
      yPercent: 0,
      opacity: 1,
      duration: 0.4,
      ease: 'power2.out',
      stagger: 0.05
    }, 0.1); // Start slightly after dropdown animation
    
    return tl;
  }

  /**
   * Create close animation timeline
   */
  function createCloseTimeline() {
    const tl = gsap.timeline({ paused: true });
    
    // Animate backdrop blur and background
    tl.to(backdrop, {
      backdropFilter: 'blur(0px)',
      backgroundColor: 'rgba(0, 0, 0, 0)',
      duration: 0.4,
      ease: 'power2.out'
    }, 0);
    
    // Animate dropdown height
    tl.to(dropdown, {
      height: 0,
      duration: 0.4,
      ease: 'power2.out'
    }, 0);
    
    return tl;
  }

  /**
   * Drag-to-Close functionality
   */
  let isDragging = false;
  let dragStartY = 0;
  let dragStartHeight = 0;
  const DRAG_THRESHOLD = window.innerHeight * 0.1; // 10% of viewport height

  /**
   * Get Y position from mouse or touch event
   */
  function getEventY(event) {
    return event.type.includes('touch') 
      ? event.touches[0]?.clientY || event.changedTouches[0]?.clientY 
      : event.clientY;
  }

  /**
   * Start drag
   */
  function handleDragStart(event) {
    if (!isMobile || !isOpen) return;
    
    isDragging = true;
    dragStartY = getEventY(event);
    dragStartHeight = dropdown.offsetHeight;
    
    // Prevent text selection while dragging
    event.preventDefault();
    
    // Add dragging state
    element.setAttribute('data-dragging', 'true');
    
    // Kill any running timelines to prevent conflicts
    if (openTimeline) openTimeline.kill();
    if (closeTimeline) closeTimeline.kill();
  }

  /**
   * Handle drag move
   */
  function handleDragMove(event) {
    if (!isDragging) return;
    
    const currentY = getEventY(event);
    const deltaY = dragStartY - currentY; // Positive = dragging up
    
    // Only allow dragging up
    if (deltaY < 0) {
      if (dragCloser) {
        dragCloser.style.setProperty('--progress', '0%');
      }
      return;
    }
    
    // Calculate new height (reduce as we drag up)
    const newHeight = Math.max(0, dragStartHeight - deltaY);
    
    // Calculate progress (0-100% capped for threshold indicator)
    const progress = Math.min(100, (deltaY / DRAG_THRESHOLD) * 100);
    
    // Calculate extended progress (uncapped for blur/bg calculations)
    // Continue reducing blur/bg even beyond threshold
    const extendedProgress = (deltaY / dragStartHeight) * 100;
    const normalizedProgress = Math.min(100, extendedProgress);
    
    // Calculate backdrop blur based on extended progress
    // 0% = 16px blur, 100% = 0px blur (full range over entire height)
    const blurAmount = Math.max(0, 16 * (1 - (normalizedProgress / 100)));
    
    // Calculate background opacity based on extended progress
    // 0% = 0.2 opacity, 100% = 0 opacity
    const bgOpacity = Math.max(0, 0.2 * (1 - (normalizedProgress / 100)));
    
    // Update dropdown height directly (more natural feeling)
    gsap.set(dropdown, { height: newHeight });
    
    // Update backdrop blur and background
    gsap.set(backdrop, {
      backdropFilter: `blur(${blurAmount}px)`,
      backgroundColor: `rgba(0, 0, 0, ${bgOpacity})`
    });
    
    // Update progress CSS variable (for threshold indicator)
    if (dragCloser) {
      dragCloser.style.setProperty('--progress', `${progress}%`);
    }
  }

  /**
   * End drag
   */
  function handleDragEnd(event) {
    if (!isDragging) return;
    
    isDragging = false;
    element.setAttribute('data-dragging', 'false');
    
    const currentY = getEventY(event);
    const deltaY = dragStartY - currentY;
    
    // Calculate progress
    const progress = Math.min(100, (deltaY / DRAG_THRESHOLD) * 100);
    
    // Check if threshold was reached
    if (progress >= 100) {
      // Close the navigation completely
      closeMobileNav();
    } else {
      // Animate back to full open state
      const height = getDropdownHeight();
      gsap.to(dropdown, {
        height: height,
        duration: 0.3,
        ease: 'power2.out'
      });
      
      // Animate backdrop blur and background back to full
      gsap.to(backdrop, {
        backdropFilter: 'blur(16px)',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        duration: 0.3,
        ease: 'power2.out'
      });
      
      // Reset progress
      if (dragCloser) {
        gsap.to(dragCloser, {
          '--progress': '0%',
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    }
  }

  /**
   * Animate the navbar clip-path
   */
  function animateClip(scrolled) {
    const width = getContainerWidth();
    // Ellipse uses radius, not diameter - so divide by 2
    const radius = width / 2;
    const clipValue = scrolled 
      ? `ellipse(100% 200% at 50% 100%)`
      : `ellipse(${radius}px 4px at 50% 100%)`;
    
    gsap.set(element, {
      '--clip': clipValue,
    });
  }

  /**
   * Update navbar scrolled state based on scroll position
   */
  function updateScrollState(data) {
    const currentScrollY = data.scroll || 0;
    const shouldBeScrolled = currentScrollY >= 1;

    // Only update if state has changed to avoid unnecessary DOM manipulation
    if (shouldBeScrolled !== isScrolled) {
      isScrolled = shouldBeScrolled;
      element.setAttribute("data-scrolled", isScrolled.toString());
      animateClip(shouldBeScrolled);
    }
  }

  /**
   * Lock/unlock body scroll
   */
  function toggleBodyScroll(lock) {
    if (lock) {
      document.body.style.overflow = 'hidden';
      Scroll.stop();
    } else {
      document.body.style.overflow = '';
      Scroll.start();
    }
  }

  /**
   * Open mobile navigation
   */
  function openMobileNav() {
    if (!isMobile || isOpen) return;
    
    isOpen = true;
    element.setAttribute('data-open', 'true');
    element.setAttribute('data-dragging', 'false');
    trigger.setAttribute('aria-expanded', 'true');
    trigger.setAttribute('aria-label', 'Hauptmenü schließen');
    dropdown.setAttribute('aria-hidden', 'false');
    
    // Lock scroll
    toggleBodyScroll(true);
    
    // Reset progress
    if (dragCloser) {
      gsap.set(dragCloser, { '--progress': '0%' });
    }
    
    // Kill existing timelines
    if (openTimeline) openTimeline.kill();
    if (closeTimeline) closeTimeline.kill();
    
    // Create and play open timeline
    openTimeline = createOpenTimeline();
    openTimeline.play();
    
    // Create close timeline for drag (paused, at end position)
    closeTimeline = createCloseTimeline();
    closeTimeline.progress(0);
  }

  /**
   * Close mobile navigation
   */
  function closeMobileNav() {
    if (!isOpen) return;
    
    // Update internal state immediately
    isOpen = false;
    element.setAttribute('data-dragging', 'false');
    
    // Unlock scroll
    toggleBodyScroll(false);
    
    // Reset drag state
    isDragging = false;
    
    // Kill existing timelines
    if (openTimeline) openTimeline.kill();
    if (closeTimeline) closeTimeline.kill();
    
    // Create and play close timeline
    closeTimeline = createCloseTimeline();
    
    // Set data-open and ARIA attributes after animation completes
    closeTimeline.eventCallback('onComplete', () => {
      element.setAttribute('data-open', 'false');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-label', 'Hauptmenü öffnen');
      dropdown.setAttribute('aria-hidden', 'true');
    });
    
    closeTimeline.play();
    
    // Reset progress
    if (dragCloser) {
      gsap.set(dragCloser, { '--progress': '0%' });
    }
  }

  /**
   * Toggle mobile navigation
   */
  function toggleMobileNav() {
    if (isOpen) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  }

  /**
   * Handle media query change
   */
  function handleMediaChange(e) {
    isMobile = e.matches;
    
    if (!isMobile) {
      // Reset mobile navigation when switching to desktop
      if (isOpen) {
        isOpen = false;
        element.setAttribute('data-open', 'false');
        toggleBodyScroll(false);
      }
      
      // Kill any running timelines
      if (openTimeline) openTimeline.kill();
      if (closeTimeline) closeTimeline.kill();
      
      // Hide backdrop on desktop
      backdrop.style.display = 'none';
      gsap.set(backdrop, {
        backdropFilter: 'blur(0px)',
        backgroundColor: 'rgba(0, 0, 0, 0)'
      });
      
      // Reset dropdown styles
      gsap.set(dropdown, { clearProps: 'height,yPercent,opacity' });
      
      // Reset list item styles
      const listItemLinks = dropdown.querySelectorAll('.navbar_primary_list_item_link > div');
      gsap.set(listItemLinks, { clearProps: 'yPercent,opacity' });
      
      // Reset ARIA states
      trigger.setAttribute('aria-expanded', 'false');
      dropdown.setAttribute('aria-hidden', 'true');
    } else {
      // Initialize mobile state
      element.setAttribute('data-open', 'false');
      gsap.set(dropdown, { height: 0 });
      
      // Show backdrop on mobile
      backdrop.style.display = 'block';
      gsap.set(backdrop, {
        backdropFilter: 'blur(0px)',
        backgroundColor: 'rgba(0, 0, 0, 0)'
      });
    }
  }

  /**
   * Handle resize to update dropdown height when open
   */
  function handleResize() {
    animateClip(isScrolled);
    
    // Update dropdown height if open on mobile (and not dragging)
    if (isMobile && isOpen && !isDragging) {
      const height = getDropdownHeight();
      gsap.set(dropdown, { height });
    }
  }

  // Setup accessibility attributes
  setupAccessibility();

  // Initialize states
  element.setAttribute('data-open', 'false');
  element.setAttribute('data-dragging', 'false');
  
  // Check initial media query
  isMobile = mobileMediaQuery.matches;
  if (isMobile) {
    gsap.set(dropdown, { height: 0 });
    backdrop.style.display = 'block';
  } else {
    backdrop.style.display = 'none';
  }

  // Initialize scroll state on mount
  const initialScrollY = window.scrollY || window.pageYOffset;
  isScrolled = initialScrollY >= 1;
  element.setAttribute("data-scrolled", isScrolled.toString());
  animateClip(isScrolled);

  // Event listeners
  trigger.addEventListener('click', toggleMobileNav);
  mobileMediaQuery.addEventListener('change', handleMediaChange);

  // Drag-to-close event listeners (if drag closer element exists)
  if (dragCloser) {
    // Mouse events
    dragCloser.addEventListener('mousedown', handleDragStart);
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    
    // Touch events
    dragCloser.addEventListener('touchstart', handleDragStart, { passive: false });
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('touchend', handleDragEnd);
    document.addEventListener('touchcancel', handleDragEnd);
    
    // Initialize progress variable
    dragCloser.style.setProperty('--progress', '0%');
  }

  // Subscribe to Scroll updates
  const scrollUnsubscribe = Scroll.add(updateScrollState);

  // Update clip-path and dropdown height on resize
  const resizeUnsubscribe = Resize.add(handleResize);

  // Listen for page changes
  State.on("PAGE", (data) => {
    console.log("page changed");
    // Close mobile nav on page change
    if (isMobile && isOpen) {
      closeMobileNav();
    }
  });

  // Cleanup
  return () => {
    scrollUnsubscribe();
    resizeUnsubscribe();
    trigger.removeEventListener('click', toggleMobileNav);
    mobileMediaQuery.removeEventListener('change', handleMediaChange);
    
    // Remove drag event listeners
    if (dragCloser) {
      dragCloser.removeEventListener('mousedown', handleDragStart);
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      
      dragCloser.removeEventListener('touchstart', handleDragStart);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
      document.removeEventListener('touchcancel', handleDragEnd);
    }
    
    // Kill timelines
    if (openTimeline) openTimeline.kill();
    if (closeTimeline) closeTimeline.kill();
    
    // Remove backdrop element
    if (backdrop && backdrop.parentNode) {
      backdrop.parentNode.removeChild(backdrop);
    }
    
    toggleBodyScroll(false); // Ensure scroll is unlocked
  };
}
