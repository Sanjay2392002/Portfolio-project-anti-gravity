/* -----------------------------------------
   1. GLOBAL STATE & FALLBACK PROJECTS
   ----------------------------------------- */
let activeProjects = []; // Personal works from Admin Panel database
let behanceProjects = []; // Sync projects from Behance RSS Feed

const CATEGORIES = [
    "Logo Designs",
    "Brand Identity",
    "Social Media Designs",
    "Print Designs",
    "Packaging Designs",
    "Advertising Campaigns",
    "Product Mockups",
    "UI UX Designs",
    "Web Designs",
    "Creative Photography",
    "3D & AI Visuals",
    "Personal Projects"
];

// Tracks the slide index of the active project showing per category
const categoryActiveIndices = {};

// Highly polished sample projects representing various categories
const fallbackProjects = [
    {
        id: "sola-coffee-1234",
        category: "food",
        title: "Sola Organic Coffee Mark",
        img: "/assets/images/logo_showcase.jpg",
        year: "2026",
        duration: "5 Weeks",
        tools: "Adobe Illustrator, Figma",
        focus: "Geometric alignment, brand story, logo design",
        output: "Logo mark, package label, identity guide",
        concept: "SOLA is a premium, sustainable coffee brand. The logo mark simplifies the shape of a sun rising over a coffee bean. The geometry is built using strict mathematical proportions. A dark slate background combined with custom gold-leaf embossing creates a premium and trustworthy visual appearance.",
        client: "Sola Coffee Co. (Concept)",
        swatches: ["#0A0F14", "#FFDF79", "#00D2C4", "#F0F3F5"],
        typography: [
            { name: "Wordmark", font: "Outfit Medium", size: "36px" },
            { name: "Sub-brand", font: "Outfit Light", size: "12px" }
        ]
    },
    {
        id: "skin-alchemy-1234",
        category: "jewelry",
        title: "Skin Alchemy Packaging",
        img: "/assets/images/package_box.jpg",
        year: "2026",
        duration: "3 Weeks",
        tools: "Cinema 4D, Photoshop",
        focus: "Material realism, tactile packaging, organic styling",
        output: "Skincare cosmetic box, amber glass bottle, label design",
        concept: "Skin Alchemy is a luxury organic skincare and lifestyle line. The packaging design emphasizes raw materials and minimalist graphics. Using a matte black glass bottle paired with a rough-textured box, the tactile experience is premium. Embossed botanical line art and high contrast typography emphasize organic simplicity.",
        client: "Skin Alchemy Lab",
        swatches: ["#120E0A", "#E59050", "#DFD3C3", "#F6F4F2"],
        typography: [
            { name: "Title Font", font: "Playfair Display Italic", size: "28px" },
            { name: "Description", font: "Outfit Regular", size: "14px" }
        ]
    },
    {
        id: "aura-jewelry-1234",
        category: "jewelry",
        title: "Aura Luxury Editorial Catalog",
        img: "/assets/images/print_layout.jpg",
        year: "2025",
        duration: "4 Weeks",
        tools: "Adobe InDesign, Photoshop",
        focus: "Grid systems, high-end typography, catalog design",
        output: "Uncoated paper catalog spread, branding brochure",
        concept: "Inspired by Swiss architecture and minimal geometry, this project represents a luxury editorial print catalog for a modern jewelry startup. The layout follows a strict, asymmetrical grid system, allowing ample breathing room (white space) to showcase brutalist architecture photography and minimal jewelry lines.",
        client: "Aura Fine Jewelry",
        swatches: ["#EADEC9", "#202022", "#CFB584", "#959599"],
        typography: [
            { name: "Heading", font: "Playfair Display Regular", size: "48px" },
            { name: "Body Text", font: "Outfit Light", size: "15px" }
        ]
    },
    {
        id: "neon-beat-1234",
        category: "tech",
        title: "Neon Beat Web App UX",
        img: "/assets/images/social_poster.jpg",
        year: "2026",
        duration: "2 Weeks",
        tools: "Figma, Adobe Photoshop",
        focus: "UI design, interface structure, digital vectors",
        output: "Web App dashboard, landing page templates, user flow",
        concept: "The concept was centered around capturing the retro-futuristic energy of a modern web3 music platform startup. We combined vibrant neon pinks and teals with custom vector artwork, creating abstract geometric layout systems. A high-contrast sans-serif font ensures high legibility, while floating elements convey motion and sound waves.",
        client: "Neon Beat DAO",
        swatches: ["#FF007A", "#00F0FF", "#0C0817", "#9C95AB"],
        typography: [
            { name: "Headline", font: "Outfit ExtraBold", size: "72px" },
            { name: "Body Text", font: "Outfit Regular", size: "16px" }
        ]
    }
];

/* -----------------------------------------
   2. API CONFIGURATION & CORE FETCHING
   ----------------------------------------- */
const getApiUrl = (endpoint) => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
        return endpoint;
    }
    const savedBackendUrl = localStorage.getItem('production_api_url') || '';
    return `${savedBackendUrl.replace(/\/$/, '')}${endpoint}`;
};

// Fetch personal dashboard database projects
const loadActiveProjects = async () => {
    try {
        const response = await fetch(getApiUrl('/api/projects'));
        if (!response.ok) throw new Error("Backend connection failed");
        activeProjects = await response.json();
    } catch (e) {
        console.warn("Could not load from backend. Defaulting to fallback seeds.", e);
        activeProjects = [...fallbackProjects];
    }
    renderCategoryShowcases();
};

