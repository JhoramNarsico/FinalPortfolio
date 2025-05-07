document.addEventListener('DOMContentLoaded', () => {
    console.log("Portfolio script loaded and DOM fully parsed.");

    // --- Cache DOM Elements ---
    const header = document.querySelector('header');
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('header nav a');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const projectItems = document.querySelectorAll('.project-item');
    const highlightBlock = document.querySelector('.showcase-highlight-block'); // For the swords icon
    const finalShowcase = document.querySelector('.final-project-showcase'); // For the grand entrance


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
            if (section.classList.contains('section-is-visible') || getComputedStyle(section).opacity !== '0') {
                const sectionTop = section.offsetTop - adjustedHeaderOffset;
                const sectionBottom = sectionTop + section.offsetHeight;
                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    currentSectionId = section.getAttribute('id');
                }
            }
        });

         if (!currentSectionId && sections.length > 0) {
            for (let i = sections.length - 1; i >= 0; i--) {
                 if ((sections[i].classList.contains('section-is-visible') || getComputedStyle(sections[i]).opacity !== '0') &&
                     scrollPosition >= sections[i].offsetTop - adjustedHeaderOffset) {
                    currentSectionId = sections[i].getAttribute('id');
                    break;
                }
            }
         }

        if ((window.innerHeight + scrollPosition) >= document.body.offsetHeight - 50 && sections.length > 0) {
            currentSectionId = sections[sections.length - 1].getAttribute('id');
        }
        else if (sections.length > 0 && scrollPosition < sections[0].offsetTop - adjustedHeaderOffset) {
             currentSectionId = sections[0].getAttribute('id');
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
             header.classList.remove('scrolled');
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
        handleHeaderScroll();
    }, 50));

    // Initial calls on page load
    handleHeaderScroll();
    handleScrollTopBtn();


    // --- Feature 4: Staggered Fade-in Animation for Project Items ---
    if ('IntersectionObserver' in window && projectItems.length > 0) {
        const projectObserverOptions = {
            root: null,
            rootMargin: '0px 0px -80px 0px',
            threshold: 0.1
        };
        let itemIndex = 0;
        const processedItems = new WeakSet();

        const projectObserverCallback = (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !processedItems.has(entry.target)) {
                    const staggerDelay = itemIndex * 100;
                    entry.target.style.setProperty('--card-delay', `${0.3 + staggerDelay / 1000}s`);
                    entry.target.classList.add('is-visible');
                    processedItems.add(entry.target);
                    itemIndex++;
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
            rootMargin: '0px 0px -15% 0px',
            threshold: 0
        };
        const sectionObserverCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('section-is-visible');
                    debounce(highlightNavLink, 50)();
                }
            });
        };
        const sectionObserver = new IntersectionObserver(sectionObserverCallback, sectionObserverOptions);
        sections.forEach(section => {
            sectionObserver.observe(section);
        });

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            if (rect.top < viewportHeight * (1 - 0.15)) {
                if (rect.bottom > 0) {
                     section.classList.add('section-is-visible');
                }
            }
        });
         highlightNavLink();
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

    // --- Scroll-Driven Animation for Showcase Highlight Block Icon (SWORDS ICON) ---
    if (highlightBlock && 'IntersectionObserver' in window) {
        const iconObserverOptions = {
            root: null,
            threshold: 0.2 // Trigger when 20% of the block is visible
        };
        const iconObserverCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('icon-animate-in');
                    // observer.unobserve(entry.target); // Optional: unobserve if you want it only once
                } else {
                    // entry.target.classList.remove('icon-animate-in'); // Optional: re-animate
                }
            });
        };
        const iconObserver = new IntersectionObserver(iconObserverCallback, iconObserverOptions);
        iconObserver.observe(highlightBlock);
    }

    // --- IntersectionObserver for the Final Project Showcase "Grand Entrance" ---
    if (finalShowcase && 'IntersectionObserver' in window) {
        const showcaseObserverOptions = {
            root: null,
            threshold: 0.1, // Trigger when 10% of the element is visible
            rootMargin: '0px 0px -50px 0px' // Start animation a bit before it's fully in view
        };

        const showcaseObserverCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    target.classList.add('is-showcasing'); // Trigger parent's grand entrance

                    // Use transitionend to trigger children's animations after parent is done
                    const handleParentTransitionEnd = (event) => {
                        // Listen for opacity or transform, and only on the showcase block itself
                        if (event.target === target && (event.propertyName === 'opacity' || event.propertyName === 'transform')) {
                            target.classList.add('animate-showcase-children');
                            target.removeEventListener('transitionend', handleParentTransitionEnd); // Clean up listener
                        }
                    };
                    target.addEventListener('transitionend', handleParentTransitionEnd);

                    observer.unobserve(target); // Animate only once
                }
            });
        };
        const showcaseObserver = new IntersectionObserver(showcaseObserverCallback, showcaseObserverOptions);
        showcaseObserver.observe(finalShowcase);
    } else if (finalShowcase) {
        // Fallback for browsers without IntersectionObserver or if something goes wrong
        finalShowcase.classList.add('is-showcasing');
        finalShowcase.classList.add('animate-showcase-children');
    }
    // --- END Final Project Showcase Observer ---

    console.log("JavaScript enhancements initialized.");

}); // End of DOMContentLoaded listener