document.addEventListener('DOMContentLoaded', () => {
    console.log("Portfolio script loaded and DOM fully parsed.");

    // --- Feature 1: Active Navigation Link Highlighting ---
    const sections = document.querySelectorAll('main section[id]'); // Get all main sections with an ID
    const navLinks = document.querySelectorAll('header nav a');
    const headerOffset = document.querySelector('header').offsetHeight + 20; // Adjust offset for sticky header + some padding

    const highlightNavLink = () => {
        let currentSectionId = '';
        let minDistance = Infinity; // Use distance for better accuracy near top/bottom
        const scrollPosition = window.scrollY;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerOffset;
            const sectionBottom = sectionTop + section.offsetHeight;

            // Check if the section is roughly in the viewport
            // Prioritize sections whose top edge is closest to the scroll position marker
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                 const distanceToTop = Math.abs(scrollPosition - sectionTop);
                 if (distanceToTop < minDistance) {
                     minDistance = distanceToTop;
                     currentSectionId = section.getAttribute('id');
                 }
            }
            // If multiple sections are in view, the one closest to the top boundary wins
        });

         // If no section top is closely matched (e.g., scrolling fast or in large empty space),
         // find the last section whose top is above the scroll position
         if (!currentSectionId) {
            for (let i = sections.length - 1; i >= 0; i--) {
                if (scrollPosition >= sections[i].offsetTop - headerOffset) {
                    currentSectionId = sections[i].getAttribute('id');
                    break;
                }
            }
         }

         // Handle edge cases: scrolled to the very top or very bottom
         if (scrollPosition < sections[0].offsetTop - headerOffset) {
             // If scrolled above the first section, make the first section active
             currentSectionId = sections[0].getAttribute('id');
         } else if (window.innerHeight + scrollPosition >= document.body.offsetHeight - 10) { // Near bottom
             // If scrolled to the bottom, make the last section active
             currentSectionId = sections[sections.length - 1].getAttribute('id');
         }


        // Update active class on nav links
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    };

    // Initial call to set the state on page load
    highlightNavLink();
    // Add scroll event listener
    window.addEventListener('scroll', highlightNavLink);


    // --- Feature 2: Fade-in Animation for Project Cards ---
    const projectCards = document.querySelectorAll('.project-card');

    if ('IntersectionObserver' in window) { // Check if Intersection Observer is supported
        const observerOptions = {
            root: null, // Use the viewport as the root
            rootMargin: '0px 0px -50px 0px', // Trigger slightly before it's fully in view (optional adjustment)
            threshold: 0.1 // Trigger when 10% of the element is visible
        };

        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Optional: Stop observing once it's visible if you only want the animation once
                    observer.unobserve(entry.target);
                }
                // Optional: Remove class if it goes out of view (for animations on scroll up/down)
                // else {
                //     entry.target.classList.remove('is-visible');
                // }
            });
        };

        const cardObserver = new IntersectionObserver(observerCallback, observerOptions);

        projectCards.forEach(card => {
            cardObserver.observe(card); // Start observing each project card
        });

    } else {
        // Fallback for older browsers: just make all cards visible immediately
        console.warn("Intersection Observer not supported, showing all cards without animation.");
        projectCards.forEach(card => {
            card.classList.add('is-visible'); // Add the class directly
        });
    }

    console.log("JavaScript enhancements initialized.");
}); // End of DOMContentLoaded listener