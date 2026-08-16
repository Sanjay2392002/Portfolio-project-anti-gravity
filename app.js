/* =============================================================
   MAIN SITE ORCHESTRATOR
   ============================================================= */
import { apiFetch } from './src/js/api.js';
import { initScroll } from './src/js/scroll.js';
import { initCursor } from './src/js/components/Cursor.js';
import { initNavbar } from './src/js/components/Navbar.js';
import { applyFooter } from './src/js/components/Footer.js';
import { renderProjectCard } from './src/js/components/ProjectCard.js';
import { renderProjectFilters, applyCategoryFilter } from './src/js/components/ProjectFilter.js';
import { initModal, openModal } from './src/js/components/Modal.js';
import { initHero } from './src/js/sections/Hero.js';
import { applyAboutProfile } from './src/js/sections/About.js';
import { initServices } from './src/js/sections/Services.js';
import { initContact } from './src/js/sections/Contact.js';

/* =============================================================
   STATE
   ============================================================= */
let allProjects      = [];
let siteCategories   = [];
let currentFilter    = 'all';

/* =============================================================
   DATA LOADING & COMPONENT BINDING
   ============================================================= */
const loadSections = async () => {
    try {
        const sections = await apiFetch('/api/sections');
        const visible = sections.filter(s => !s.isHidden).sort((a,b) => a.order - b.order);
        
        const main = document.getElementById('main-content');
        if (!main) return;
        
        visible.forEach(sec => {
            let el = document.getElementById(sec.type);
            if (!el) {
                if (sec.type === 'custom') {
                    el = document.createElement('section');
                    el.id = 'custom-' + sec._id;
                    el.className = 'custom-section section-content';
                    el.innerHTML = sec.content || '<h2>Custom Section</h2>';
                } else return;
            }
            if (el) main.appendChild(el); // Reorder sections dynamically
        });
        
        const defaultSections = ['hero', 'about', 'services', 'projects', 'contact'];
        defaultSections.forEach(id => {
            const el = document.getElementById(id);
            if (!visible.find(s => s.type === id)) {
                if (el) el.style.display = 'none';
            } else {
                if (el) el.style.display = '';
            }
        });
        
        // Update navigation dots in the side navigation indicator
        const dotContainer = document.querySelector('.side-nav-dots');
        if (dotContainer) {
            dotContainer.innerHTML = visible.filter(s => defaultSections.includes(s.type)).map(s => 
                `<a href="#${s.type}" class="dot-link" data-sec="${s.type}" aria-label="${s.name}"></a>`
            ).join('');
            const firstDot = dotContainer.querySelector('.dot-link');
            if (firstDot) firstDot.classList.add('active');
        }
        
    } catch(e) {
        console.warn('Failed to load sections config, utilizing HTML fallbacks:', e.message);
    }
};

const loadSiteContent = async () => {
    try {
        const site = await apiFetch('/api/site');
        applySiteContent(site);
    } catch (e) {
        console.warn('Site content load fallback:', e.message);
    }
};

const applySiteContent = (site) => {
    if (!site) return;

    /* Logo Brand Name */
    const logoEl = document.getElementById('logo-text-val');
    if (logoEl && site.logo) logoEl.textContent = site.logo;

    /* Nav CTA CTA Button */
    const navCta = document.getElementById('nav-cta');
    if (navCta && site.navCta) navCta.textContent = site.navCta;

    /* Header Nav items */
    if (site.nav && Array.isArray(site.nav)) {
        const navList = document.getElementById('nav-list');
        if (navList) {
            navList.innerHTML = site.nav.map((item, i) => `
                <li><a href="${item.href}" class="nav-link${i === 0 ? ' active' : ''}"
                       data-sec="${item.href.replace('#', '')}">${item.label}</a></li>
            `).join('');
            
            // Re-bind header links for mobile layout closing
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

    /* Projects section layout specs */
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

    /* Footer Settings */
    if (site.footer) {
        applyFooter(site.footer);
    }

    /* Contact form categories selection dropdown */
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
        console.warn('Profile content load fallback:', e.message);
    }
};

const applyProfile = (p) => {
    if (!p) return;

    /* Hero section updates */
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

        if (p.hero.title) initHero(p.hero.title);
    }

    /* About section updates */
    if (p.about) {
        applyAboutProfile(p.about);
    }

    /* Contact details */
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

        /* Social Networks Directory */
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

const loadProjects = async () => {
    try {
        allProjects = await apiFetch('/api/projects');
    } catch (e) {
        console.warn('Projects load fallback, loading default assets:', e.message);
        allProjects = [];
    }
    renderProjects();
};

const getCategories = () => siteCategories.length ? siteCategories : [
    'Logo Designs', 'Brand Identity', 'Social Media Designs', 'Print Designs',
    'Packaging Designs', 'Advertising Campaigns', 'Product Mockups',
    'UI UX Designs', 'Web Designs', 'Creative Photography', '3D & AI Visuals', 'Personal Projects'
];

const groupByCategory = () => {
    const cats = getCategories();
    const grouped = {};
    cats.forEach(c => (grouped[c] = []));
    allProjects.forEach(p => {
        const cat = p.category || 'Personal Projects';
        if (grouped[cat] !== undefined) grouped[cat].push(p);
        else {
            const match = cats.find(c => c.toLowerCase() === cat.toLowerCase());
            if (match) grouped[match].push(p);
            else {
                if (!grouped['Personal Projects']) grouped['Personal Projects'] = [];
                grouped['Personal Projects'].push(p);
            }
        }
    });
    return grouped;
};

const renderProjects = () => {
    const container = document.getElementById('categories-container');
    if (!container) return;

    const grouped = groupByCategory();
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
            html += renderProjectCard(proj, idx);
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

    /* Render Category Filtering Controls */
    renderProjectFilters(allProjects, currentFilter, (filterVal) => {
        currentFilter = filterVal;
        applyCategoryFilter(filterVal);
        setTimeout(() => {
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.refresh();
            }
        }, 350);
    });

    /* Apply initial filter state */
    applyCategoryFilter(currentFilter);

    /* Bind dynamic Modal Click event triggers */
    container.querySelectorAll('[data-project-id]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = el.getAttribute('data-project-id');
            if (id) openModal(id);
        });
    });

    /* Refresh GSAP ScrollTrigger to register loaded layout dimensions */
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
    }
};

/* =============================================================
   INIT ENTRYPOINT
   ============================================================= */
document.addEventListener('DOMContentLoaded', async () => {
    /* Fetch server settings and data */
    await Promise.allSettled([
        loadSections(),
        loadSiteContent(),
        loadProfileDetails(),
        loadProjects()
    ]);

    /* Initialize client modules */
    initModal(allProjects);
    initCursor();
    initNavbar();
    initServices(); // Renders Services offerings
    initContact();
    initScroll();

    /* Direct link project modal router trigger */
    const param = new URLSearchParams(location.search).get('project');
    if (param) setTimeout(() => openModal(param), 800);
});