// Fetch dynamic profile details (Hero, About, Contact)
const loadProfileDetails = async () => {
    try {
        const response = await fetch(getApiUrl('/api/profile'));
        if (!response.ok) throw new Error("Profile retrieval failed");
        const profile = await response.json();
        renderProfileData(profile);
    } catch (e) {
        console.warn("Could not load profile from backend. Using static fallback page content.", e);
    }
};

const renderProfileData = (profile) => {
    if (!profile) return;
    
    // 1. Hero Section
    if (profile.hero) {
        const heroSubtitle = document.querySelector('.hero-subtitle');
        if (heroSubtitle && profile.hero.subtitle) heroSubtitle.textContent = profile.hero.subtitle;
        
        const heroDynamicText = document.getElementById('hero-dynamic-text');
        if (heroDynamicText && profile.hero.title) heroDynamicText.textContent = profile.hero.title;
        
        const heroDesc = document.querySelector('.hero-description');
        if (heroDesc && profile.hero.description) heroDesc.textContent = profile.hero.description;
        
        const heroImg = document.getElementById('hero-portrait-img');
        if (heroImg && profile.hero.portrait) heroImg.src = profile.hero.portrait;
    }
    
    // 2. About Section
    if (profile.about) {
        const aboutTitle = document.getElementById('about-section-title');
        if (aboutTitle && profile.about.title) {
            aboutTitle.innerHTML = profile.about.title;
        }
        
        const aboutBio = document.getElementById('about-bio');
        if (aboutBio && profile.about.bio) aboutBio.textContent = profile.about.bio;
        
        const aboutImg = document.getElementById('about-portrait-img');
        if (aboutImg && profile.about.portrait) aboutImg.src = profile.about.portrait;
        
        const resumeBtn = document.getElementById('btn-download-resume');
        if (resumeBtn && profile.about.resumeUrl) {
            resumeBtn.href = profile.about.resumeUrl;
        }
        
        // Experience Timeline
        const expList = document.getElementById('about-experience-list');
        if (expList && profile.about.experience) {
            expList.innerHTML = profile.about.experience.map(item => `
                <li>
                    <span class="timeline-date">${item.date}</span>
                    <span class="timeline-role">${item.role}</span>
                    <span class="timeline-company">${item.company}</span>
                </li>
            `).join('');
        }
        
        // Education Timeline
        const eduList = document.getElementById('about-education-list');
        if (eduList && profile.about.education) {
            eduList.innerHTML = profile.about.education.map(item => `
                <li>
                    <span class="timeline-date">${item.date}</span>
                    <span class="timeline-role">${item.role}</span>
                    <span class="timeline-company">${item.company}</span>
                </li>
            `).join('');
        }
        
        // Capabilities tags
        const capList = document.getElementById('about-capabilities-list');
        if (capList && profile.about.capabilities) {
            capList.innerHTML = profile.about.capabilities.map(cap => `
                <span class="skill-tag">${cap}</span>
            `).join('');
        }
        
        // Software directory
        const softList = document.getElementById('about-software-list');
        if (softList && profile.about.software) {
            softList.innerHTML = profile.about.software.map(soft => `
                <div class="software-item" title="${soft.name}">
                    <span class="soft-icon">${soft.key}</span>
                    <span class="soft-name">${soft.name}</span>
                </div>
            `).join('');
        }
    }
    
    // 3. Contact Section
    if (profile.contact) {
        const mailLink = document.getElementById('contact-email');
        if (mailLink && profile.contact.email) {
            mailLink.href = `mailto:${profile.contact.email}`;
            mailLink.textContent = profile.contact.email;
        }
        
        const phoneLink = document.getElementById('contact-phone');
        if (phoneLink && profile.contact.phone) {
            phoneLink.href = `tel:${profile.contact.phone.replace(/\s+/g, '')}`;
            phoneLink.textContent = profile.contact.phone;
        }
        
        const locSpan = document.getElementById('contact-location');
        if (locSpan && profile.contact.location) {
            locSpan.textContent = profile.contact.location;
        }
        
        // Social networks
        if (profile.contact.socials) {
            const soc = profile.contact.socials;
            
            const bLink = document.getElementById('behance-link');
            if (bLink && soc.behance) bLink.href = soc.behance;
            
            const lLink = document.getElementById('linkedin-link');
            if (lLink && soc.linkedin) lLink.href = soc.linkedin;
            
            const iLink = document.getElementById('instagram-link');
            if (iLink && soc.instagram) iLink.href = soc.instagram;
            
            const dLink = document.getElementById('dribbble-link');
            if (dLink && soc.dribbble) dLink.href = soc.dribbble;
            
            const gLink = document.getElementById('github-link');
            if (gLink && soc.github) gLink.href = soc.github;
        }
    }
};

/* -----------------------------------------
   3. EDITORIAL CLASSIFIER ENGINE
   ----------------------------------------- */
