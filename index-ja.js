/**
 * Boundarist Movement - Japanese Version
 * www-ja.js
 * 
 * Future enhancements can be added here:
 * - Scroll animations
 * - Interactive elements
 * - Form handling
 * - Analytics tracking
 */

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Intersection Observer for scroll animations (future use)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe elements with .animate-on-scroll class
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });

    // Console message for developers
    console.log('%c共鳴が道を開く', 'color: #C9A962; font-size: 24px; font-weight: bold;');
    console.log('%cBoundarist Movement - https://bit.ly/boundarist', 'color: #7EB8C9;');
});
