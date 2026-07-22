/* =============================================================
   1. STATE
   ============================================================= */
let allProjects      = [];
let activeModalId    = null;
let siteCategories   = [];

/* =============================================================
   2. API HELPERS
   ============================================================= */
const api = (endpoint) => {
    const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    if (isLocal) return endpoint;
    const base = (localStorage.getItem('production_api_url') || '').replace(/\/$/, '');
    return `${base}${endpoint}`;
};

const apiFetch = async (endpoint, opts = {}) => {
    const res = await fetch(api(endpoint), opts);
    if (!res.ok) throw new Error(`API ${endpoint} → ${res.status}`);
    return res.json();
};

/* =============================================================
   3. PROFILE / SITE CONTENT LOADING
   ============================================================= */
const loadSiteContent = async () => {
    try {
        const site = await apiFetch('/api/site');
        applySiteContent(site);
    } catch (e) {
        console.warn('Site content fallback:', e.message);
    }
};

const applySiteContent = (site) => {
    if (!site) return;

    /* Logo */
    const logoEl = document.getElementById('logo-text-val');
    if (logoEl && site.logo) logoEl.textContent = site.logo;

    /* Nav CTA */
    const navCta = document.getElementById('nav-cta');
    if (navCta && site.navCta) navCta.textContent = site.navCta;

    /* Nav links */
    if (site.nav && Array.isArray(site.nav)) {
        const navList = document.getElementById('nav-list');
        if (navList) {
            navList.innerHTML = site.nav.map((item, i) => `
                <li><a href="${item.href}" class="nav-link${i === 0 ? ' active' : ''}"
                       data-sec="${item.href.replace('#', '')}">${item.label}</a></li>
            `).join('');
            /* Re-bind nav click close on mobile */
            navList.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    const nav = document.getElementById('main-nav');
                    if (nav?.classList.contains('mobile-open')) {
                        document.getElementById('menu-toggle')?.click();
                    }
                });
            });
        }
    }

    /* Projects section */
    if (site.projects) {
        const el = (id) => document.getElementById(id);
        if (site.projects.sectionBadge) {
            const b = el('projects-badge');
            if (b) b.textContent = site.projects.sectionBadge;
        }
        if (site.projects.title) {
            const t = el('projects-title');
            if (t) {
                t.childNodes[0].textContent = site.projects.title + ' ';
            }
        }
        if (site.projects.titleItalic) {
            const ti = el('projects-title-italic');
            if (ti) ti.textContent = site.projects.titleItalic;
        }
        if (site.projects.categories) {
            siteCategories = site.projects.categories;
        }
    }

    /* Footer */
    if (site.footer) {
        const cp = document.getElementById('footer-copyright');
        if (cp && site.footer.copyright) cp.textContent = site.footer.copyright;
        const ty = document.getElementById('footer-thank-you');
        if (ty && site.footer.thankYouText) ty.textContent = site.footer.thankYouText;
    }

    /* Contact form categories */
    if (site.contactForm?.categories) {
        const sel = document.getElementById('form-category');
        if (sel) {
            sel.innerHTML = '<option value="" disabled selected>Select an option</option>';
            site.contactForm.categories.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.value;
                opt.textContent = c.label;
                sel.appendChild(opt);
            });
        }
    }
};

const loadProfileDetails = async () => {
    try {
        const profile = await apiFetch('/api/profile');
        applyProfile(profile);
    } catch (e) {
        console.warn('Profile fallback:', e.message);
    }
};