const classifyProject = (p) => {
    const title = (p.title || "").toLowerCase();
    const concept = (p.concept || p.description || "").toLowerCase();
    const dbCategory = (p.category || "").toLowerCase(); // 'food', 'jewelry', 'tech'
    const tools = (p.tools || (p.categories || []).join(", ") || "").toLowerCase();
    const focus = (p.focus || "").toLowerCase();
    const output = (p.output || "").toLowerCase();

    // 1. Logo Designs
    if (title.includes("logo") || title.includes("logotype") || title.includes("wordmark") || title.includes("mark") || focus.includes("logo") || focus.includes("identity mark")) {
        return "Logo Designs";
    }
    
    // 2. Packaging Designs
    if (title.includes("package") || title.includes("packaging") || title.includes("box") || title.includes("label") || title.includes("bottle") || title.includes("jar") || title.includes("can") || output.includes("package") || output.includes("box") || output.includes("bottle") || output.includes("label")) {
        return "Packaging Designs";
    }

    // 3. UI UX Designs
    if (title.includes("ui") || title.includes("ux") || title.includes("app") || title.includes("interface") || title.includes("wireframe") || concept.includes("ui/ux") || concept.includes("user experience") || concept.includes("figma") || tools.includes("figma")) {
        return "UI UX Designs";
    }

    // 4. Web Designs
    if (title.includes("web") || title.includes("website") || title.includes("landing") || title.includes("homepage") || concept.includes("web design") || concept.includes("landing page")) {
        return "Web Designs";
    }

    // 5. Social Media Designs
    if (title.includes("social") || title.includes("instagram") || title.includes("feed") || title.includes("post") || title.includes("banner") || title.includes("ads") || output.includes("social") || output.includes("instagram") || output.includes("banner")) {
        return "Social Media Designs";
    }

    // 6. Print Designs
    if (title.includes("print") || title.includes("brochure") || title.includes("catalog") || title.includes("magazine") || title.includes("editorial") || title.includes("book") || title.includes("flyer") || title.includes("poster") || output.includes("print") || output.includes("brochure") || output.includes("catalog") || output.includes("editorial") || output.includes("poster")) {
        return "Print Designs";
    }

    // 7. 3D & AI Visuals
    if (title.includes("3d") || title.includes("render") || title.includes("c4d") || title.includes("blender") || title.includes("ai ") || title.includes("midjourney") || concept.includes("3d") || concept.includes("render") || tools.includes("cinema 4d") || tools.includes("blender") || tools.includes("midjourney")) {
        return "3D & AI Visuals";
    }

    // 8. Brand Identity
    if (title.includes("brand") || title.includes("branding") || title.includes("identity") || title.includes("guidelines") || concept.includes("branding") || concept.includes("identity") || focus.includes("brand") || focus.includes("identity")) {
        return "Brand Identity";
    }

    // 9. Advertising Campaigns
    if (title.includes("campaign") || title.includes("advertise") || title.includes("advertising") || title.includes("ad ") || concept.includes("campaign") || concept.includes("marketing")) {
        return "Advertising Campaigns";
    }

    // 10. Product Mockups
    if (title.includes("mockup") || title.includes("mock-up") || title.includes("presentation") || output.includes("mockup") || concept.includes("mockup")) {
        return "Product Mockups";
    }

    // 11. Creative Photography
    if (title.includes("photo") || title.includes("photography") || title.includes("camera") || title.includes("shoot") || concept.includes("photography") || concept.includes("photo")) {
        return "Creative Photography";
    }

    // Fallbacks using original backend category labels
    if (dbCategory === "tech") {
        return "UI UX Designs";
    } else if (dbCategory === "food") {
        return "Packaging Designs";
    } else if (dbCategory === "jewelry") {
        return "Brand Identity";
    }

    return "Personal Projects";
};

// Groups combined projects flat list by their 12 categories
const getProjectsByCategory = () => {
    const grouped = {};
    CATEGORIES.forEach(cat => grouped[cat] = []);

    const seen = new Set();
    const all = [];

    activeProjects.forEach(p => {
        if (!seen.has(p.id)) {
            seen.add(p.id);
            all.push({ ...p, isBehance: false });
        }
    });

    behanceProjects.forEach(p => {
        const id = p.guid || p.link;
        if (!seen.has(id)) {
            seen.add(id);
            all.push({ ...p, id, isBehance: true });
        }
    });

    all.forEach(p => {
        const cat = classifyProject(p);
        grouped[cat].push(p);
    });

    return { grouped, all };
};

/* -----------------------------------------
   4. DYNAMIC SHOWCASE RENDERING
   ----------------------------------------- */
