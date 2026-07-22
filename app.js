/* -----------------------------------------
   1. STATE MANAGEMENT & DUAL FETCH ENGINE (BACKEND + BEHANCE)
   ----------------------------------------- */
let activeProjects = []; // Holds works uploaded via personal Admin Panel database
let behanceProjects = []; // Holds live Behance fetched works

// Map categories to section IDs
const categoryMapping = {
    'food': 'food',
    'jewelry': 'jewelry',
    'tech': 'tech'
};

// Tracks active showcase slide indices per section
const activeIndices = {
    'food': 0,
    'jewelry': 0,
    'tech': 0
};

// Default seed projects (in case backend fetch fails before initialization)
const fallbackProjects = [
    {
        id: "sola-coffee-1234",
        category: "food",
        title: "Sola Organic Coffee Mark",
        img: "/assets/images/logo_showcase.jpg",
        year: "2026",
        duration: "5 Weeks",
        tools: "Adobe Illustrator, Figma",
        focus: "Geometric alignment, brand story, food styling",
        output: "Logo mark, package label, identity guide",
        concept: "SOLA is a premium, sustainable coffee brand. The logo mark simplifies the shape of a sun rising over a coffee bean. The geometry is built using strict mathematical proportions. A dark slate background combined with custom gold-leaf embossing creates a premium and trustworthy visual appearance.",
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
        swatches: ["#EADEC9", "#202022", "#CFB584", "#959599"],
        typography: [
            { name: "Heading", font: "Playfair Display Regular", size: "48px" },
            { name: "Body Text", font: "Outfit Light", size: "15px" }
        ]
    },
    {
        id: "neon-beat-1234",
        category: "tech",
        title: "Neon Beat Music Platform",
        img: "/assets/images/social_poster.jpg",
        year: "2026",
        duration: "2 Weeks",
        tools: "Adobe Photoshop, Illustrator",
        focus: "Vibrant compositions, tech platforms, campaign design",
        output: "Social media posters, App store screenshots, Banner templates",
        concept: "The concept was centered around capturing the retro-futuristic energy of a modern web3 music platform startup. We combined vibrant neon pinks and teals with custom vector artwork, creating abstract geometric layout systems. A high-contrast sans-serif font ensures high legibility, while floating elements convey motion and sound waves.",
        swatches: ["#FF007A", "#00F0FF", "#0C0817", "#9C95AB"],
        typography: [
            { name: "Headline", font: "Outfit ExtraBold", size: "72px" },
            { name: "Body Text", font: "Outfit Regular", size: "16px" }
        ]
    }
];

// Helper: Resolve dynamic production API base URL
const getApiUrl = (endpoint) => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
        return endpoint;
    }
    const savedBackendUrl = localStorage.getItem('production_api_url') || '';
    return `${savedBackendUrl.replace(/\/$/, '')}${endpoint}`;
};

// Load active database projects from Express API backend
const loadActiveProjects = async () => {
    try {
        const response = await fetch(getApiUrl('/api/projects'));
        if (!response.ok) throw new Error("Backend connection failed");
        activeProjects = await response.json();
    } catch (e) {
        console.warn("Could not load from backend. Using static seeds.", e);
        activeProjects = [...fallbackProjects];
    }
    renderAllSections();
};

const getProjectById = (projectId) => {
    // Check local backend list or Behance feed list
    return activeProjects.find(p => p.id === projectId) || behanceProjects.find(p => p.guid === projectId);
};

/* -----------------------------------------
   2. DYNAMIC LAYOUT RENDERING SYSTEM
   ----------------------------------------- */