const applyProfile = (p) => {
    if (!p) return;

    /* ── Hero ── */
    if (p.hero) {
        const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.textContent = val; };
        set('hero-badge', p.hero.badge);
        set('hero-dynamic-text', p.hero.title);
        set('hero-desc', p.hero.description);

        const heroImg = document.getElementById('hero-portrait-img');
        if (heroImg && p.hero.portrait) heroImg.src = p.hero.portrait;

        const ctaP = document.getElementById('hero-cta-primary');
        if (ctaP && p.hero.ctaPrimary) ctaP.textContent = p.hero.ctaPrimary;
        const ctaS = document.getElementById('hero-cta-secondary');
        if (ctaS && p.hero.ctaSecondary) ctaS.textContent = p.hero.ctaSecondary;

        // Kick off text cycling with the loaded title
        if (p.hero.title) initHeroTextCycle(p.hero.title);
    }

    /* ── About ── */
    if (p.about) {
        const badge = document.getElementById('about-badge');
        if (badge && p.about.sectionBadge) badge.textContent = p.about.sectionBadge;

        const titleEl = document.getElementById('about-section-title');
        if (titleEl) {
            const main   = p.about.title   || 'About';
            const italic = p.about.titleItalic || '';
            titleEl.innerHTML = `${main} <br><span class="serif-italic">${italic}</span>`;
        }

        const bioEl = document.getElementById('about-bio');
        if (bioEl && p.about.bio) bioEl.textContent = p.about.bio;

        const aboutImg = document.getElementById('about-portrait-img');
        if (aboutImg && p.about.portrait) aboutImg.src = p.about.portrait;

        const resumeBtn = document.getElementById('btn-download-resume');
        if (resumeBtn) {
            if (p.about.resumeUrl) {
                resumeBtn.href = p.about.resumeUrl;
                resumeBtn.removeAttribute('tabindex');
            } else {
                resumeBtn.style.opacity = '0.4';
                resumeBtn.style.pointerEvents = 'none';
            }
            if (p.about.resumeLabel) {
                resumeBtn.childNodes[0].textContent = p.about.resumeLabel;
            }
        }

        /* Experience */
        const expEl = document.getElementById('about-experience-list');
        if (expEl && p.about.experience?.length) {
            expEl.innerHTML = p.about.experience.map(i => `
                <li>
                    <span class="timeline-date">${i.date}</span>
                    <span class="timeline-role">${i.role}</span>
                    <span class="timeline-company">${i.company}</span>
                </li>`).join('');
        }

        /* Education */
        const eduEl = document.getElementById('about-education-list');
        if (eduEl && p.about.education?.length) {
            eduEl.innerHTML = p.about.education.map(i => `
                <li>
                    <span class="timeline-date">${i.date}</span>
                    <span class="timeline-role">${i.role}</span>
                    <span class="timeline-company">${i.company}</span>
                </li>`).join('');
        }

        /* Capabilities */
        const capEl = document.getElementById('about-capabilities-list');
        if (capEl && p.about.capabilities?.length) {
            capEl.innerHTML = p.about.capabilities.map(c =>
                `<span class="skill-tag">${c}</span>`).join('');
        }

        /* Software */
        const softEl = document.getElementById('about-software-list');
        if (softEl && p.about.software?.length) {
            softEl.innerHTML = p.about.software.map(s =>
                `<div class="software-item" title="${s.name}">
                    <span class="soft-icon">${s.key}</span>
                    <span class="soft-name">${s.name}</span>
                </div>`).join('');
        }
    }

    /* ── Contact ── */
    if (p.contact) {
        const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.textContent = val; };

        const badge = document.getElementById('contact-badge');
        if (badge && p.contact.sectionBadge) badge.textContent = p.contact.sectionBadge;

        const heading = document.getElementById('contact-heading');
        if (heading) {
            const main   = p.contact.title   || "Let's shape your";
            const italic = p.contact.titleItalic || 'vision.';
            heading.innerHTML = `${main} <br><span class="serif-italic" id="contact-heading-italic">${italic}</span>`;
        }

        const desc = document.getElementById('contact-desc');
        if (desc && p.contact.description) desc.textContent = p.contact.description;

        const emailEl = document.getElementById('contact-email');
        if (emailEl && p.contact.email) {
            emailEl.href        = `mailto:${p.contact.email}`;
            emailEl.textContent = p.contact.email;
        }

        const phoneEl = document.getElementById('contact-phone');
        if (phoneEl && p.contact.phone) {
            phoneEl.href        = `tel:${p.contact.phone.replace(/\s+/g, '')}`;
            phoneEl.textContent = p.contact.phone;
        }

        set('contact-location', p.contact.location);

        /* Socials — rebuild dynamically so hidden ones vanish */
        if (p.contact.socials) {
            const container = document.getElementById('social-links-container');
            if (container) {
                const socMap = [
                    ['behance',   'Behance',   'behance-link'],
                    ['linkedin',  'LinkedIn',  'linkedin-link'],
                    ['instagram', 'Instagram', 'instagram-link'],
                    ['dribbble',  'Dribbble',  'dribbble-link'],
                    ['github',    'GitHub',    'github-link']
                ];
                container.innerHTML = '';
                socMap.forEach(([key, label, id]) => {
                    const url = p.contact.socials[key];
                    if (url) {
                        const a = document.createElement('a');
                        a.href = url;
                        a.target = '_blank';
                        a.rel = 'noopener noreferrer';
                        a.id = id;
                        a.className = 'social-link link-hover';
                        a.textContent = label;
                        container.appendChild(a);
                    }
                });
            }
        }
    }
};