const renderCategoryShowcases = () => {
    const container = document.getElementById('categories-container');
    if (!container) return;

    const { grouped } = getProjectsByCategory();
    container.innerHTML = '';

    let visibleIndex = 1;

    CATEGORIES.forEach(categoryName => {
        const projects = grouped[categoryName];
        if (!projects || projects.length === 0) return; // Hide unpopulated categories

        // Initialize active category index
        if (categoryActiveIndices[categoryName] === undefined) {
            categoryActiveIndices[categoryName] = 0;
        }
        
        let activeIdx = categoryActiveIndices[categoryName];
        if (activeIdx >= projects.length) {
            activeIdx = 0;
            categoryActiveIndices[categoryName] = 0;
        }

        const currentProj = projects[activeIdx];
        const serialStr = visibleIndex.toString().padStart(2, '0');
        visibleIndex++;

        // Parsing project details
        const isBehance = currentProj.isBehance;
        const coverImg = parseCoverImage(currentProj);
        const cleanDesc = parseCleanDescription(currentProj);
        const year = currentProj.year || (currentProj.pubDate ? new Date(currentProj.pubDate).getFullYear() : '2026');
        const toolsUsed = currentProj.tools || (currentProj.categories || []).join(", ") || "Illustrator, Photoshop";
        const focusArea = currentProj.focus || "Visual Composition";
        const outputFormat = currentProj.output || "Digital Showcase";
        const id = currentProj.id || currentProj.guid;

        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'category-showcase-section';
        sectionDiv.setAttribute('id', `cat-${categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);

        // Left pane details indicators
        let indicatorsHtml = '';
        if (projects.length > 1) {
            indicatorsHtml = `<div class="category-indicator-track">`;
            projects.forEach((_, idx) => {
                indicatorsHtml += `<button class="thumb-dot ${idx === activeIdx ? 'active' : ''}" data-category="${categoryName}" data-index="${idx}" aria-label="View Project ${idx + 1}"></button>`;
            });
            indicatorsHtml += `</div>`;
        }

        sectionDiv.innerHTML = `
            <div class="category-header">
                <span class="category-number">${serialStr}.</span>
                <h3 class="category-heading">${categoryName}</h3>
            </div>
            
            <div class="category-split-layout">
                <!-- Details Pane -->
                <div class="project-details-pane" id="pane-details-${categoryName.replace(/\s+/g, '')}">
                    <span class="proj-meta-tag">${isBehance ? 'Behance Live' : 'Personal Studio'}</span>
                    <h4 class="proj-title">${currentProj.title}</h4>
                    <p class="proj-desc">${cleanDesc}</p>
                    
                    <div class="proj-specs-grid">
                        <div class="spec-cell">
                            <span class="spec-cell-label">Tools Used</span>
                            <span class="spec-cell-val">${toolsUsed}</span>
                        </div>
                        <div class="spec-cell">
                            <span class="spec-cell-label">Year</span>
                            <span class="spec-cell-val">${year}</span>
                        </div>
                        <div class="spec-cell">
                            <span class="spec-cell-label">Focus Area</span>
                            <span class="spec-cell-val">${focusArea}</span>
                        </div>
                        <div class="spec-cell">
                            <span class="spec-cell-label">Deliverable</span>
                            <span class="spec-cell-val">${outputFormat}</span>
                        </div>
                    </div>
                    
                    <button class="btn btn-outline view-project-btn" data-project-id="${id}">
                        View Case Study
                        <svg class="arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 8px;">
                            <path d="M5 12H19M19 12L12 5M19 12L12 19"/>
                        </svg>
                    </button>
                    
                    ${indicatorsHtml}
                </div>
                
                <!-- Visual Pane -->
                <div class="project-visual-pane">
                    <div class="project-img-wrapper" id="pane-visual-${categoryName.replace(/\s+/g, '')}" data-project-id="${id}">
                        <img src="${coverImg}" alt="${currentProj.title} cover" loading="lazy">
                    </div>
                </div>
            </div>
        `;

        container.appendChild(sectionDiv);
    });

    // Event hooks for switching slides inside each category
    container.querySelectorAll('.thumb-dot').forEach(dot => {
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            const cat = dot.getAttribute('data-category');
            const idx = parseInt(dot.getAttribute('data-index'), 10);
            switchCategoryProject(cat, idx);
        });
    });

    // Event hooks for opening full modal case study
    container.querySelectorAll('.view-project-btn, .project-img-wrapper').forEach(element => {
        element.addEventListener('click', () => {
            const id = element.getAttribute('data-project-id');
            if (id) openProjectModal(id);
        });
    });
};

const switchCategoryProject = (categoryName, targetIdx) => {
    const safeCatId = categoryName.replace(/\s+/g, '');
    const detailsPane = document.getElementById(`pane-details-${safeCatId}`);
    const visualPane = document.getElementById(`pane-visual-${safeCatId}`);

    if (detailsPane && visualPane) {
        detailsPane.classList.add('project-switching');
        visualPane.classList.add('project-switching');
        
        setTimeout(() => {
            categoryActiveIndices[categoryName] = targetIdx;
            renderCategoryShowcases();
            
            const newDetails = document.getElementById(`pane-details-${safeCatId}`);
            const newVisual = document.getElementById(`pane-visual-${safeCatId}`);
            if (newDetails && newVisual) {
                newDetails.classList.remove('project-switching');
                newVisual.classList.remove('project-switching');
                
                // Micro GSAP slide-fade reveals
                gsap.fromTo(newDetails.querySelectorAll('.proj-title, .proj-desc, .proj-specs-grid, .btn'), 
                    { opacity: 0, y: 15 }, 
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }
                );
                gsap.fromTo(newVisual.querySelector('img'),
                    { opacity: 0, scale: 1.04 },
                    { opacity: 1, scale: 1, duration: 0.7, ease: "power2.out" }
                );
            }
        }, 300);
    } else {
        categoryActiveIndices[categoryName] = targetIdx;
        renderCategoryShowcases();
    }
};

/* -----------------------------------------
   5. BEHANCE FEED SYSTEM
   ----------------------------------------- */
const fetchBehanceProjects = async (username) => {
    try {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        let items = [];

        if (isLocal) {
            // Fetch via local proxy to bypass Cloudflare constraints
            const response = await fetch(`/api-behance/feeds/user?username=${username}`);
            if (!response.ok) throw new Error(`Proxy error: ${response.status}`);
            
            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "text/xml");
            
            if (xmlDoc.querySelector("parsererror")) throw new Error("XML feed parsing exception");

            const rawItems = Array.from(xmlDoc.getElementsByTagName("item"));
            items = rawItems.map(item => {
                const title = item.getElementsByTagName("title")[0]?.textContent || "";
                const link = item.getElementsByTagName("link")[0]?.textContent || "";
                const pubDate = item.getElementsByTagName("pubDate")[0]?.textContent || "";
                const description = item.getElementsByTagName("description")[0]?.textContent || "";
                return {
                    title,
                    link,
                    pubDate,
                    description,
                    categories: ["Behance"],
                    guid: link
                };
            });
        } else {
            // Production deployment static request proxying using rss2json
            const rssUrl = `https://www.behance.net/feeds/user?username=${username}`;
            const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
            const data = await response.json();
            if (data.status !== 'ok') throw new Error(data.message || "RSS converter failed");
            
            items = data.items.map(item => ({
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
                description: item.description,
                categories: item.categories || ["Behance"],
                guid: item.guid || item.link
            }));
        }

        behanceProjects = items;
    } catch (e) {
        console.error("Could not sync Behance Feed:", e);
    }
    renderCategoryShowcases();
};

/* -----------------------------------------
   6. PARSING & EXTRACTION HELPERS
   ----------------------------------------- */
const parseCleanDescription = (p) => {
    if (!p.description) return p.concept || "No description text provided.";
    let clean = p.concept || p.description.replace(/<[^>]*>/g, ' ');
    clean = clean.replace(/\s+/g, ' ').trim();
    return clean.length > 260 ? clean.substring(0, 260) + "..." : clean;
};

const parseCoverImage = (p) => {
    if (p.img) return p.img;
    const imgRegex = /<img[^>]+src="([^">]+)"/;
    const match = p.description ? p.description.match(imgRegex) : null;
    return match ? match[1] : p.thumbnail || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\'%3E%3Crect fill=\'%23faf9f5\' width=\'100%25\' height=\'100%25\'/%3E%3C/svg%3E';
};

