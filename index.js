/* Boundarist Movement - English version
 * index.js
 *
 * Basic interactions and small enhancements:
 * - Smooth anchor scrolling
 * - Intersection observer to add visibility classes
 * - Developer console message
 */

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for hash anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return; // allow placeholders
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Simple intersection observer to add a .visible class on reveal
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { root: null, rootMargin: '0px', threshold: 0.1 });

    // Observe typical elements that animate
    document.querySelectorAll('.animate-on-scroll, .hero-tagline, .hero h1, .hero-sub, .hero-cta, .scroll-hint').forEach(el => {
        observer.observe(el);
    });

    // Console message for developers
    console.log('%c"Resonance Opens the Way"', 'color: #C9A962; font-size: 18px; font-weight: bold;');
});