/* =============================================================
   4. PROJECTS LOADING & RENDERING
   ============================================================= */
const FALLBACK_CATEGORIES = [
    'Logo Designs', 'Brand Identity', 'Social Media Designs', 'Print Designs',
    'Packaging Designs', 'Advertising Campaigns', 'Product Mockups',
    'UI UX Designs', 'Web Designs', 'Creative Photography', '3D & AI Visuals', 'Personal Projects'
];

const loadProjects = async () => {
    try {
        allProjects = await apiFetch('/api/projects');
    } catch (e) {
        console.warn('Using fallback projects:', e.message);
        allProjects = [];
    }
    renderProjects();
};

const getCategories = () => siteCategories.length ? siteCategories : FALLBACK_CATEGORIES;

const groupByCategory = () => {
    const cats = getCategories();
    const grouped = {};
    cats.forEach(c => (grouped[c] = []));
    allProjects.forEach(p => {
        const cat = p.category || 'Personal Projects';
        if (grouped[cat] !== undefined) grouped[cat].push(p);
        else {
            /* Try fuzzy match */
            const match = cats.find(c => c.toLowerCase() === cat.toLowerCase());
            if (match) grouped[match].push(p);
            else grouped['Personal Projects']?.push(p);
        }
    });
    return grouped;
};

const renderProjects = () => {
    const container = document.getElementById('categories-container');
    if (!container) return;

    const grouped  = groupByCategory();
    container.innerHTML = '';

    let visIdx = 1;

    Object.entries(grouped).forEach(([catName, projects]) => {
        if (!projects.length) return;

        const serialStr  = visIdx.toString().padStart(2, '0');
        const safeId     = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        visIdx++;

        const section = document.createElement('div');
        section.className = 'category-showcase-section';
        section.id = `cat-${safeId}`;

        let html = `
            <div class="category-header">
                <span class="category-number">${serialStr}.</span>
                <h3 class="category-heading">${catName}</h3>
            </div>
            <div class="category-editorial-grid">
        `;

        projects.forEach((proj, idx) => {
            const img   = proj.img || '';
            const desc  = proj.concept
                ? proj.concept.substring(0, 220) + (proj.concept.length > 220 ? '...' : '')
                : 'No concept narrative.';
            const year  = proj.year || '2026';

            let layout = 'project-card-standard';
            if (idx % 3 === 0)      layout = 'project-card-wide';
            else if (idx % 3 === 1) layout = 'project-card-portrait';
            else                    layout = 'project-card-square';

            const swatchHtml = (proj.swatches?.length)
                ? `<div class="project-card-swatches">
                    ${proj.swatches.map(c => `<span class="card-swatch-dot" style="background:${c};" title="${c}"></span>`).join('')}
                   </div>`
                : '';

            html += `
                <div class="project-editorial-card ${layout}">
                    <div class="project-card-inner">
                        <div class="project-img-wrapper" data-project-id="${proj.id}">
                            <img src="${img}" alt="${proj.title}" loading="lazy" class="optimized-project-img">
                            <div class="project-img-overlay">
                                <span class="project-view-badge">View Case</span>
                            </div>
                        </div>
                        <div class="project-card-info">
                            <div class="project-card-meta">
                                <span class="proj-meta-tag">Personal Studio</span>
                                <span class="proj-meta-year">${year}</span>
                            </div>
                            <h4 class="proj-title">${proj.title}</h4>
                            <p class="proj-desc">${desc}</p>
                            <div class="proj-card-specs">
                                <span><strong>Tools:</strong> ${proj.tools || '—'}</span>
                                <span><strong>Focus:</strong> ${proj.focus || '—'}</span>
                            </div>
                            ${swatchHtml}
                            <div class="project-card-actions">
                                <button class="btn btn-sm btn-outline view-case-btn"
                                        data-project-id="${proj.id}">
                                    Case Study
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        section.innerHTML = html;
        container.appendChild(section);
    });

    if (container.children.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;color:var(--text-muted);padding:5rem 0;">
                <p style="font-size:1.1rem;font-weight:600;margin-bottom:0.5rem;">No projects yet.</p>
                <p style="font-size:0.9rem;">Add projects from the <a href="admin.html" style="text-decoration:underline;">Admin Panel</a>.</p>
            </div>`;
        return;
    }

    /* GSAP entrance animations */
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        container.querySelectorAll('.project-editorial-card').forEach(card => {
            gsap.fromTo(card,
                { opacity: 0, y: 28 },
                {
                    opacity: 1, y: 0, duration: 0.75, ease: 'power2.out',
                    scrollTrigger: { trigger: card, start: 'top 93%', toggleActions: 'play none none none' }
                });
        });
    }

    /* Click events */
    container.querySelectorAll('[data-project-id]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = el.getAttribute('data-project-id');
            if (id) openModal(id);
        });
    });
};