const extractImagesFromDescription = (descriptionHtml) => {
    if (!descriptionHtml) return [];
    const div = document.createElement('div');
    div.innerHTML = descriptionHtml;
    const imgs = div.querySelectorAll('img');
    const urls = [];
    imgs.forEach(img => {
        let src = img.getAttribute('src');
        if (src && !src.includes('clear.gif') && !src.includes('analytics')) {
            urls.push(src);
        }
    });
    return urls;
};

/* -----------------------------------------
   7. CASE STUDY MODAL MANAGEMENT
   ----------------------------------------- */
const renderModalGallery = (images) => {
    const galleryContainer = document.getElementById('modal-image-gallery');
    if (!galleryContainer) return;
    
    galleryContainer.innerHTML = '';
    
    if (!images || images.length === 0) {
        galleryContainer.style.display = 'none';
        return;
    }
    
    galleryContainer.style.display = 'grid';

    images.forEach((imgUrl, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        // Dynamically alternate layout grid weights to simulate editorial magazine sheets
        const pattern = index % 5;
        if (pattern === 0) {
            item.classList.add('full-width');
        } else if (pattern === 1 || pattern === 2) {
            item.classList.add('two-col');
        } else {
            item.classList.add('three-col');
        }
        
        item.innerHTML = `<img src="${imgUrl}" alt="Case layout ${index + 1}" loading="lazy" class="gallery-fit-img">`;
        galleryContainer.appendChild(item);
    });
};

const updateModalNavButtons = (currentId) => {
    const { all } = getProjectsByCategory();
    const navFooter = document.querySelector('.modal-navigation-footer');
    
    if (all.length <= 1) {
        if (navFooter) navFooter.style.display = 'none';
        return;
    }
    if (navFooter) navFooter.style.display = 'grid';

    const idx = all.findIndex(p => (p.id || p.guid) === currentId);
    if (idx === -1) return;

    const prevIdx = (idx - 1 + all.length) % all.length;
    const nextIdx = (idx + 1) % all.length;

    const prevProj = all[prevIdx];
    const nextProj = all[nextIdx];

    const prevId = prevProj.id || prevProj.guid;
    const nextId = nextProj.id || nextProj.guid;

    const prevTitleEl = document.getElementById('modal-prev-title');
    const nextTitleEl = document.getElementById('modal-next-title');
    
    if (prevTitleEl) prevTitleEl.textContent = prevProj.title;
    if (nextTitleEl) nextTitleEl.textContent = nextProj.title;

    const prevBtn = document.getElementById('modal-prev-project');
    const nextBtn = document.getElementById('modal-next-project');

    // Clone buttons to dump previous click event listeners
    const newPrevBtn = prevBtn.cloneNode(true);
    const newNextBtn = nextBtn.cloneNode(true);

    prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
    nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);

    newPrevBtn.addEventListener('click', () => transitionModalContent(prevId));
    newNextBtn.addEventListener('click', () => transitionModalContent(nextId));
};

