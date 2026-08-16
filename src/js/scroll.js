/* =============================================================
   SCROLL SYSTEM (Lenis + GSAP ScrollTrigger)
   ============================================================= */
export const initScroll = () => {
    if (typeof Lenis === 'undefined' || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('Lenis or GSAP ScrollTrigger is not loaded.');
        return;
    }

    const lenis = new Lenis({
        duration: 1.2,
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true
    });
    window.lenis = lenis;

    const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    /* Header auto-hide & shrink */
    const header = document.querySelector('.site-header');
    let lastScroll = 0;

    lenis.on('scroll', e => {
        const cur = e.scroll;
        if (header) {
            if (cur > lastScroll && cur > 120) header.classList.add('site-header--hidden');
            else header.classList.remove('site-header--hidden');

            if (cur > 40) {
                header.style.height = '64px';
                header.style.backgroundColor = 'rgba(250,250,247,0.98)';
            } else {
                header.style.height = 'var(--header-h)';
                header.style.backgroundColor = 'rgba(250,250,247,0.88)';
            }
        }

        /* Progress bar */
        const bar = document.getElementById('scroll-progress');
        if (bar) {
            const total = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.width = total > 0 ? `${(cur / total) * 100}%` : '0%';
        }

        lastScroll = cur;
    });

    /* Portrait parallax */
    gsap.utils.toArray('.hero-portrait-img, .about-portrait-img').forEach(img => {
        gsap.to(img, {
            yPercent: 8, ease: 'none',
            scrollTrigger: { trigger: img.parentNode, start: 'top bottom', end: 'bottom top', scrub: true }
        });
    });

    /* Fade reveal for sections */
    const revealSelectors = [
        '.section-badge',
        '.section-title',
        '.about-bio',
        '.about-grid',
        '.services-grid',
        '.service-card',
        '.contact-content'
    ];

    gsap.utils.toArray(revealSelectors.join(',')).forEach(el => {
        gsap.fromTo(el,
            { opacity: 0, y: 22 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
              scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' } });
    });
};
