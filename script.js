document.addEventListener('DOMContentLoaded', () => {
    console.log("Portfolio script loaded and DOM fully parsed.");

    const header = document.querySelector('header');
    const headerOffset = header ? header.offsetHeight : 70; // Get header height or use default
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('header nav a');
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    // --- Debounce Function (Helper for scroll events) ---
    // Limits the rate at which a function can fire.
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
        // Recalculate offset considering potential header height change and adding buffer
        const adjustedHeaderOffset = (header ? header.offsetHeight : 70) + 30;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - adjustedHeaderOffset;
            const sectionBottom = sectionTop + section.offsetHeight;

            // Check if scroll position is within the section's bounds
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                currentSectionId = section.getAttribute('id');
            }
        });

         // If no section is actively matched (e.g., in space between sections, or near top/bottom),
         // try a simpler check: find the last section whose top is above the current scroll position.
         if (!currentSectionId && sections.length > 0) { // Add check for sections.length
            for (let i = sections.length - 1; i >= 0; i--) {
                if (scrollPosition >= sections[i].offsetTop - adjustedHeaderOffset) {
                    currentSectionId = sections[i].getAttribute('id');
                    break;
                }
            }
         }

        // Handle edge case: Scrolled near the very bottom of the page
         if ((window.innerHeight + scrollPosition) >= document.body.offsetHeight - 50 && sections.length > 0) { // 50px buffer, check sections exist
            currentSectionId = sections[sections.length - 1].getAttribute('id');
        }
        // Handle edge case: Scrolled near the very top
        else if (sections.length > 0 && scrollPosition < sections[0].offsetTop - adjustedHeaderOffset) {
             // Default to the first section if above it, or clear if preferred
             currentSectionId = sections[0].getAttribute('id'); // Or set to '' to have none active at top
        }


        // Update active class on nav links
        navLinks.forEach(link => {
            link.classList.remove('active');
            // Check if the link's href matches the current section ID
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    };

    // --- Feature 2: Header Transformation on Scroll ---
    const handleHeaderScroll = () => {
        if (!header) return; // Exit if header doesn't exist

        // Disable shrinking on smaller screens where layout changes
        if (window.matchMedia("(max-width: 767.98px)").matches) {
             header.classList.remove('scrolled'); // Ensure class is removed if screen resized
             return;
        }

        if (window.scrollY > 50) { // Add 'scrolled' class after scrolling 50px
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    // --- Feature 3: Scroll-to-Top Button Visibility ---
    const handleScrollTopBtn = () => {
        if (!scrollTopBtn) return; // Exit if button doesn't exist
        if (window.scrollY > 300) { // Show button after scrolling 300px
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

    // Add combined scroll event listener
    window.addEventListener('scroll', onScroll);

    // Listen for resize to potentially re-apply/remove header scroll effect
    window.addEventListener('resize', debounce(handleHeaderScroll, 50));

    // Initial calls on page load
    highlightNavLink();
    handleHeaderScroll();
    handleScrollTopBtn();


    // --- Feature 4: Staggered Fade-in Animation for Project Cards ---
    const projectCards = document.querySelectorAll('.project-card');

    if ('IntersectionObserver' in window && projectCards.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -80px 0px', // Trigger when card is about 80px from bottom edge
            threshold: 0.1 // Need at least 10% visible
        };

        // Keep track of the index globally for staggering across different observer triggers
        let cardIndex = 0;
        const processedCards = new WeakSet(); // Keep track of cards already processed

        const observerCallback = (entries, observer) => {
            entries.forEach((entry) => {
                // Check if card hasn't been processed already to handle potential multiple intersections
                if (entry.isIntersecting && !processedCards.has(entry.target)) {
                    // Calculate delay based on the overall index
                    const delay = cardIndex * 100; // 100ms delay between cards
                    entry.target.style.setProperty('--card-delay', `${delay}ms`);
                    entry.target.classList.add('is-visible');

                    processedCards.add(entry.target); // Mark card as processed
                    cardIndex++; // Increment index for the next card

                    observer.unobserve(entry.target); // Stop observing once animated
                }
                // No 'else' needed if we only want the animation once on scroll-in
            });
        };

        const cardObserver = new IntersectionObserver(observerCallback, observerOptions);

        // Observe each card individually to trigger based on its own visibility
        projectCards.forEach(card => {
            cardObserver.observe(card);
        });

    } else {
        // Fallback for older browsers or if no cards exist
        console.warn("Intersection Observer not supported or no project cards found. Showing all cards immediately.");
        projectCards.forEach(card => {
            card.style.setProperty('--card-delay', '0ms'); // Ensure delay is 0
            card.classList.add('is-visible');
        });
    }

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