const loadModalData = (projectId) => {
    const { all } = getProjectsByCategory();
    const data = all.find(p => (p.id || p.guid) === projectId);
    if (!data) return;

    const isBehance = data.isBehance;
    const coverUrl = parseCoverImage(data);
    const cleanDesc = data.concept || (data.description ? data.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : "No concept narrative documented.");
    const year = data.year || (data.pubDate ? new Date(data.pubDate).getFullYear() : '2026');
    const toolsUsed = data.tools || (data.categories || []).join(", ") || "Illustrator, Photoshop";
    const duration = data.duration || "Completed Feed Project";
    const client = data.client || (isBehance ? "Behance Case Study" : "Personal Concept Studio");

    // Map DOM selectors
    const modalImg = document.getElementById('modal-img');
    const modalCat = document.getElementById('modal-cat');
    const modalTitle = document.getElementById('modal-title');
    const modalYear = document.getElementById('modal-year');
    const modalDuration = document.getElementById('modal-duration');
    const modalTools = document.getElementById('modal-tools');
    const modalConcept = document.getElementById('modal-concept-text');
    const modalSwatches = document.getElementById('modal-swatches');
    const modalTypo = document.getElementById('modal-typo');
    const modalBehanceLink = document.getElementById('modal-behance-link');
    const modalSpecsSection = document.getElementById('modal-specs-section');
    const modalClient = document.getElementById('modal-client');

    if (modalImg) {
        modalImg.src = coverUrl;
        modalImg.alt = data.title;
    }
    if (modalCat) modalCat.textContent = isBehance ? "Behance Case" : `Category: ${classifyProject(data)}`;
    if (modalTitle) modalTitle.textContent = data.title;
    if (modalYear) modalYear.textContent = year;
    if (modalDuration) modalDuration.textContent = duration;
    if (modalTools) modalTools.textContent = toolsUsed;
    if (modalConcept) modalConcept.textContent = cleanDesc;
    if (modalClient) modalClient.textContent = client;

    if (isBehance && modalBehanceLink) {
        modalBehanceLink.href = data.link;
        modalBehanceLink.style.display = 'inline-flex';
    } else if (modalBehanceLink) {
        modalBehanceLink.style.display = 'none';
    }

    // Render design systems for personal database works
    if (!isBehance) {
        if (modalSpecsSection) modalSpecsSection.style.display = 'block';
        
        if (modalSwatches) {
            modalSwatches.innerHTML = '';
            const swatches = data.swatches || ["#0044FF", "#C85A32", "#FAF9F5", "#141518"];
            swatches.forEach(color => {
                const swatchGrp = document.createElement('div');
                swatchGrp.className = 'swatch-group';
                swatchGrp.innerHTML = `
                    <div class="swatch" style="background-color: ${color}"></div>
                    <span class="swatch-label">${color}</span>
                `;
                modalSwatches.appendChild(swatchGrp);
            });
        }

        if (modalTypo) {
            modalTypo.innerHTML = '';
            const typography = data.typography || [
                { name: "Heading Typography", font: "Outfit SemiBold", size: "72px" },
                { name: "Editorial Body", font: "Playfair Display Regular", size: "16px" }
            ];
            typography.forEach(spec => {
                const typoRow = document.createElement('div');
                typoRow.className = 'typo-row';
                typoRow.innerHTML = `
                    <span class="typo-font">${spec.name}: ${spec.font}</span>
                    <span class="typo-sample">AaBbCc (${spec.size})</span>
                `;
                modalTypo.appendChild(typoRow);
            });
        }
    } else {
        if (modalSpecsSection) modalSpecsSection.style.display = 'none';
    }

    // Extract and render Behance descriptions containing image tracks
    if (isBehance && data.description) {
        const descImages = extractImagesFromDescription(data.description);
        // Omit first image to avoid duplicates with main cover
        if (descImages.length > 1) {
            renderModalGallery(descImages.slice(1));
        } else {
            renderModalGallery([]);
        }
    } else {
        renderModalGallery([]);
    }

    updateModalNavButtons(projectId);
};

const transitionModalContent = (targetId) => {
    const caseStudyEl = document.querySelector('.modal-case-study');
    if (!caseStudyEl) return;

    gsap.to(caseStudyEl, {
        opacity: 0,
        y: -15,
        duration: 0.35,
        ease: "power2.in",
        onComplete: () => {
            loadModalData(targetId);
            const modalBackdrop = document.getElementById('project-modal');
            if (modalBackdrop) modalBackdrop.scrollTop = 0;
            
            gsap.to(caseStudyEl, {
                opacity: 1,
                y: 0,
                duration: 0.55,
                ease: "power2.out"
            });
        }
    });
};

const openProjectModal = (projectId) => {
    const modal = document.getElementById('project-modal');
    if (!modal) return;

    loadModalData(projectId);

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (window.lenis) {
        window.lenis.stop();
    }

    gsap.fromTo(modal.querySelector('.modal-wrapper'),
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
    );
};

const closeProjectModal = () => {
    const modal = document.getElementById('project-modal');
    if (!modal || !modal.classList.contains('open')) return;

    gsap.to(modal.querySelector('.modal-wrapper'), {
        opacity: 0,
        y: 20,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';

            if (window.lenis) {
                window.lenis.start();
            }
        }
    });
};

