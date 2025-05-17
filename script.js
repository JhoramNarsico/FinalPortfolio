document.addEventListener('DOMContentLoaded', () => {
    console.log("Portfolio script loaded and DOM fully parsed.");

    // --- Cache DOM Elements ---
    const body = document.body;
    const root = document.documentElement;
    const header = document.querySelector('header');
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('header .nav-primary a'); // Updated selector
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const projectItems = document.querySelectorAll('.project-item');
    const projectCategories = document.querySelectorAll('.project-category');
    const finalShowcaseSection = document.querySelector('.final-project-showcase');

    // --- Hamburger Menu Elements ---
    const navToggle = document.querySelector('.nav-toggle');
    const primaryNav = document.querySelector('.nav-primary');

    let currentBlobThemeClass = '';
    let currentActiveProjectCategoryKey = null;

    // --- Blob Color Definitions ---
    const getCssVar = (varName) => getComputedStyle(root).getPropertyValue(varName).trim();
    const blobColorSchemes = { /* ... (keep this as defined before) ... */
        default: { h1: getCssVar('--default-blob-hue1'), s1: getCssVar('--default-blob-sat1'), l1: getCssVar('--default-blob-light1'), h2: getCssVar('--default-blob-hue2'), s2: getCssVar('--default-blob-sat2'), l2: getCssVar('--default-blob-light2'), },
        about: { h1: getCssVar('--about-blob-hue'), s1: getCssVar('--about-blob-sat'), l1: getCssVar('--about-blob-lightness1'), h2: getCssVar('--about-blob-hue'), s2: getCssVar('--about-blob-sat'), l2: getCssVar('--about-blob-lightness2'), },
        prelim: { h1: getCssVar('--prelim-blob-hue'), s1: getCssVar('--prelim-blob-sat'), l1: getCssVar('--prelim-blob-lightness1'), h2: getCssVar('--prelim-blob-hue'), s2: getCssVar('--prelim-blob-sat'), l2: getCssVar('--prelim-blob-lightness2'), },
        midterm: { h1: getCssVar('--midterm-blob-hue'), s1: getCssVar('--midterm-blob-sat'), l1: getCssVar('--midterm-blob-lightness1'), h2: getCssVar('--midterm-blob-hue'), s2: getCssVar('--midterm-blob-sat'), l2: getCssVar('--midterm-blob-lightness2'), },
        final: { h1: getCssVar('--final-blob-hue'), s1: getCssVar('--final-blob-sat'), l1: getCssVar('--final-blob-lightness1'), h2: getCssVar('--final-blob-hue'), s2: getCssVar('--final-blob-sat'), l2: getCssVar('--final-blob-lightness2'), },
        contact: { h1: getCssVar('--contact-blob-hue1'), s1: getCssVar('--contact-blob-sat1'), l1: getCssVar('--contact-blob-light1'), h2: getCssVar('--contact-blob-hue2'), s2: getCssVar('--contact-blob-sat2'), l2: getCssVar('--contact-blob-light2'), }
    };

    // --- Define Hover Colors for Item Borders ---
    const itemHoverColors = {
        'tag-html': '#e34f26', // Original hover color from CSS
        'tag-css': '#1572b6',  // Original hover color from CSS
        'tag-js': '#f0db4f',   // Original hover color from CSS
        'tag-php': '#7f4ff0'   // Original hover color from CSS
    };
    const defaultItemHoverColor = getCssVar('--secondary-color');

    // --- Define Contrasting Text Colors for Item Backgrounds ---
    const itemTextColors = {
        'tag-js': '#323330',
        'default': 'var(--white-color)'
    };
    const defaultItemTextColor = 'var(--white-color)';


    // --- Helper to set active blob colors ---
    const setActiveBlobColors = (hue1, sat1, light1, hue2, sat2, light2) => {
        root.style.setProperty('--active-blob-hue1', hue1);
        root.style.setProperty('--active-blob-sat1', sat1);
        root.style.setProperty('--active-blob-light1', light1);
        root.style.setProperty('--active-blob-hue2', hue2);
        root.style.setProperty('--active-blob-sat2', sat2);
        root.style.setProperty('--active-blob-light2', light2);
    };

    // --- Debounce Function ---
    function debounce(func, wait = 15, immediate = false) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            const later = function() { timeout = null; if (!immediate) func.apply(context, args); };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    // --- Update Blob Theme (Shape/Animation Class) ---
    const updateBlobAppearanceTheme = (sectionId) => {
        const newThemeClass = sectionId ? `blob-theme-${sectionId}` : '';
        if (currentBlobThemeClass && currentBlobThemeClass !== newThemeClass) {
            body.classList.remove(currentBlobThemeClass);
        }
        if (newThemeClass && !body.classList.contains(newThemeClass)) {
            body.classList.add(newThemeClass);
        }
        currentBlobThemeClass = newThemeClass;
    };

    // --- Main Scroll Handler for Nav Highlighting and Section Blob Themes ---
    const highlightNavLinkAndSectionBlobs = () => {
        let currentSectionId = '';
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        const headerHeight = header ? header.offsetHeight : (parseFloat(getCssVar('--header-height-scrolled')) || 60) ; // Use scrolled height as base
        const activationPoint = scrollY + headerHeight + (viewportHeight - headerHeight) * 0.4;
        let bestMatch = { id: '', distance: Infinity };

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            if (activationPoint >= sectionTop && activationPoint < sectionBottom) {
                const distanceToActivation = Math.abs(sectionTop - activationPoint);
                if(distanceToActivation < bestMatch.distance) {
                    bestMatch = { id: section.getAttribute('id'), distance: distanceToActivation };
                }
            }
        });
        currentSectionId = bestMatch.id;

        if ((scrollY + viewportHeight + 150) >= document.body.offsetHeight && sections.length > 0) {
            currentSectionId = sections[sections.length - 1].getAttribute('id');
        } else if (sections.length > 0 && scrollY < sections[0].offsetTop - headerHeight - viewportHeight * 0.1) {
            currentSectionId = '';
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });

        updateBlobAppearanceTheme(currentSectionId);

        if (currentSectionId === 'about') {
            const c = blobColorSchemes.about;
            setActiveBlobColors(c.h1, c.s1, c.l1, c.h2, c.s2, c.l2);
            currentActiveProjectCategoryKey = null;
        } else if (currentSectionId === 'contact') {
            const c = blobColorSchemes.contact;
            setActiveBlobColors(c.h1, c.s1, c.l1, c.h2, c.s2, c.l2);
            currentActiveProjectCategoryKey = null;
        } else if (currentSectionId === 'projects') {
             if (!currentActiveProjectCategoryKey) {
                 const c = blobColorSchemes.prelim; // Default to prelim if no specific project category is active
                 setActiveBlobColors(c.h1, c.s1, c.l1, c.h2, c.s2, c.l2);
            }
        } else {
            const c = blobColorSchemes.default;
            setActiveBlobColors(c.h1, c.s1, c.l1, c.h2, c.s2, c.l2);
            currentActiveProjectCategoryKey = null;
        }
    };

    // --- Intersection Observer for Project Categories and Final Showcase ---
    if ('IntersectionObserver' in window && (projectCategories.length > 0 || finalShowcaseSection)) {
        const projectElementsToObserve = [...projectCategories, finalShowcaseSection].filter(el => el);
        const projectBlobObserverOptions = { root: null, rootMargin: '0px 0px -40% 0px', threshold: 0.1, };
        const projectBlobObserver = new IntersectionObserver((entries) => {
            if (!body.classList.contains('blob-theme-projects')) return; // Only act if in #projects section
            let topIntersectingEntry = null;
            entries.forEach(entry => {
                 if (entry.isIntersecting) {
                    if (!topIntersectingEntry || entry.boundingClientRect.top < topIntersectingEntry.boundingClientRect.top) {
                        topIntersectingEntry = entry;
                    }
                }
            });

            if (topIntersectingEntry) {
                const el = topIntersectingEntry.target;
                let newActiveKey = null;
                if (el.classList.contains('final-project-showcase')) {
                    newActiveKey = 'final';
                } else if (el.classList.contains('project-category')) {
                    const categoryId = el.dataset.categoryId;
                    if (categoryId === 'prelim') newActiveKey = 'prelim';
                    else if (categoryId === 'midterm-finals') newActiveKey = 'midterm';
                }

                if (newActiveKey && newActiveKey !== currentActiveProjectCategoryKey) {
                    const c = blobColorSchemes[newActiveKey];
                    if (c) {
                        setActiveBlobColors(c.h1, c.s1, c.l1, c.h2, c.s2, c.l2);
                        currentActiveProjectCategoryKey = newActiveKey;
                        console.log("Blob colors updated for project category:", newActiveKey);
                    }
                }
            }
        }, projectBlobObserverOptions);
        projectElementsToObserve.forEach(el => projectBlobObserver.observe(el));
    }

    // --- Hamburger Menu Toggle Functionality ---
    if (navToggle && primaryNav) {
        navToggle.addEventListener('click', () => {
            // const isVisible = primaryNav.getAttribute('data-visible') === 'true'; // Using class on body now
            const isNavOpen = body.classList.contains('nav-open');

            if (isNavOpen) {
                // primaryNav.setAttribute('data-visible', 'false');
                navToggle.setAttribute('aria-expanded', 'false');
                body.classList.remove('nav-open');
            } else {
                // primaryNav.setAttribute('data-visible', 'true');
                navToggle.setAttribute('aria-expanded', 'true');
                body.classList.add('nav-open');
            }
        });

        // Close mobile nav when a link is clicked
        primaryNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (body.classList.contains('nav-open')) {
                    // primaryNav.setAttribute('data-visible', 'false');
                    navToggle.setAttribute('aria-expanded', 'false');
                    body.classList.remove('nav-open');
                }
            });
        });
    }


    // --- Header Transformation on Scroll ---
    const handleHeaderScroll = () => {
        if (!header) return;
        // The 'scrolled' class now applies on mobile too, as mobile header is sticky.
        // No need for window.matchMedia check here anymore for this specific functionality.
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    // --- Scroll-to-Top Button Visibility ---
    const handleScrollTopBtn = () => {
        if (!scrollTopBtn) return;
        if (window.scrollY > 300) scrollTopBtn.classList.add('visible');
        else scrollTopBtn.classList.remove('visible');
    };

    // --- Combined Scroll Handler (Debounced) ---
    const onScroll = debounce(() => {
        highlightNavLinkAndSectionBlobs();
        handleHeaderScroll();
        handleScrollTopBtn();
    }, 20);

    // --- Add Event Listeners ---
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', debounce(() => {
        handleHeaderScroll(); // Recalculate header style on resize (e.g., if it becomes non-sticky)
        highlightNavLinkAndSectionBlobs(); // Recheck active section
        // Close mobile nav on resize to larger screen if it's open
        if (window.innerWidth > 767.98 && body.classList.contains('nav-open')) {
            body.classList.remove('nav-open');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    }, 50));

    // --- Initial Calls ---
    highlightNavLinkAndSectionBlobs();
    handleHeaderScroll();
    handleScrollTopBtn();

    // --- Staggered Fade-in Animation for Project Items ---
    if ('IntersectionObserver' in window && projectItems.length > 0) {
        const projectItemObserverOptions = { root: null, rootMargin: '0px 0px -80px 0px', threshold: 0.1 };
        let itemIndex = 0;
        const processedItems = new WeakSet();
        const projectItemObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !processedItems.has(entry.target)) {
                    entry.target.style.setProperty('--card-delay', `${0.3 + (itemIndex++ % 10) * 0.1}s`);
                    entry.target.classList.add('is-visible');
                    processedItems.add(entry.target);
                    // projectItemObserver.unobserve(entry.target); // Optional: unobserve after visible
                }
            });
        }, projectItemObserverOptions);
        projectItems.forEach(item => projectItemObserver.observe(item));
    } else { // Fallback for older browsers
        projectItems.forEach(item => { item.style.setProperty('--card-delay', '0.3s'); item.classList.add('is-visible'); });
    }

    // --- Section Entrance Animation ---
    if ('IntersectionObserver' in window && sections.length > 0) {
         const sectionObserverOptions = { root: null, rootMargin: '0px 0px -15% 0px', threshold: 0 }; // Trigger when 15% from bottom is visible
        const sectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('section-is-visible');
                    // observer.unobserve(entry.target); // Optional: unobserve after first intersection
                }
            });
        }, sectionObserverOptions);
        sections.forEach(section => {
            // Pre-check for sections already in view on load
            if (section.getBoundingClientRect().top < window.innerHeight * 0.85 && section.getBoundingClientRect().bottom > 0) {
                section.classList.add('section-is-visible');
            }
            sectionObserver.observe(section);
        });
    } else { // Fallback
        sections.forEach(section => section.classList.add('section-is-visible'));
    }

    // --- Scroll-to-Top Button Click Handler ---
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Final Project Showcase Content Animation ---
    const finalShowcaseContentAnimator = document.querySelector('.final-project-showcase');
    if (finalShowcaseContentAnimator && 'IntersectionObserver' in window) {
        const showcaseContentObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    target.classList.add('is-showcasing');
                    const handleTransitionEnd = (event) => {
                        if (event.target === target && (event.propertyName === 'opacity' || event.propertyName === 'transform')) {
                            target.classList.add('animate-showcase-children');
                            target.removeEventListener('transitionend', handleTransitionEnd);
                        }
                    };
                    target.addEventListener('transitionend', handleTransitionEnd);
                    // observer.unobserve(target); // Optional
                }
            });
        }, { root: null, threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        showcaseContentObserver.observe(finalShowcaseContentAnimator);
    } else if (finalShowcaseContentAnimator) { // Fallback
        finalShowcaseContentAnimator.classList.add('is-showcasing', 'animate-showcase-children');
    }

    // Showcase Icon animation
    const highlightBlock = document.querySelector('.showcase-highlight-block');
    if (highlightBlock && 'IntersectionObserver' in window) {
         const iconObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('icon-animate-in');
                    // observer.unobserve(entry.target); // Optional
                }
            });
        }, { root: null, threshold: 0.2 });
        iconObserver.observe(highlightBlock);
    } else if (highlightBlock) { // Fallback
        highlightBlock.classList.add('icon-animate-in');
    }


    // --- UPDATED Function to apply styles to individual project items ---
    const initializeProjectItemStyles = () => {
        // Define base HSL colors for item background tints
        const itemTintColors = {
            'tag-html': { base: 'hsl(13, 78%, 58%)' }, // Approx for #e34f26
            'tag-css': { base: 'hsl(207, 79%, 41%)'}, // Approx for #1572b6
            'tag-js': { base: 'hsl(53, 87%, 60%)' },  // Approx for #f0db4f
            'tag-php': { base: 'hsl(257, 85%, 65%)'}  // Approx for #7f4ff0 (made it more vibrant)
        };

        projectItems.forEach(item => {
            // 1. Determine ACTUAL Dominant Tag for This Item
            const categoryCounts = { 'tag-html': 0, 'tag-css': 0, 'tag-js': 0, 'tag-php': 0 };
            const tags = item.querySelectorAll('.project-tags .tag');
            tags.forEach(tag => {
                if (tag.classList.contains('tag-html')) categoryCounts['tag-html']++;
                else if (tag.classList.contains('tag-css')) categoryCounts['tag-css']++;
                else if (tag.classList.contains('tag-js')) categoryCounts['tag-js']++;
                else if (tag.classList.contains('tag-php')) categoryCounts['tag-php']++;
            });

            let actualDominantTagClassForItem = '';
            const jsCount = categoryCounts['tag-js'];
            const phpCount = categoryCounts['tag-php'];
            const htmlCount = categoryCounts['tag-html'];
            const cssCount = categoryCounts['tag-css'];

            // Prioritize JS/PHP, then HTML/CSS
            if (jsCount > 0 || phpCount > 0) {
                if (jsCount >= phpCount) actualDominantTagClassForItem = 'tag-js';
                else actualDominantTagClassForItem = 'tag-php';
            } else if (htmlCount > 0 || cssCount > 0) {
                if (htmlCount >= cssCount) actualDominantTagClassForItem = 'tag-html';
                else actualDominantTagClassForItem = 'tag-css';
            }

            // 2. Determine FORCED Dominant Tag for Harmonization based on section
            let harmonizationDominantTagClass = actualDominantTagClassForItem; // Default to actual
            const parentCategory = item.closest('.project-category');
            if (parentCategory) {
                const categoryId = parentCategory.dataset.categoryId;
                if (categoryId === 'midterm-finals') { // Midterm-Finals projects are primarily CSS/JS/PHP themed
                    // If actual dominant is HTML in a JS/PHP section, prefer JS or PHP for tint
                    if (actualDominantTagClassForItem === 'tag-html' && (jsCount > 0 || phpCount > 0)) {
                        harmonizationDominantTagClass = jsCount >= phpCount ? 'tag-js' : 'tag-php';
                    } else if (actualDominantTagClassForItem === 'tag-html') { // if only html/css tags present
                         harmonizationDominantTagClass = 'tag-css'; // fallback to CSS blue
                    } else {
                        harmonizationDominantTagClass = actualDominantTagClassForItem; // stick to actual JS or PHP
                    }
                } else if (categoryId === 'prelim') { // Prelim projects are HTML/CSS themed
                    if (actualDominantTagClassForItem === 'tag-js' || actualDominantTagClassForItem === 'tag-php') {
                         harmonizationDominantTagClass = 'tag-html'; // force HTML red
                    } else {
                        harmonizationDominantTagClass = actualDominantTagClassForItem; // stick to actual HTML or CSS
                    }
                }
            }

            // Use the determined harmonization tag (or fallback to actual) for tint, border, and text colors
            const effectiveDominantTag = harmonizationDominantTagClass || actualDominantTagClassForItem;

            // 3. Apply Background Tint Styles (using effective dominant tag)
            if (effectiveDominantTag && itemTintColors[effectiveDominantTag]) {
                const colorInfo = itemTintColors[effectiveDominantTag];
                const hslMatch = colorInfo.base.match(/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/);
                if (hslMatch) {
                    item.style.setProperty('--project-dominant-hue', hslMatch[1]);
                    item.style.setProperty('--project-dominant-saturation', hslMatch[2] + '%');
                    // For tint, use a higher lightness value than the base color
                    let tintLightness = parseFloat(hslMatch[3]);
                    tintLightness = Math.min(96, tintLightness + (100 - tintLightness) * 0.8); // Make it significantly lighter for a tint
                    item.style.setProperty('--project-dominant-lightness', tintLightness + '%');
                    item.classList.add('project-item--has-dominant-color');
                }
            } else {
                item.classList.remove('project-item--has-dominant-color');
                 // Reset to default if no effective tag found
                item.style.setProperty('--project-dominant-hue', getCssVar('--default-blob-hue1'));
                item.style.setProperty('--project-dominant-saturation', getCssVar('--default-blob-sat1'));
                item.style.setProperty('--project-dominant-lightness', getCssVar('--default-blob-light1'));
            }

            // 4. Apply Hover Border Color Style (using effective dominant tag)
            const hoverBorderColor = itemHoverColors[effectiveDominantTag] || defaultItemHoverColor;
            item.style.setProperty('--item-dominant-hover-color', hoverBorderColor);

            // 5. Apply Harmonized Colors for text elements (using effective dominant tag)
            const dominantMainColor = itemHoverColors[effectiveDominantTag] || defaultItemHoverColor;
            const dominantContrastTextColor = itemTextColors[effectiveDominantTag] || itemTextColors['default'] || defaultItemTextColor;

            item.style.setProperty('--project-item-dominant-main-color', dominantMainColor);
            item.style.setProperty('--project-item-dominant-contrast-text-color', dominantContrastTextColor);
            
            // Title color: use the dominant main color or fallback to primary if very light
            const isLightDominant = ['tag-js'].includes(effectiveDominantTag); // JS yellow is light
            item.style.setProperty('--project-item-title-text-color', isLightDominant ? getCssVar('--primary-color') : dominantMainColor);

        });
        console.log("Project item card tinting, hover borders, and text harmonization initialized/updated.");
    };

    initializeProjectItemStyles();

    console.log("JavaScript enhancements initialized.");
});