/* =============================================================
   5. CASE STUDY MODAL
   ============================================================= */
const openModal = (id) => {
    const modal = document.getElementById('project-modal');
    if (!modal) return;

    loadModalData(id);
    history.pushState(null, '', `?project=${encodeURIComponent(id)}`);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    window.lenis?.stop();

    const wrapper = modal.querySelector('.modal-wrapper');
    if (typeof gsap !== 'undefined' && wrapper) {
        gsap.fromTo(wrapper,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' });
    }
};

const closeModal = () => {
    const modal = document.getElementById('project-modal');
    if (!modal?.classList.contains('open')) return;

    const wrapper = modal.querySelector('.modal-wrapper');
    const done = () => {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        history.pushState(null, '', window.location.pathname);
        activeModalId = null;
        window.lenis?.start();
    };

    if (typeof gsap !== 'undefined' && wrapper) {
        gsap.to(wrapper, { opacity: 0, y: 15, duration: 0.35, ease: 'power2.in', onComplete: done });
    } else {
        done();
    }
};

const loadModalData = (id) => {
    const proj = allProjects.find(p => p.id === id);
    if (!proj) return;
    activeModalId = id;

    const $ = (elId) => document.getElementById(elId);

    if ($('modal-img'))      { $('modal-img').src = proj.img || ''; $('modal-img').alt = proj.title; }
    if ($('modal-cat'))        $('modal-cat').textContent = proj.category || 'Project';
    if ($('modal-title'))      $('modal-title').textContent = proj.title;
    if ($('modal-client'))     $('modal-client').textContent = proj.client || 'Personal Concept';
    if ($('modal-year'))       $('modal-year').textContent = proj.year || '—';
    if ($('modal-duration'))   $('modal-duration').textContent = proj.duration || '—';
    if ($('modal-tools'))      $('modal-tools').textContent = proj.tools || '—';
    if ($('modal-focus'))      $('modal-focus').textContent = proj.focus || '—';
    if ($('modal-output'))     $('modal-output').textContent = proj.output || '—';
    if ($('modal-concept-text')) $('modal-concept-text').textContent = proj.concept || 'No concept narrative.';

    /* Swatches */
    const swatchesEl = $('modal-swatches');
    if (swatchesEl) {
        swatchesEl.innerHTML = '';
        (proj.swatches || ['#0044FF','#C85A32','#FAF9F5','#141518']).forEach(color => {
            swatchesEl.insertAdjacentHTML('beforeend', `
                <div class="swatch-group">
                    <div class="swatch" style="background:${color};"></div>
                    <span class="swatch-label">${color}</span>
                </div>`);
        });
    }

    /* Typography */
    const typoEl = $('modal-typo');
    if (typoEl) {
        typoEl.innerHTML = '';
        (proj.typography || []).forEach(t => {
            typoEl.insertAdjacentHTML('beforeend', `
                <div class="typo-row">
                    <span class="typo-font">${t.name}: ${t.font}</span>
                    <span class="typo-sample">AaBbCc (${t.size})</span>
                </div>`);
        });
    }

    /* Modal nav */
    updateModalNav(id);

    /* Share button */
    const shareBtn = $('modal-share-btn');
    if (shareBtn) {
        const clone = shareBtn.cloneNode(true);
        shareBtn.parentNode.replaceChild(clone, shareBtn);
        clone.addEventListener('click', () => {
            const url = `${location.origin}${location.pathname}?project=${encodeURIComponent(id)}`;
            navigator.clipboard.writeText(url).then(() => {
                clone.textContent = 'Link Copied ✓';
                setTimeout(() => { clone.textContent = 'Share Project'; }, 2000);
            }).catch(() => {});
        });
    }

    /* Scroll modal to top */
    const modal = document.getElementById('project-modal');
    if (modal) modal.scrollTop = 0;
};

const updateModalNav = (currentId) => {
    if (allProjects.length <= 1) {
        const footer = document.querySelector('.modal-navigation-footer');
        if (footer) footer.style.display = 'none';
        return;
    }
    const footer = document.querySelector('.modal-navigation-footer');
    if (footer) footer.style.display = 'grid';

    const idx  = allProjects.findIndex(p => p.id === currentId);
    const prev = allProjects[(idx - 1 + allProjects.length) % allProjects.length];
    const next = allProjects[(idx + 1) % allProjects.length];

    const prevTitle = document.getElementById('modal-prev-title');
    const nextTitle = document.getElementById('modal-next-title');
    if (prevTitle) prevTitle.textContent = prev.title;
    if (nextTitle) nextTitle.textContent = next.title;

    const prevBtn = document.getElementById('modal-prev-project');
    const nextBtn = document.getElementById('modal-next-project');

    const replaceBtn = (btn, targetId) => {
        if (!btn) return;
        const clone = btn.cloneNode(true);
        btn.parentNode.replaceChild(clone, btn);
        clone.addEventListener('click', () => transitionModal(targetId));
    };
    replaceBtn(prevBtn, prev.id);
    replaceBtn(nextBtn, next.id);
};

const transitionModal = (targetId) => {
    const study = document.querySelector('.modal-case-study');
    if (!study) return;
    if (typeof gsap !== 'undefined') {
        gsap.to(study, {
            opacity: 0, y: -12, duration: 0.3, ease: 'power2.in',
            onComplete: () => {
                loadModalData(targetId);
                history.pushState(null, '', `?project=${encodeURIComponent(targetId)}`);
                gsap.to(study, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
            }
        });
    } else {
        loadModalData(targetId);
    }
};

const initModal = () => {
    const closeBtn = document.querySelector('.modal-close');
    const modal    = document.getElementById('project-modal');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (modal)    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
        if (modal?.classList.contains('open')) {
            if (e.key === 'ArrowLeft')  document.getElementById('modal-prev-project')?.click();
            if (e.key === 'ArrowRight') document.getElementById('modal-next-project')?.click();
        }
    });
};