const initProjectModal = () => {
    const closeBtn = document.querySelector('.modal-close');
    const modal = document.getElementById('project-modal');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeProjectModal);
    }
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeProjectModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeProjectModal();
    });
};

/* -----------------------------------------
   8. SETTINGS DRAWER CONTROLLER
   ----------------------------------------- */
const initSettingsDrawer = () => {
    const drawer = document.getElementById('settings-drawer');
    const toggleBtn = document.getElementById('btn-settings-toggle');
    const bannerBtn = document.getElementById('banner-settings-btn');
    const closeBtn = document.querySelector('.settings-drawer-close');
    const saveBtn = document.getElementById('btn-save-behance-url');
    const urlInput = document.getElementById('behance-profile-url');
    const demoBanner = document.getElementById('demo-mode-banner');
    
    const saveBackendBtn = document.getElementById('btn-save-backend-url');
    const backendInput = document.getElementById('production-api-url');

    if (!drawer) return;

    const openDrawer = () => {
        drawer.classList.add('open');
        drawer.setAttribute('aria-hidden', 'false');
    };

    const closeDrawer = () => {
        drawer.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');
    };

    if (toggleBtn) toggleBtn.addEventListener('click', openDrawer);
    if (bannerBtn) bannerBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    drawer.addEventListener('click', (e) => {
        if (e.target === drawer) closeDrawer();
    });

    const savedUrl = localStorage.getItem('behance_profile_url');
    const urlToLoad = savedUrl || 'https://www.behance.net/sanjayuiuxgd';
    const activeUsername = extractUsername(urlToLoad);
    
    if (urlInput) {
        urlInput.value = urlToLoad;
    }

    const savedBackendUrl = localStorage.getItem('production_api_url') || '';
    if (backendInput) {
        backendInput.value = savedBackendUrl;
    }

    if (!savedUrl && demoBanner) {
        demoBanner.style.display = 'block';
    }

    if (saveBtn && urlInput) {
        saveBtn.addEventListener('click', async () => {
            const inputVal = urlInput.value.trim();
            if (inputVal) {
                const username = extractUsername(inputVal);
                localStorage.setItem('behance_profile_url', inputVal);
                if (demoBanner) demoBanner.style.display = 'none';
                closeDrawer();
                await fetchBehanceProjects(username);
            }
        });
    }

    if (saveBackendBtn && backendInput) {
        saveBackendBtn.addEventListener('click', () => {
            const backendVal = backendInput.value.trim();
            localStorage.setItem('production_api_url', backendVal);
            alert('Backend URL saved successfully! Reloading...');
            closeDrawer();
            setTimeout(() => window.location.reload(), 800);
        });
    }

    fetchBehanceProjects(activeUsername);
};

const extractUsername = (input) => {
    if (!input) return 'sanjayuiuxgd';
    let clean = input.trim();
    const urlRegex = /(?:https?:\/\/)?(?:www\.)?behance\.net\/([^\/\?#]+)/i;
    const match = clean.match(urlRegex);
    return match ? match[1] : clean;
};

/* -----------------------------------------
   9. INTERACTION DECORATIONS (CURSOR, SCROLL, FORMS)
   ----------------------------------------- */
const initCustomCursor = () => {
    const cursor = document.querySelector('.custom-cursor');
    const cursorDot = document.querySelector('.custom-cursor-dot');
    
    if (!cursor || !cursorDot) return;

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let dotX = 0, dotY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!document.body.classList.contains('cursor-active')) {
            document.body.classList.add('cursor-active');
        }
    });

    document.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-active');
    });

    const animateCursor = () => {
        cursorX += (mouseX - cursorX) * 0.12;
        cursorY += (mouseY - cursorY) * 0.12;
        dotX += (mouseX - dotX) * 0.25;
        dotY += (mouseY - dotY) * 0.25;

        cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
        cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;

        requestAnimationFrame(animateCursor);
    };
    requestAnimationFrame(animateCursor);

    const hoverTargets = 'a, button, input, select, textarea, .project-img-wrapper, .dot-link, .thumb-dot, .modal-backdrop, .modal-close';
    document.body.addEventListener('mouseenter', (e) => {
        if (e.target.matches && e.target.matches(hoverTargets)) {
            const target = e.target;
            const textSpan = cursor.querySelector('.cursor-text');
            
            if (target.closest('.project-img-wrapper') || target.matches('.project-img-wrapper')) {
                cursor.classList.add('view-hover');
                if (textSpan) textSpan.textContent = 'VIEW';
            } else if (target.closest('.modal-close') || target.matches('.modal-close') || target.matches('.modal-backdrop')) {
                cursor.classList.add('close-hover');
                if (textSpan) textSpan.textContent = 'CLOSE';
            } else {
                cursor.classList.add('hovered');
            }
        }
    }, true);

    document.body.addEventListener('mouseleave', (e) => {
        if (e.target.matches && e.target.matches(hoverTargets)) {
            cursor.classList.remove('hovered');
            cursor.classList.remove('view-hover');
            cursor.classList.remove('close-hover');
            const textSpan = cursor.querySelector('.cursor-text');
            if (textSpan) textSpan.textContent = '';
        }
    }, true);
};

