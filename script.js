document.addEventListener('DOMContentLoaded', () => {
    console.log("Portfolio script loaded and DOM fully parsed.");

    // --- Cache DOM Elements ---
    const header = document.querySelector('header');
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('header nav a');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const projectItems = document.querySelectorAll('.project-item'); // Cache projects early

    // --- Debounce Function (Helper for scroll/resize events) ---
    function debounce(func, wait = 15, immediate = false) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    // --- Feature 1: Active Navigation Link Highlighting (Refined Scroll Logic) ---
    const highlightNavLink = () => {
        let currentSectionId = '';
        const scrollPosition = window.scrollY;
        // Dynamically get header height + buffer INSIDE the function for accuracy
        const adjustedHeaderOffset = (header ? header.offsetHeight : 70) + 30;

        sections.forEach(section => {
            // Check if the section is actually visible before calculating offsets
            // This helps if sections start invisible due to animations
            if (section.classList.contains('section-is-visible') || getComputedStyle(section).opacity !== '0') {
                const sectionTop = section.offsetTop - adjustedHeaderOffset;
                const sectionBottom = sectionTop + section.offsetHeight;

                // Check if scroll position is within the section's bounds
                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    currentSectionId = section.getAttribute('id');
                }
            }
        });

         // If no section is actively matched (e.g., in space between sections, or near top/bottom),
         // try a simpler check: find the last visible section whose top is above the current scroll position.
         if (!currentSectionId && sections.length > 0) {
            for (let i = sections.length - 1; i >= 0; i--) {
                // Check visibility again here
                 if ((sections[i].classList.contains('section-is-visible') || getComputedStyle(sections[i]).opacity !== '0') &&
                     scrollPosition >= sections[i].offsetTop - adjustedHeaderOffset) {
                    currentSectionId = sections[i].getAttribute('id');
                    break;
                }
            }
         }

        // Handle edge case: Scrolled near the very bottom of the page
         if ((window.innerHeight + scrollPosition) >= document.body.offsetHeight - 50 && sections.length > 0) {
            currentSectionId = sections[sections.length - 1].getAttribute('id');
        }
        // Handle edge case: Scrolled near the very top
        else if (sections.length > 0 && scrollPosition < sections[0].offsetTop - adjustedHeaderOffset) {
             currentSectionId = sections[0].getAttribute('id'); // Default to first section
        }

        // Update active class on nav links
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    };

    // --- Feature 2: Header Transformation on Scroll ---
    const handleHeaderScroll = () => {
        if (!header) return; // Exit if header doesn't exist

        // Disable shrinking on smaller screens where layout changes (header becomes static)
        if (window.matchMedia("(max-width: 767.98px)").matches) {
             header.classList.remove('scrolled'); // Ensure class is removed if screen resized
             return;
        }

        // Add 'scrolled' class after scrolling 50px
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    // --- Feature 3: Scroll-to-Top Button Visibility ---
    const handleScrollTopBtn = () => {
        if (!scrollTopBtn) return; // Exit if button doesn't exist
        // Show button after scrolling 300px
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    };

    // --- Combined Scroll Handler (Debounced) ---
    const onScroll = debounce(() => {
        highlightNavLink();
        handleHeaderScroll();
        handleScrollTopBtn();
    }, 15); // Run checks no more than roughly every 15ms

    // --- Add Event Listeners ---
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', debounce(() => {
        handleHeaderScroll();
        // Optionally re-check nav highlighting on resize if layout changes drastically
        // highlightNavLink();
    }, 50));

    // Initial calls on page load
    handleHeaderScroll(); // Set initial header state
    handleScrollTopBtn(); // Set initial button state
    // highlightNavLink(); // Call highlight initially, but section visibility might affect it
    // Note: The section observer below will handle initial section visibility


    // --- Feature 4: Staggered Fade-in Animation for Project Items ---
    if ('IntersectionObserver' in window && projectItems.length > 0) {
        const projectObserverOptions = {
            root: null,
            rootMargin: '0px 0px -80px 0px', // Trigger when item is about 80px from bottom edge
            threshold: 0.1 // Need at least 10% visible
        };

        let itemIndex = 0; // Keep track of index for staggering
        const processedItems = new WeakSet(); // Track processed items

        const projectObserverCallback = (entries, observer) => {
            entries.forEach((entry) => {
                // Check if item hasn't been processed and is intersecting
                if (entry.isIntersecting && !processedItems.has(entry.target)) {
                    // Calculate delay based on the overall index
                    // Base delay is already set in CSS (0.3s), this adds staggering on top
                    const staggerDelay = itemIndex * 100; // 100ms delay between items
                    entry.target.style.setProperty('--card-delay', `${0.3 + staggerDelay / 1000}s`); // Add stagger to base delay

                    entry.target.classList.add('is-visible');

                    processedItems.add(entry.target); // Mark item as processed
                    itemIndex++; // Increment index for the next item

                    // Don't unobserve here if we want hover effects etc. to remain
                    // observer.unobserve(entry.target); // Optional: Stop observing once animated
                }
                // No 'else' needed if we only want the animation once on scroll-in
            });
        };

        const projectObserver = new IntersectionObserver(projectObserverCallback, projectObserverOptions);

        projectItems.forEach(item => {
            projectObserver.observe(item);
        });

    } else {
        // Fallback for older browsers or if no items exist
        console.warn("Intersection Observer not supported for project items or no items found. Showing all items immediately.");
        projectItems.forEach(item => {
            item.style.setProperty('--card-delay', '0.3s'); // Apply base delay
            item.classList.add('is-visible');
        });
    }


    // --- Feature 6: Section Entrance Animation ---
    if ('IntersectionObserver' in window && sections.length > 0) {
        const sectionObserverOptions = {
            root: null,
            // Trigger when the section is about 15% from the bottom edge. (Was -25%)
            rootMargin: '0px 0px -15% 0px',
            threshold: 0 // Trigger as soon as it crosses the margin boundary
        };

        const sectionObserverCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Section is entering the detection zone
                    entry.target.classList.add('section-is-visible');
                    // Re-run nav highlight when a section becomes visible
                    // Use debounce to avoid running too often if multiple sections trigger quickly
                    debounce(highlightNavLink, 50)();
                    // Optional: Unobserve if you only want the animation once per page load
                    // observer.unobserve(entry.target);
                } else {
                    // Section is leaving the detection zone
                    // Optional: Remove class to reset animation if user scrolls back up
                    // Be careful: this might feel janky if sections are close together
                    // entry.target.classList.remove('section-is-visible');
                }
            });
        };

        const sectionObserver = new IntersectionObserver(sectionObserverCallback, sectionObserverOptions);

        sections.forEach(section => {
            sectionObserver.observe(section);
        });

        // Initial check for sections already in view on load (e.g., #about)
        // This is important because the scroll event won't fire initially
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            // Check if section top is within the trigger zone from the bottom (match rootMargin: 1 - 0.15 = 0.85)
            if (rect.top < viewportHeight * (1 - 0.15)) {
                 // Check if section bottom is below the top of the viewport (i.e., some part is visible)
                if (rect.bottom > 0) {
                     section.classList.add('section-is-visible');
                }
            }
        });
         // Call highlightNavLink AFTER the initial section visibility check
         highlightNavLink();

    } else {
        // Fallback for older browsers or if no sections found
        console.warn("Intersection Observer not supported for sections or no sections found. Showing all sections immediately.");
        sections.forEach(section => {
            section.classList.add('section-is-visible'); // Make them visible directly
        });
        highlightNavLink(); // Highlight nav based on initially visible sections
    }
    // --- End of Section Entrance Animation ---


    // --- Feature 5: Scroll-to-Top Button Click Handler ---
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior
            window.scrollTo({
                top: 0,
                behavior: 'smooth' // Use smooth scrolling
            });
        });
    }

    console.log("JavaScript enhancements initialized.");

}); // End of DOMContentLoaded listener