/* =============================================================
   6. HERO TEXT CYCLE
   ============================================================= */
let heroCycleTimer = null;

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

/* =============================================================
   7. CUSTOM CURSOR
   ============================================================= */
const initCursor = () => {
    const cursor    = document.querySelector('.custom-cursor');
    const cursorDot = document.querySelector('.custom-cursor-dot');
    if (!cursor || !cursorDot) return;

    let mX = 0, mY = 0, cX = 0, cY = 0, dX = 0, dY = 0;

    window.addEventListener('mousemove', e => {
        mX = e.clientX; mY = e.clientY;
        document.body.classList.add('cursor-active');
    });

    document.addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));

    const tick = () => {
        cX += (mX - cX) * 0.12; cY += (mY - cY) * 0.12;
        dX += (mX - dX) * 0.25; dY += (mY - dY) * 0.25;
        cursor.style.transform    = `translate3d(${cX}px,${cY}px,0) translate(-50%,-50%)`;
        cursorDot.style.transform = `translate3d(${dX}px,${dY}px,0) translate(-50%,-50%)`;
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    const targets = 'a,button,input,select,textarea,.project-img-wrapper,.dot-link';
    document.body.addEventListener('mouseenter', e => {
        if (!e.target.matches) return;
        const txt = cursor.querySelector('.cursor-text');
        if (e.target.closest('.project-img-wrapper') || e.target.matches('.project-img-wrapper')) {
            cursor.classList.add('view-hover');
            if (txt) txt.textContent = 'VIEW';
        } else if (e.target.closest('.modal-close') || e.target.matches('.modal-backdrop')) {
            cursor.classList.add('close-hover');
            if (txt) txt.textContent = 'CLOSE';
        } else if (e.target.matches(targets)) {
            cursor.classList.add('hovered');
        }
    }, true);

    document.body.addEventListener('mouseleave', e => {
        if (!e.target.matches) return;
        cursor.classList.remove('hovered', 'view-hover', 'close-hover');
        const txt = cursor.querySelector('.cursor-text');
        if (txt) txt.textContent = '';
    }, true);
};