const initIntersectionObserver = () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const dotLinks = document.querySelectorAll('.dot-link');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');
                
                navLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href === `#${sectionId}`) {
                        link.classList.add('active');
                    } else if (!(href === '#about-resume' && sectionId === 'about')) {
                        link.classList.remove('active');
                    }
                });
                
                dotLinks.forEach(dot => {
                    if (dot.getAttribute('href') === `#${sectionId}`) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
            }
        });
    }, { threshold: 0.25 });

    sections.forEach(section => observer.observe(section));
};

const initHeroTextAnimation = () => {
    const textEl = document.getElementById('hero-dynamic-text');
    if (!textEl) return;

    const words = [
        "PORTFOLIO",
        "SANJAY MURUGESAN",
        "VISUAL DESIGNER",
        "CREATIVE DESIGNER",
        "LOGO DESIGNER",
        "SOCIAL MEDIA DESIGNER",
        "UI DESIGNER"
    ];
    let currentIndex = 0;

    const cycleText = () => {
        currentIndex = (currentIndex + 1) % words.length;
        const nextWord = words[currentIndex];

        gsap.to(textEl, {
            y: -15,
            opacity: 0,
            duration: 0.4,
            ease: "power2.in",
            onComplete: () => {
                textEl.textContent = nextWord;
                gsap.set(textEl, { y: 15 });
                gsap.to(textEl, {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    ease: "power2.out"
                });
            }
        });
    };

    setInterval(cycleText, 3000);
};

const initScrollSystem = () => {
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true
    });
    window.lenis = lenis;

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Shrink header on scroll
    const header = document.querySelector('.site-header');
    if (header) {
        ScrollTrigger.create({
            start: "top -50",
            onToggle: (self) => {
                if (self.isActive) {
                    header.style.height = "68px";
                    header.style.backgroundColor = "rgba(250, 250, 247, 0.96)";
                } else {
                    header.style.height = "80px";
                    header.style.backgroundColor = "rgba(250, 250, 247, 0.85)";
                }
            }
        });
    }

    // Dynamic Image Parallax effect
    gsap.utils.toArray('.hero-portrait-img, .about-portrait-img, .project-img-wrapper img').forEach(img => {
        gsap.to(img, {
            yPercent: 8,
            ease: "none",
            scrollTrigger: {
                trigger: img.parentNode,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    });

    // Fade reveal blocks
    gsap.utils.toArray('.section-num, .section-title, .about-bio, .about-grid, .category-showcase-section, .contact-content').forEach(section => {
        gsap.fromTo(section, 
            { opacity: 0, y: 25 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.8, 
                ease: "power2.out",
                scrollTrigger: {
                    trigger: section,
                    start: "top 88%",
                    toggleActions: "play none none none"
                }
            }
        );
    });
};

const initSmoothScrollClicks = () => {
    document.querySelectorAll('.main-nav a, .side-nav-dots a, .back-to-top a, .hero-actions a').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target && window.lenis) {
                    window.lenis.scrollTo(target, { offset: href === '#about-resume' ? -50 : 0 });
                } else if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
};

const initHeaderAndForms = () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (menuToggle && mainNav) {
        const headerActions = document.querySelector('.header-actions');
        
        const handleTabletChange = (e) => {
            if (e.matches) {
                if (mainNav && headerActions && !mainNav.contains(headerActions)) {
                    mainNav.appendChild(headerActions);
                }
            } else {
                if (mainNav && headerActions && mainNav.contains(headerActions)) {
                    const headerContainer = document.querySelector('.header-container');
                    const menuToggleBtn = document.querySelector('.menu-toggle');
                    if (headerContainer && menuToggleBtn) {
                        headerContainer.insertBefore(headerActions, menuToggleBtn);
                    }
                }
            }
        };

        const mediaQuery = window.matchMedia('(max-width: 991px)');
        mediaQuery.addEventListener('change', handleTabletChange);
        handleTabletChange(mediaQuery);

        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('mobile-open');
            const bars = menuToggle.querySelectorAll('.bar');
            if (bars.length >= 3) {
                if (mainNav.classList.contains('mobile-open')) {
                    bars[0].style.transform = 'rotate(45deg) translate(4px, 4px)';
                    bars[1].style.transform = 'scale(0)';
                    bars[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
                } else {
                    bars[0].style.transform = 'none';
                    bars[1].style.transform = 'none';
                    bars[2].style.transform = 'none';
                }
            }
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('mobile-open')) {
                    menuToggle.click();
                }
            });
        });
    }

    const form = document.getElementById('portfolio-contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('submit-btn');
            const originalText = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending Message...';
            submitBtn.style.opacity = '0.7';

            setTimeout(() => {
                submitBtn.innerHTML = 'Message Sent ✓';
                submitBtn.style.backgroundColor = '#246B4E';
                submitBtn.style.color = '#FFFFFF';
                
                alert('Thank you! Your message was sent successfully.');
                form.reset();

                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.backgroundColor = '';
                    submitBtn.style.color = '';
                    submitBtn.style.opacity = '';
                }, 3000);
            }, 1200);
        });
    }
};

/* -----------------------------------------
   10. GLOBAL SYSTEM LOADER
   ----------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    loadActiveProjects();
    loadProfileDetails();
    initSettingsDrawer();
    initCustomCursor();
    initIntersectionObserver();
    initProjectModal();
    initHeaderAndForms();
    initHeroTextAnimation();
    initScrollSystem();
    initSmoothScrollClicks();
});
