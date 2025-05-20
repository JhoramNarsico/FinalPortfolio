document.addEventListener('DOMContentLoaded', () => {
    console.log("Portfolio script loaded and DOM fully parsed.");

    // --- Cache DOM Elements ---
    const body = document.body;
    const root = document.documentElement;
    const header = document.querySelector('header');
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('header .nav-primary a');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const projectItems = document.querySelectorAll('.project-item');
    const projectCategories = document.querySelectorAll('.project-category');
    const finalShowcaseSection = document.querySelector('.final-project-showcase');
    const mainTitle = document.querySelector('header h1 a'); // For new title animation
    const skillListItems = document.querySelectorAll('#about .key-skills li'); // For skill interaction

    // --- Hamburger Menu Elements ---
    const navToggle = document.querySelector('.nav-toggle');
    const primaryNav = document.querySelector('.nav-primary');

    let currentBlobThemeClass = '';
    let currentActiveProjectCategoryKey = null;

    // --- Blob Color Definitions ---
    const getCssVar = (varName) => getComputedStyle(root).getPropertyValue(varName).trim();
    const blobColorSchemes = {
        default: { h1: getCssVar('--default-blob-hue1'), s1: getCssVar('--default-blob-sat1'), l1: getCssVar('--default-blob-light1'), h2: getCssVar('--default-blob-hue2'), s2: getCssVar('--default-blob-sat2'), l2: getCssVar('--default-blob-light2'), },
        about: { h1: getCssVar('--about-blob-hue'), s1: getCssVar('--about-blob-sat'), l1: getCssVar('--about-blob-lightness1'), h2: getCssVar('--about-blob-hue'), s2: getCssVar('--about-blob-sat'), l2: getCssVar('--about-blob-lightness2'), },
        prelim: { h1: getCssVar('--prelim-blob-hue'), s1: getCssVar('--prelim-blob-sat'), l1: getCssVar('--prelim-blob-lightness1'), h2: getCssVar('--prelim-blob-hue'), s2: getCssVar('--prelim-blob-sat'), l2: getCssVar('--prelim-blob-lightness2'), },
        midterm: { h1: getCssVar('--midterm-blob-hue'), s1: getCssVar('--midterm-blob-sat'), l1: getCssVar('--midterm-blob-lightness1'), h2: getCssVar('--midterm-blob-hue'), s2: getCssVar('--midterm-blob-sat'), l2: getCssVar('--midterm-blob-lightness2'), },
        final: { h1: getCssVar('--final-blob-hue'), s1: getCssVar('--final-blob-sat'), l1: getCssVar('--final-blob-lightness1'), h2: getCssVar('--final-blob-hue'), s2: getCssVar('--final-blob-sat'), l2: getCssVar('--final-blob-lightness2'), },
        contact: { h1: getCssVar('--contact-blob-hue1'), s1: getCssVar('--contact-blob-sat1'), l1: getCssVar('--contact-blob-light1'), h2: getCssVar('--contact-blob-hue2'), s2: getCssVar('--contact-blob-sat2'), l2: getCssVar('--contact-blob-light2'), }
    };

    // --- Define Hover Colors for Item Borders ---
    const itemHoverColors = {
        'tag-html': '#e34f26',
        'tag-css': '#1572b6',
        'tag-js': '#f0db4f',
        'tag-php': '#7f4ff0'
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
        const headerHeight = header ? header.offsetHeight : (parseFloat(getCssVar('--header-height-scrolled')) || 60) ;
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
                 const c = blobColorSchemes.prelim;
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
            if (!body.classList.contains('blob-theme-projects')) return;
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
            const isNavOpen = body.classList.contains('nav-open');
            if (isNavOpen) {
                navToggle.setAttribute('aria-expanded', 'false');
                body.classList.remove('nav-open');
            } else {
                navToggle.setAttribute('aria-expanded', 'true');
                body.classList.add('nav-open');
            }
        });
        primaryNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (body.classList.contains('nav-open')) {
                    navToggle.setAttribute('aria-expanded', 'false');
                    body.classList.remove('nav-open');
                }
            });
        });
    }

    // --- Header Transformation on Scroll ---
    const handleHeaderScroll = () => {
        if (!header) return;
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
        handleHeaderScroll();
        highlightNavLinkAndSectionBlobs();
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
                }
            });
        }, projectItemObserverOptions);
        projectItems.forEach(item => projectItemObserver.observe(item));
    } else {
        projectItems.forEach(item => { item.style.setProperty('--card-delay', '0.3s'); item.classList.add('is-visible'); });
    }

    // --- Section Entrance Animation ---
    if ('IntersectionObserver' in window && sections.length > 0) {
         const sectionObserverOptions = { root: null, rootMargin: '0px 0px -15% 0px', threshold: 0 };
        const sectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('section-is-visible');
                }
            });
        }, sectionObserverOptions);
        sections.forEach(section => {
            if (section.getBoundingClientRect().top < window.innerHeight * 0.85 && section.getBoundingClientRect().bottom > 0) {
                section.classList.add('section-is-visible');
            }
            sectionObserver.observe(section);
        });
    } else {
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
                }
            });
        }, { root: null, threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        showcaseContentObserver.observe(finalShowcaseContentAnimator);
    } else if (finalShowcaseContentAnimator) {
        finalShowcaseContentAnimator.classList.add('is-showcasing', 'animate-showcase-children');
    }

    // Showcase Icon animation
    const highlightBlock = document.querySelector('.showcase-highlight-block');
    if (highlightBlock && 'IntersectionObserver' in window) {
         const iconObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('icon-animate-in');
                }
            });
        }, { root: null, threshold: 0.2 });
        iconObserver.observe(highlightBlock);
    } else if (highlightBlock) {
        highlightBlock.classList.add('icon-animate-in');
    }

    // --- UPDATED Function to apply styles to individual project items ---
    const initializeProjectItemStyles = () => {
        const itemTintColors = {
            'tag-html': { base: 'hsl(13, 78%, 58%)' },
            'tag-css': { base: 'hsl(207, 79%, 41%)'},
            'tag-js': { base: 'hsl(53, 87%, 60%)' },
            'tag-php': { base: 'hsl(257, 85%, 65%)'}
        };

        projectItems.forEach(item => {
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

            if (jsCount > 0 || phpCount > 0) {
                if (jsCount >= phpCount) actualDominantTagClassForItem = 'tag-js';
                else actualDominantTagClassForItem = 'tag-php';
            } else if (htmlCount > 0 || cssCount > 0) {
                if (htmlCount >= cssCount) actualDominantTagClassForItem = 'tag-html';
                else actualDominantTagClassForItem = 'tag-css';
            }

            let harmonizationDominantTagClass = actualDominantTagClassForItem;
            const parentCategory = item.closest('.project-category');
            if (parentCategory) {
                const categoryId = parentCategory.dataset.categoryId;
                if (categoryId === 'midterm-finals') {
                    if (actualDominantTagClassForItem === 'tag-html' && (jsCount > 0 || phpCount > 0)) {
                        harmonizationDominantTagClass = jsCount >= phpCount ? 'tag-js' : 'tag-php';
                    } else if (actualDominantTagClassForItem === 'tag-html') {
                         harmonizationDominantTagClass = 'tag-css';
                    } else {
                        harmonizationDominantTagClass = actualDominantTagClassForItem;
                    }
                } else if (categoryId === 'prelim') {
                    if (actualDominantTagClassForItem === 'tag-js' || actualDominantTagClassForItem === 'tag-php') {
                         harmonizationDominantTagClass = 'tag-html';
                    } else {
                        harmonizationDominantTagClass = actualDominantTagClassForItem;
                    }
                }
            }

            const effectiveDominantTag = harmonizationDominantTagClass || actualDominantTagClassForItem;

            if (effectiveDominantTag && itemTintColors[effectiveDominantTag]) {
                const colorInfo = itemTintColors[effectiveDominantTag];
                const hslMatch = colorInfo.base.match(/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/);
                if (hslMatch) {
                    item.style.setProperty('--project-dominant-hue', hslMatch[1]);
                    item.style.setProperty('--project-dominant-saturation', hslMatch[2] + '%');
                    let tintLightness = parseFloat(hslMatch[3]);
                    tintLightness = Math.min(96, tintLightness + (100 - tintLightness) * 0.8);
                    item.style.setProperty('--project-dominant-lightness', tintLightness + '%');
                    item.classList.add('project-item--has-dominant-color');
                }
            } else {
                item.classList.remove('project-item--has-dominant-color');
                item.style.setProperty('--project-dominant-hue', getCssVar('--default-blob-hue1'));
                item.style.setProperty('--project-dominant-saturation', getCssVar('--default-blob-sat1'));
                item.style.setProperty('--project-dominant-lightness', getCssVar('--default-blob-light1'));
            }

            const hoverBorderColor = itemHoverColors[effectiveDominantTag] || defaultItemHoverColor;
            item.style.setProperty('--item-dominant-hover-color', hoverBorderColor);

            const dominantMainColor = itemHoverColors[effectiveDominantTag] || defaultItemHoverColor;
            const dominantContrastTextColor = itemTextColors[effectiveDominantTag] || itemTextColors['default'] || defaultItemTextColor;

            item.style.setProperty('--project-item-dominant-main-color', dominantMainColor);
            item.style.setProperty('--project-item-dominant-contrast-text-color', dominantContrastTextColor);

            const isLightDominant = ['tag-js'].includes(effectiveDominantTag);
            item.style.setProperty('--project-item-title-text-color', isLightDominant ? getCssVar('--primary-color') : dominantMainColor);
        });
        console.log("Project item card tinting, hover borders, and text harmonization initialized/updated.");
    };

    initializeProjectItemStyles();

    // --- Hero Title Letter Animation ---
    if (mainTitle) {
        const originalTitleText = mainTitle.textContent.replace(/\s*-\s*Portfolio Home\s*$/, "").trim(); // Extracts "Jhoram's Portfolio"
        const srOnlySpan = mainTitle.querySelector('.sr-only'); // Store the original sr-only span

        mainTitle.innerHTML = ''; // Clear the <a> tag's content

        originalTitleText.split('').forEach((char, index) => {
            const span = document.createElement('span');
            span.className = 'char-animated';
            span.textContent = char === ' ' ? '\u00A0' : char; // Handle spaces by using a non-breaking space
            span.style.animationDelay = `${index * 0.05}s`; // Staggered delay for each character
            mainTitle.appendChild(span);
        });

        if (srOnlySpan) { // If an sr-only span existed, re-append it to the end
            mainTitle.appendChild(srOnlySpan);
        }
        mainTitle.classList.add('title-animated'); // Add class to <a> for styling context if needed
        console.log("Hero title letter animation initialized.");
    }


    // --- Enhanced Skill Item Interaction ---
    skillListItems.forEach(item => {
        // const icon = item.querySelector('.skill-icon'); // Not strictly needed if CSS targets via parent
        item.addEventListener('mouseenter', () => {
            item.classList.add('skill-item--active');
        });
        item.addEventListener('mouseleave', () => {
            item.classList.remove('skill-item--active');
        });
    });
    console.log("Skill item interaction initialized.");


    // --- Personalized Touches for Final Project Showcase ---

    // 1. Thematic Cursor for .final-project-showcase
    const finalShowcaseAreaForCursor = document.querySelector('.final-project-showcase');
    if (finalShowcaseAreaForCursor) {
        finalShowcaseAreaForCursor.addEventListener('mouseenter', () => {
            finalShowcaseAreaForCursor.classList.add('showcase-custom-cursor');
        });
        finalShowcaseAreaForCursor.addEventListener('mouseleave', () => {
            finalShowcaseAreaForCursor.classList.remove('showcase-custom-cursor');
        });
        console.log("Final showcase custom cursor initialized (hover section).");
    }

    // 2. Parallax on Hover for .showcase-highlight-block
    const highlightBlockForParallax = document.querySelector('.showcase-highlight-block');
    if (highlightBlockForParallax) {
        const parallaxIntensityAfter = 0.03;    // How much the ::after (emoji) moves
        const parallaxIntensityContent = 0.015; // How much the text content moves

        const h4El = highlightBlockForParallax.querySelector('h4');
        const pEl = highlightBlockForParallax.querySelector('p');
        const tagsEl = highlightBlockForParallax.querySelector('.project-tags');

        highlightBlockForParallax.addEventListener('mousemove', (e) => {
            const rect = highlightBlockForParallax.getBoundingClientRect();
            // Calculate mouse position relative to the center of the block
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Calculate translation values
            const afterTranslateX = x * parallaxIntensityAfter;
            const afterTranslateY = y * parallaxIntensityAfter;
            const contentTranslateX = -x * parallaxIntensityContent; // Opposite direction for content
            const contentTranslateY = -y * parallaxIntensityContent;

            // Apply to ::after element via CSS variables
            highlightBlockForParallax.style.setProperty('--parallax-after-x', `${afterTranslateX}px`);
            highlightBlockForParallax.style.setProperty('--parallax-after-y', `${afterTranslateY}px`);

            // Apply to content elements directly
            if (h4El) h4El.style.transform = `translate(${contentTranslateX}px, ${contentTranslateY}px)`;
            if (pEl) pEl.style.transform = `translate(${contentTranslateX}px, ${contentTranslateY}px)`;
            if (tagsEl) tagsEl.style.transform = `translate(${contentTranslateX}px, ${contentTranslateY}px)`;
        });

        highlightBlockForParallax.addEventListener('mouseleave', () => {
            // Reset ::after element transforms
            highlightBlockForParallax.style.setProperty('--parallax-after-x', `0px`);
            highlightBlockForParallax.style.setProperty('--parallax-after-y', `0px`);

            // Reset content element transforms
            if (h4El) h4El.style.transform = `translate(0px, 0px)`;
            if (pEl) pEl.style.transform = `translate(0px, 0px)`;
            if (tagsEl) tagsEl.style.transform = `translate(0px, 0px)`;
        });
        console.log("Final showcase highlight block parallax initialized.");
    }

    console.log("JavaScript enhancements initialized.");
});