const renderCategorySection = (category) => {
    const sectionId = categoryMapping[category];
    if (!sectionId) return;

    const categoryProjects = activeProjects.filter(p => p.category === category);
    
    // Select HTML target nodes
    const descEl = document.getElementById(`${sectionId}-desc`);
    const focusEl = document.getElementById(`${sectionId}-meta-focus`);
    const outputEl = document.getElementById(`${sectionId}-meta-output`);
    const btnEl = document.getElementById(`${sectionId}-btn`);
    const imgEl = document.getElementById(`${sectionId}-img`);
    const overlayTagEl = document.getElementById(`${sectionId}-overlay-tag`);
    const overlayTitleEl = document.getElementById(`${sectionId}-overlay-title`);
    const thumbTrack = document.getElementById(`${sectionId}-thumbnails`);
    const cardEl = document.getElementById(`${sectionId}-card`);

    if (categoryProjects.length === 0) {
        // Display placeholder clean empty state
        if (descEl) descEl.textContent = "No works uploaded yet in this category. Visit the Admin Panel to add your design!";
        if (focusEl) focusEl.textContent = "N/A";
        if (outputEl) outputEl.textContent = "N/A";
        if (btnEl) btnEl.style.display = 'none';
        if (imgEl) imgEl.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='100%25' height='100%25' fill='%23faf9f5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Outfit' fill='%236e7178' font-size='14'%3EEmpty Category%3C/text%3E%3C/svg%3E";
        if (overlayTitleEl) overlayTitleEl.textContent = "Showcase Empty";
        if (thumbTrack) thumbTrack.innerHTML = '';
        return;
    }

    // Keep activeIndex within bounds
    let activeIdx = activeIndices[category];
    if (activeIdx >= categoryProjects.length) {
        activeIdx = 0;
        activeIndices[category] = 0;
    }

    const proj = categoryProjects[activeIdx];

    // Populating DOM elements
    if (descEl) descEl.textContent = proj.concept;
    if (focusEl) focusEl.textContent = proj.focus;
    if (outputEl) outputEl.textContent = proj.output;
    
    if (btnEl) {
        btnEl.style.display = 'inline-flex';
        btnEl.setAttribute('data-project', proj.id);
    }
    
    if (imgEl) {
        imgEl.src = proj.img;
        imgEl.alt = proj.title + " mockup image";
    }
    
    if (overlayTagEl) overlayTagEl.textContent = proj.category.toUpperCase();
    if (overlayTitleEl) overlayTitleEl.textContent = proj.title;
    if (cardEl) {
        cardEl.setAttribute('data-project', proj.id);
    }

    // Build dots indicator track for section switching
    if (thumbTrack) {
        thumbTrack.innerHTML = '';
        if (categoryProjects.length > 1) {
            categoryProjects.forEach((p, idx) => {
                const dot = document.createElement('button');
                dot.className = `thumb-dot ${idx === activeIdx ? 'active' : ''}`;
                dot.setAttribute('aria-label', `View ${p.title}`);
                
                dot.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (idx === activeIdx) return;
                    switchSectionWithTransition(category, idx);
                });
                
                thumbTrack.appendChild(dot);
            });
        }
    }
};

const switchSectionWithTransition = (category, targetIdx) => {
    const infoContainer = document.querySelector(`#${category} .section-info`);
    const cardEl = document.getElementById(`${category}-card`);

    if (infoContainer && cardEl) {
        infoContainer.classList.add('project-switching');
        cardEl.classList.add('project-switching');
        
        setTimeout(() => {
            activeIndices[category] = targetIdx;
            renderCategorySection(category);
            infoContainer.classList.remove('project-switching');
            cardEl.classList.remove('project-switching');
        }, 300);
    } else {
        activeIndices[category] = targetIdx;
        renderCategorySection(category);
    }
};

const renderAllSections = () => {
    Object.keys(categoryMapping).forEach(category => {
        renderCategorySection(category);
    });
};

/* -----------------------------------------
   3. BEHANCE FEED FETCHING INTEGRATION (LOGOS MASONRY)
   ----------------------------------------- */
