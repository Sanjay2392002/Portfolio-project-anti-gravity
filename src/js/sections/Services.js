/* =============================================================
   SERVICES SECTION CONTROLLER
   ============================================================= */
const DEFAULT_SERVICES = [
    {
        title: 'Brand Strategy & Identity',
        desc: 'Structuring distinctive logo marks, mathematical grid alignments, visual systems, and comprehensive brand identity booklets designed to endure.',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 2v20"></path>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>`,
        capabilities: ['Logo Architecture', 'Brand Guideline Systems', 'Color & Type Strategy']
    },
    {
        title: 'Editorial & Print Layout',
        desc: 'Swiss-inspired grid layout publications, high-end uncoated catalogs, and structural editorial brochures built with visual breathing room.',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>`,
        capabilities: ['Grid-System Publications', 'Luxury Catalog Layouts', 'Brochures & Collateral']
    },
    {
        title: 'Packaging & 3D Mockups',
        desc: 'Tactile packaging boxes, material realism labeling, custom dielines, amber glass bottles, and photorealistic 3D product visual mockups.',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="21 16 12 21 3 16 3 8 12 3 21 8 21 16"></polyline>
            <polyline points="3 8 12 13 21 8"></polyline>
            <line x1="12" y1="13" x2="12" y2="21"></line>
        </svg>`,
        capabilities: ['Cosmetics & Lifestyle Lines', 'Tactile Label Embellishments', 'Cinema 4D Visuals']
    },
    {
        title: 'UI/UX & Web Design',
        desc: 'Clean layouts, visual wireframes, premium digital experiences, responsive interface systems, and smooth interactive animations.',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="2" y1="10" x2="22" y2="10"></line>
            <path d="M6 21h12"></path>
            <path d="M12 17v4"></path>
        </svg>`,
        capabilities: ['Aesthetic Digital Interfaces', 'Vite & Next.js Prototyping', 'GSAP Micro-interactions']
    }
];

export const initServices = (servicesData) => {
    const container = document.getElementById('services-grid-container');
    if (!container) return;

    const services = servicesData || DEFAULT_SERVICES;
    
    container.innerHTML = services.map(s => `
        <div class="service-card">
            <div class="service-icon-wrapper">
                ${s.icon || `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`}
            </div>
            <h3 class="service-title">${s.title}</h3>
            <p class="service-desc">${s.desc}</p>
            <div class="service-capabilities">
                ${(s.capabilities || []).map(cap => `
                    <span class="service-cap-item">${cap}</span>
                `).join('')}
            </div>
        </div>
    `).join('');
};
