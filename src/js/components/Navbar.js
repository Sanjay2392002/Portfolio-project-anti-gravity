/* =============================================================
   NAVBAR COMPONENT & SCROLL TRACKING
   ============================================================= */
export const initNavbar = () => {
    initHeaderToggle();
    initSmoothLinks();
    initIntersectionObserver();
};

const initHeaderToggle = () => {
    const toggle = document.getElementById('menu-toggle');
    const nav    = document.getElementById('main-nav');
    const bars   = toggle?.querySelectorAll('.bar');

    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            const open = nav.classList.toggle('mobile-open');
            if (bars?.length >= 3) {
                bars[0].style.transform = open ? 'rotate(45deg) translate(4px,4px)' : 'none';
                bars[1].style.opacity   = open ? '0' : '1';
                bars[2].style.transform = open ? 'rotate(-45deg) translate(5px,-5px)' : 'none';
            }
        });
    }
};

const initSmoothLinks = () => {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const href = a.getAttribute('href');
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                
                // Close mobile nav if open
                const nav = document.getElementById('main-nav');
                if (nav?.classList.contains('mobile-open')) {
                    document.getElementById('menu-toggle')?.click();
                }

                if (window.lenis) {
                    window.lenis.scrollTo(target, { offset: href === '#about-resume' ? -40 : 0 });
                } else {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
};

const initIntersectionObserver = () => {
    const sections  = document.querySelectorAll('section[id]');
    const navLinks  = document.querySelectorAll('.nav-link');
    const dotLinks  = document.querySelectorAll('.dot-link');

    if (!sections.length) return;

    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const id = entry.target.id;
            navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
            dotLinks.forEach(d => d.classList.toggle('active', d.getAttribute('href') === `#${id}`));
        });
    }, { threshold: 0.25 });

    sections.forEach(s => obs.observe(s));
};
