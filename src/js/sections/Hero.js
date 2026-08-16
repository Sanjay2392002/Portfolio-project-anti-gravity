/* =============================================================
   HERO SECTION ACTIONS
   ============================================================= */
let heroCycleTimer = null;

export const initHero = (baseTitle = 'PORTFOLIO') => {
    initHeroAnimations();
    initHeroTextCycle(baseTitle);
};

const initHeroTextCycle = (baseTitle = 'PORTFOLIO') => {
    const el = document.getElementById('hero-dynamic-text');
    if (!el) return;

    const words = [
        baseTitle,
        'VISUAL DESIGNER',
        'BRAND IDENTITY',
        'LOGO DESIGNER',
        'UI/UX DESIGNER',
        'ART DIRECTOR'
    ];
    let idx = 0;

    if (heroCycleTimer) clearInterval(heroCycleTimer);

    heroCycleTimer = setInterval(() => {
        idx = (idx + 1) % words.length;
        if (typeof gsap !== 'undefined') {
            gsap.to(el, {
                y: -14, opacity: 0, duration: 0.35, ease: 'power2.in',
                onComplete: () => {
                    el.textContent = words[idx];
                    gsap.fromTo(el,
                        { y: 14, opacity: 0 },
                        { y: 0,  opacity: 1, duration: 0.5, ease: 'power2.out' });
                }
            });
        } else {
            el.textContent = words[idx];
        }
    }, 3000);
};

const initHeroAnimations = () => {
    if (typeof gsap === 'undefined') return;
    const tl = gsap.timeline();
    
    gsap.set(['.hero-badge', '#hero-dynamic-text', '.hero-desc', '.hero-actions .btn', '.hero-portrait-frame', '.scroll-indicator'],
             { opacity: 0, y: 20 });
             
    tl.to('.hero-badge',           { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
      .to('#hero-dynamic-text',    { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
      .to('.hero-desc',            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
      .to('.hero-actions .btn',    { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.15 }, '-=0.5')
      .to('.hero-portrait-frame',  { opacity: 1, y: 0, scale: 1, duration: 1.0, ease: 'power2.out' }, '-=0.9')
      .to('.scroll-indicator',     { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.4');
};