/* =============================================================
   8. SCROLL SYSTEM (Lenis + GSAP)
   ============================================================= */
const initScroll = () => {
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
    gsap.utils.toArray('.hero-portrait-img,.about-portrait-img').forEach(img => {
        gsap.to(img, {
            yPercent: 8, ease: 'none',
            scrollTrigger: { trigger: img.parentNode, start: 'top bottom', end: 'bottom top', scrub: true }
        });
    });

    /* Fade reveal */
    gsap.utils.toArray('.section-badge,.section-title,.about-bio,.about-grid,.contact-content').forEach(el => {
        gsap.fromTo(el,
            { opacity: 0, y: 22 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
              scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' } });
    });
};

/* =============================================================
   9. HEADER, MOBILE NAV, FORMS
   ============================================================= */
const initHeader = () => {
    const toggle   = document.getElementById('menu-toggle');
    const nav      = document.getElementById('main-nav');
    const bars     = toggle?.querySelectorAll('.bar');

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

const initContactForm = () => {
    const form = document.getElementById('portfolio-contact-form');
    if (!form) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        const btn = document.getElementById('submit-btn');
        const orig = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = 'Sending...';
        setTimeout(() => {
            btn.innerHTML = 'Message Sent ✓';
            form.reset();
            setTimeout(() => { btn.disabled = false; btn.innerHTML = orig; }, 3500);
        }, 1200);
    });
};

/* =============================================================
   10. HERO ANIMATIONS (entrance)
   ============================================================= */
const initHeroAnimations = () => {
    if (typeof gsap === 'undefined') return;
    const tl = gsap.timeline();
    gsap.set(['.hero-badge','#hero-dynamic-text','.hero-desc','.hero-actions .btn','.hero-portrait-frame','.scroll-indicator'],
             { opacity: 0, y: 20 });
    tl.to('.hero-badge',           { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
      .to('#hero-dynamic-text',    { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
      .to('.hero-desc',            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
      .to('.hero-actions .btn',    { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.15 }, '-=0.5')
      .to('.hero-portrait-frame',  { opacity: 1, y: 0, scale: 1, duration: 1.0, ease: 'power2.out' }, '-=0.9')
      .to('.scroll-indicator',     { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.4');
};

/* =============================================================
   11. INIT
   ============================================================= */
document.addEventListener('DOMContentLoaded', async () => {
    /* Load data first */
    await Promise.allSettled([
        loadSiteContent(),
        loadProfileDetails(),
        loadProjects()
    ]);

    /* UI systems */
    initModal();
    initCursor();
    initHeader();
    initIntersectionObserver();
    initContactForm();
    initHeroAnimations();
    initHeroTextCycle();
    initScroll();
    initSmoothLinks();

    /* Direct-link project via URL param */
    const param = new URLSearchParams(location.search).get('project');
    if (param) setTimeout(() => openModal(param), 800);
});