const fetchBehanceProjects = async (username) => {
    const grid = document.getElementById('behance-projects-grid');
    if (!grid) return;

    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); font-size: 0.95rem; padding: 3rem 0;">Fetching live projects from Behance...</div>';

    try {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        let items = [];

        if (isLocal) {
            // Fetch via local development proxy configuration (vite.config.js) to bypass Cloudflare
            const response = await fetch(`/api-behance/feeds/user?username=${username}`);
            if (!response.ok) throw new Error(`Proxy status: ${response.status}`);
            
            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "text/xml");
            
            const parserError = xmlDoc.querySelector("parsererror");
            if (parserError) throw new Error("XML Feed structure parsing error.");

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
            // Production static deployments fallback using rss2json
            const rssUrl = `https://www.behance.net/feeds/user?username=${username}`;
            const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
            const data = await response.json();
            if (data.status !== 'ok') throw new Error(data.message || "Failed to load via parser api.");
            items = data.items.map(item => ({
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
                description: item.description,
                categories: item.categories || ["Behance"],
                guid: item.guid || item.link
            }));
        }

        if (items.length === 0) {
            grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:#d11a2a; font-size:0.95rem; padding:4rem 0;">No logo projects found on this profile.</div>`;
            return;
        }

        behanceProjects = items;
        grid.innerHTML = ''; // Clear loading message

        behanceProjects.forEach(item => {
            // Extract the high quality cover image from description HTML
            const imgRegex = /<img[^>]+src="([^">]+)"/;
            const match = item.description.match(imgRegex);
            const imageUrl = match ? match[1] : item.thumbnail || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\'%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'%23f4f4f4\'/%3E%3C/svg%3E';
            const dateStr = item.pubDate ? new Date(item.pubDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : '';

            const card = document.createElement('a');
            card.href = item.link;
            card.target = '_blank';
            card.className = 'behance-card';
            card.innerHTML = `
                <div class="behance-img-wrapper">
                    <img src="${imageUrl}" class="behance-img" alt="${item.title}" loading="lazy">
                </div>
                <div class="behance-info">
                    <div>
                        <h4 class="behance-proj-title">${item.title}</h4>
                        <span class="behance-proj-date">${dateStr}</span>
                    </div>
                    <span class="behance-link-btn">
                        View Project
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </span>
                </div>
            `;
            grid.appendChild(card);
        });

    } catch (e) {
        console.error(e);
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #d11a2a; font-size: 0.95rem; padding: 3rem 0;">
            Failed to connect to Behance Feed. <br><br>
            <span style="font-size:0.8rem; color:var(--text-muted);">Error Details: ${e.message}</span>
        </div>`;
    }
};

// Helper: Parse description text from HTML
const parseCleanDescription = (proj) => {
    if (!proj.description) return "No description details provided.";
    let clean = proj.concept || proj.description.replace(/<[^>]*>/g, ' ');
    clean = clean.replace(/\s+/g, ' ').trim();
    return clean.length > 320 ? clean.substring(0, 320) + "..." : clean;
};

// Helper: Parse the cover image
const parseCoverImage = (proj) => {
    if (proj.img) return proj.img; // Local backend image link
    const imgRegex = /<img[^>]+src="([^">]+)"/;
    const match = proj.description.match(imgRegex);
    return match ? match[1] : proj.thumbnail || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\'%3E%3Crect fill=\'%23faf9f5\'/%3E%3C/svg%3E';
};

// Helper: Dynamic Color Swatch extraction (uses average color block extraction on local canvas)
const extractPaletteFromImage = (imgSrc) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = 4;
                canvas.height = 1;
                ctx.drawImage(img, 0, 0, 4, 1);
                const imgData = ctx.getImageData(0, 0, 4, 1).data;
                const colors = [];
                for (let i = 0; i < 4; i++) {
                    const r = imgData[i * 4];
                    const g = imgData[i * 4 + 1];
                    const b = imgData[i * 4 + 2];
                    const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
                    colors.push(hex);
                }
                resolve(colors);
            } catch (e) {
                resolve(["#0044FF", "#C85A32", "#FAF9F5", "#141518"]);
            }
        };
        img.onerror = () => {
            resolve(["#0044FF", "#C85A32", "#FAF9F5", "#141518"]);
        };
        img.src = imgSrc;
    });
};

/* -----------------------------------------
   4. SETTINGS DRAWER CONTROLLER
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

    // Check saved URL or default user
    const savedUrl = localStorage.getItem('behance_profile_url');
    const urlToLoad = savedUrl || 'https://www.behance.net/sanjayuiuxgd';
    const activeUsername = extractUsername(urlToLoad);
    
    if (urlInput) {
        urlInput.value = urlToLoad;
    }

    // Check saved backend URL
    const savedBackendUrl = localStorage.getItem('production_api_url') || '';
    if (backendInput) {
        backendInput.value = savedBackendUrl;
    }

    if (!savedUrl && demoBanner) {
        demoBanner.style.display = 'block';
    }

    // Save and sync Behance
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

    // Save backend production URL
    if (saveBackendBtn && backendInput) {
        saveBackendBtn.addEventListener('click', () => {
            const backendVal = backendInput.value.trim();
            localStorage.setItem('production_api_url', backendVal);
            showNotification('Backend URL saved successfully! Reloading...');
            closeDrawer();
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        });
    }

    // Load initial feed
    fetchBehanceProjects(activeUsername);
};

// Simple notification alert helper
const showNotification = (msg) => {
    alert(msg);
};

const extractUsername = (input) => {
    if (!input) return 'sanjayuiuxgd';
    let clean = input.trim();
    const urlRegex = /(?:https?:\/\/)?(?:www\.)?behance\.net\/([^\/\?#]+)/i;
    const match = clean.match(urlRegex);
    return match ? match[1] : clean;
};

/* -----------------------------------------
   5. CUSTOM CURSOR CONTROLLER
   ----------------------------------------- */
const initCustomCursor = () => {
    const cursor = document.querySelector('.custom-cursor');
    const cursorDot = document.querySelector('.custom-cursor-dot');
    
    if (!cursor || !cursorDot) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let dotX = 0;
    let dotY = 0;

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
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        
        dotX += (mouseX - dotX) * 0.3;
        dotY += (mouseY - dotY) * 0.3;

        cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
        cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;

        requestAnimationFrame(animateCursor);
    };
    
    requestAnimationFrame(animateCursor);

    const hoverTargets = 'a, button, input, select, textarea, .visual-card, .dot-link, .thumb-dot, .behance-card';
    document.body.addEventListener('mouseenter', (e) => {
        if (e.target.matches && e.target.matches(hoverTargets)) {
            cursor.classList.add('hovered');
        }
    }, true);

    document.body.addEventListener('mouseleave', (e) => {
        if (e.target.matches && e.target.matches(hoverTargets)) {
            cursor.classList.remove('hovered');
        }
    }, true);
};

/* -----------------------------------------
   6. INTERSECTION OBSERVER (ACTIVE SECTIONS)
   ----------------------------------------- */
const initIntersectionObserver = () => {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    const dotLinks = document.querySelectorAll('.dot-link');
    
    const options = {
        root: null,
        threshold: 0.45
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');
                const themeName = entry.target.getAttribute('data-theme');
                
                sections.forEach(sec => sec.classList.remove('active-section'));
                entry.target.classList.add('active-section');
                
                document.body.setAttribute('data-active-theme', themeName);
                
                navLinks.forEach(link => {
                    if (link.getAttribute('data-sec') === sectionId) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
                
                dotLinks.forEach(dot => {
                    if (dot.getAttribute('data-sec') === sectionId) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
            }
        });
    }, options);

    sections.forEach(section => {
        observer.observe(section);
    });
};

/* -----------------------------------------
   7. CASE STUDY MODAL MANAGEMENT
   ----------------------------------------- */
const initProjectModal = () => {
    const modal = document.getElementById('project-modal');
    const closeBtn = document.querySelector('.modal-close');

    if (!modal) return;

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

    const openModal = async (projectId) => {
        const data = getProjectById(projectId);
        if (!data) return;

        const isBehance = data.link !== undefined;
        const coverUrl = parseCoverImage(data);
        const cleanDesc = parseCleanDescription(data);
        const year = data.year || (data.pubDate ? new Date(data.pubDate).getFullYear() : '2026');

        // Load details
        modalImg.src = coverUrl;
        modalImg.alt = data.title;
        modalCat.textContent = isBehance ? "Behance Case Study" : `Personal Database - ${data.category.toUpperCase()}`;
        modalTitle.textContent = data.title;
        modalYear.textContent = year;
        modalDuration.textContent = data.duration || "Completed Feed Project";
        modalTools.textContent = data.tools || (data.categories || []).join(", ") || "Illustrator, Photoshop";
        modalConcept.textContent = cleanDesc;
        
        if (isBehance && modalBehanceLink) {
            modalBehanceLink.href = data.link;
            modalBehanceLink.style.display = 'inline-flex';
        } else if (modalBehanceLink) {
            modalBehanceLink.style.display = 'none';
        }

        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // Extract palette dynamically
        const extractedSwatches = data.swatches || await extractPaletteFromImage(coverUrl);
        modalSwatches.innerHTML = '';
        extractedSwatches.forEach(color => {
            const swatchGrp = document.createElement('div');
            swatchGrp.className = 'swatch-group';
            
            const swatch = document.createElement('div');
            swatch.className = 'swatch';
            swatch.style.backgroundColor = color;
            
            const label = document.createElement('span');
            label.className = 'swatch-label';
            label.textContent = color;
            
            swatchGrp.appendChild(swatch);
            swatchGrp.appendChild(label);
            modalSwatches.appendChild(swatchGrp);
        });

        // Typography specimens
        modalTypo.innerHTML = '';
        const typoSpecimen = data.typography || [
            { name: "Headline Typography", font: "Outfit SemiBold", size: "64px" },
            { name: "Editorial Body", font: "Playfair Display Regular", size: "16px" }
        ];

        typoSpecimen.forEach(spec => {
            const typoRow = document.createElement('div');
            typoRow.className = 'typo-row';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'typo-font';
            nameSpan.textContent = `${spec.name}: ${spec.font}`;
            
            const sizeSpan = document.createElement('span');
            sizeSpan.className = 'typo-sample';
            sizeSpan.textContent = `AaBbCc (${spec.size})`;
            
            typoRow.appendChild(nameSpan);
            typoRow.appendChild(sizeSpan);
            modalTypo.appendChild(typoRow);
        });
    };

    const closeModal = () => {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    document.body.addEventListener('click', (e) => {
        const cardTrigger = e.target.closest('.visual-card');
        const btnTrigger = e.target.closest('.view-project-btn');
        
        if (cardTrigger) {
            const id = cardTrigger.getAttribute('data-project') || cardTrigger.getAttribute('data-guid');
            if (id) openModal(id);
        } else if (btnTrigger) {
            const id = btnTrigger.getAttribute('data-project') || btnTrigger.getAttribute('data-guid');
            if (id) openModal(id);
        }
    });

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
};

/* -----------------------------------------
   8. MOBILE MENU & FORM SUBMISSION
   ----------------------------------------- */
const initHeaderAndForms = () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (menuToggle && mainNav) {
        const headerActions = document.querySelector('.header-actions');
        const mediaQuery = window.matchMedia('(max-width: 991px)');
        
        const handleTabletChange = (e) => {
            if (e.matches) {
                if (mainNav && headerActions && !mainNav.contains(headerActions)) {
                    mainNav.appendChild(headerActions);
                }
            } else {
                if (mainNav && headerActions && mainNav.contains(headerActions)) {
                    const headerContainer = document.querySelector('.header-container');
                    if (headerContainer) {
                        headerContainer.insertBefore(headerActions, menuToggle);
                    }
                }
            }
        };
        
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleTabletChange);
        } else if (mediaQuery.addListener) {
            mediaQuery.addListener(handleTabletChange);
        }
        handleTabletChange(mediaQuery);

        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('mobile-open');
            const bars = menuToggle.querySelectorAll('.bar');
            if (bars.length >= 3) {
                if (mainNav.classList.contains('mobile-open')) {
                    bars[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                    bars[1].style.transform = 'scale(0)';
                    bars[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
                } else {
                    bars[0].style.transform = 'none';
                    bars[1].style.transform = 'none';
                    bars[2].style.transform = 'none';
                }
            }
        });

        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
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
                submitBtn.style.backgroundColor = 'var(--accent-color)';
                submitBtn.style.color = '#ffffff';
                
                alert('Thank you! Your message was sent successfully.');
                form.reset();

                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.backgroundColor = '';
                    submitBtn.style.color = '';
                    submitBtn.style.opacity = '';
                }, 3000);
            }, 1500);
        });
    }
};

/* -----------------------------------------
   9. GLOBAL INITIALIZATION
   ----------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    loadActiveProjects();
    initSettingsDrawer();
    initCustomCursor();
    initIntersectionObserver();
    initProjectModal();
    initHeaderAndForms();
});
