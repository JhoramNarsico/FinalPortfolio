document.addEventListener('DOMContentLoaded', () => {
    console.log("Portfolio script loaded and DOM fully parsed.");

    // --- Cache DOM Elements ---
    const header = document.querySelector('header');
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('header nav a');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const projectItems = document.querySelectorAll('.project-item');

    // NEW: Cache the showcase highlight block
    const highlightBlock = document.querySelector('.showcase-highlight-block');


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
        const adjustedHeaderOffset = (header ? header.offsetHeight : 70) + 30;

        sections.forEach(section => {
            // Consider only sections that are meant to be visible or are already visible
            if (section.classList.contains('section-is-visible') || getComputedStyle(section).opacity !== '0') {
                const sectionTop = section.offsetTop - adjustedHeaderOffset;
                const sectionBottom = sectionTop + section.offsetHeight;
                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    currentSectionId = section.getAttribute('id');
                }
            }
        });

         // Fallback: If no section is perfectly matched, find the last visible one from top
         if (!currentSectionId && sections.length > 0) {
            for (let i = sections.length - 1; i >= 0; i--) {
                 if ((sections[i].classList.contains('section-is-visible') || getComputedStyle(sections[i]).opacity !== '0') &&
                     scrollPosition >= sections[i].offsetTop - adjustedHeaderOffset) {
                    currentSectionId = sections[i].getAttribute('id');
                    break;
                }
            }
         }

         // Edge case: If scrolled to the very bottom of the page
        if ((window.innerHeight + scrollPosition) >= document.body.offsetHeight - 50 && sections.length > 0) { // 50px buffer
            currentSectionId = sections[sections.length - 1].getAttribute('id');
        }
        // Edge case: If scrolled above the first section (e.g., top of page)
        else if (sections.length > 0 && scrollPosition < sections[0].offsetTop - adjustedHeaderOffset) {
             currentSectionId = sections[0].getAttribute('id'); // Or set to empty if you prefer no active link
        }


        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    };

    // --- Feature 2: Header Transformation on Scroll ---
    const handleHeaderScroll = () => {
        if (!header) return;
        if (window.matchMedia("(max-width: 767.98px)").matches) {
             header.classList.remove('scrolled'); // Ensure it's not scrolled on mobile if header is static
             return;
        }
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    // --- Feature 3: Scroll-to-Top Button Visibility ---
    const handleScrollTopBtn = () => {
        if (!scrollTopBtn) return;
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
    }, 15);

    // --- Add Event Listeners ---
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', debounce(() => {
        handleHeaderScroll(); // Re-check header state on resize (e.g., moving from desktop to mobile view)
    }, 50));

    // Initial calls on page load
    handleHeaderScroll();
    handleScrollTopBtn();


    // --- Feature 4: Staggered Fade-in Animation for Project Items ---
    if ('IntersectionObserver' in window && projectItems.length > 0) {
        const projectObserverOptions = {
            root: null,
            rootMargin: '0px 0px -80px 0px', // Start loading a bit before fully in view
            threshold: 0.1 // 10% of item visible
        };
        let itemIndex = 0; // For staggering
        const processedItems = new WeakSet(); // To ensure animation only runs once per item

        const projectObserverCallback = (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !processedItems.has(entry.target)) {
                    const staggerDelay = itemIndex * 100; // 100ms stagger
                    entry.target.style.setProperty('--card-delay', `${0.3 + staggerDelay / 1000}s`);
                    entry.target.classList.add('is-visible');
                    processedItems.add(entry.target); // Mark as processed
                    itemIndex++;
                    // No need to unobserve, as WeakSet handles re-triggering
                }
            });
        };
        const projectObserver = new IntersectionObserver(projectObserverCallback, projectObserverOptions);
        projectItems.forEach(item => {
            projectObserver.observe(item);
        });
    } else {
        console.warn("Intersection Observer not supported for project items or no items found. Showing all items immediately.");
        projectItems.forEach(item => {
            item.style.setProperty('--card-delay', '0.3s');
            item.classList.add('is-visible');
        });
    }


    // --- Feature 6: Section Entrance Animation ---
    if ('IntersectionObserver' in window && sections.length > 0) {
        const sectionObserverOptions = {
            root: null,
            rootMargin: '0px 0px -15% 0px', // Trigger when bottom 15% of viewport is approached
            threshold: 0 // Trigger as soon as it enters the margin
        };
        const sectionObserverCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('section-is-visible');
                    debounce(highlightNavLink, 50)(); // Update nav link when section becomes visible
                }
                 // Optional: else { entry.target.classList.remove('section-is-visible'); } // If you want animations on re-scroll out of view
            });
        };
        const sectionObserver = new IntersectionObserver(sectionObserverCallback, sectionObserverOptions);
        sections.forEach(section => {
            sectionObserver.observe(section);
        });

        // Initial check for sections already in view on load to prevent FOUC
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            if (rect.top < viewportHeight * (1 - 0.15)) { // -15% from bottom
                if (rect.bottom > 0) { // Section bottom is below viewport top
                     section.classList.add('section-is-visible');
                }
            }
        });
         highlightNavLink(); // Initial call after forced visibility checks
    } else {
        console.warn("Intersection Observer not supported for sections or no sections found. Showing all sections immediately.");
        sections.forEach(section => {
            section.classList.add('section-is-visible');
        });
        highlightNavLink();
    }


    // --- Feature 5: Scroll-to-Top Button Click Handler ---
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- NEW: Scroll-Driven Animation for Showcase Highlight Block Icon ---
    if (highlightBlock && 'IntersectionObserver' in window) {
        const iconObserverOptions = {
            root: null,
            threshold: 0.2 // Trigger when 20% of the block is visible
        };
        const iconObserverCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('icon-animate-in');
                    // Optional: Unobserve after the first animation if you only want it once
                    // observer.unobserve(entry.target);
                } else {
                    // Optional: Remove class to re-animate if scrolled out and back in
                    // This might be desired if the block itself has an entrance animation too
                    // entry.target.classList.remove('icon-animate-in');
                }
            });
        };
        const iconObserver = new IntersectionObserver(iconObserverCallback, iconObserverOptions);
        iconObserver.observe(highlightBlock);
    }
    // --- END NEW ICON ANIMATION ---

    console.log("JavaScript enhancements initialized.");

}); // End of DOMContentLoaded listener