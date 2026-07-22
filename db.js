import fs from 'fs/promises';
import path from 'path';

const DATA_DIR   = path.join(process.cwd(), 'data');
const DB_FILE    = path.join(DATA_DIR, 'projects.json');
const PROFILE_FILE = path.join(DATA_DIR, 'profile.json');
const SITE_FILE  = path.join(DATA_DIR, 'site.json');

/* ─────────────────────────────────────────────────────────
   SEED: Projects
   ───────────────────────────────────────────────────────── */
const seedProjects = [
    {
        id: 'sola-coffee-1234',
        category: 'Logo Designs',
        title: 'Sola Organic Coffee Mark',
        img: '/assets/images/logo_showcase.jpg',
        year: '2026',
        duration: '5 Weeks',
        tools: 'Adobe Illustrator, Figma',
        client: 'Sola Coffee Co. (Concept)',
        focus: 'Geometric alignment, brand story, food styling',
        output: 'Logo mark, package label, identity guide',
        concept: 'SOLA is a premium, sustainable coffee brand. The logo mark simplifies the shape of a sun rising over a coffee bean. The geometry is built using strict mathematical proportions. A dark slate background combined with custom gold-leaf embossing creates a premium and trustworthy visual appearance.',
        swatches: ['#0A0F14', '#FFDF79', '#00D2C4', '#F0F3F5'],
        typography: [
            { name: 'Wordmark', font: 'Outfit Medium', size: '36px' },
            { name: 'Sub-brand', font: 'Outfit Light', size: '12px' }
        ]
    },
    {
        id: 'skin-alchemy-1234',
        category: 'Packaging Designs',
        title: 'Skin Alchemy Packaging',
        img: '/assets/images/package_box.jpg',
        year: '2026',
        duration: '3 Weeks',
        tools: 'Cinema 4D, Photoshop',
        client: 'Skin Alchemy Lab',
        focus: 'Material realism, tactile packaging, organic styling',
        output: 'Skincare cosmetic box, amber glass bottle, label design',
        concept: 'Skin Alchemy is a luxury organic skincare and lifestyle line. The packaging design emphasizes raw materials and minimalist graphics. Using a matte black glass bottle paired with a rough-textured box, the tactile experience is premium.',
        swatches: ['#120E0A', '#E59050', '#DFD3C3', '#F6F4F2'],
        typography: [
            { name: 'Title Font', font: 'Playfair Display Italic', size: '28px' },
            { name: 'Description', font: 'Outfit Regular', size: '14px' }
        ]
    },
    {
        id: 'aura-jewelry-1234',
        category: 'Print Designs',
        title: 'Aura Luxury Editorial Catalog',
        img: '/assets/images/print_layout.jpg',
        year: '2025',
        duration: '4 Weeks',
        tools: 'Adobe InDesign, Photoshop',
        client: 'Aura Fine Jewelry',
        focus: 'Grid systems, high-end typography, catalog design',
        output: 'Uncoated paper catalog spread, branding brochure',
        concept: 'Inspired by Swiss architecture and minimal geometry, this project represents a luxury editorial print catalog for a modern jewelry startup. The layout follows a strict, asymmetrical grid system, allowing ample breathing room.',
        swatches: ['#EADEC9', '#202022', '#CFB584', '#959599'],
        typography: [
            { name: 'Heading', font: 'Playfair Display Regular', size: '48px' },
            { name: 'Body Text', font: 'Outfit Light', size: '15px' }
        ]
    },
    {
        id: 'neon-beat-1234',
        category: 'UI UX Designs',
        title: 'Neon Beat Music Platform',
        img: '/assets/images/social_poster.jpg',
        year: '2026',
        duration: '2 Weeks',
        tools: 'Adobe Photoshop, Illustrator',
        client: 'Neon Beat DAO',
        focus: 'Vibrant compositions, tech platforms, campaign design',
        output: 'Social media posters, App store screenshots, Banner templates',
        concept: 'The concept was centered around capturing the retro-futuristic energy of a modern web3 music platform startup. We combined vibrant neon pinks and teals with custom vector artwork.',
        swatches: ['#FF007A', '#00F0FF', '#0C0817', '#9C95AB'],
        typography: [
            { name: 'Headline', font: 'Outfit ExtraBold', size: '72px' },
            { name: 'Body Text', font: 'Outfit Regular', size: '16px' }
        ]
    }
];

/* ─────────────────────────────────────────────────────────
   SEED: Profile  (hero + about + contact)
   ───────────────────────────────────────────────────────── */
const defaultProfile = {
    hero: {
        badge: 'GRAPHIC AND VISUAL DESIGNER',
        name: 'Sanjay M',
        title: 'PORTFOLIO',
        description: 'Sanjay M is a graphic and visual designer specializing in brand identity, editorial layout, packaging, and digital experiences. Creating premium designs rooted in precision and modern aesthetics.',
        portrait: '/assets/images/designer_portrait.jpg',
        ctaPrimary: 'View Showcase',
        ctaSecondary: 'Get In Touch'
    },
    about: {
        sectionBadge: '01 / Profile',
        title: 'About Sanjay',
        titleItalic: 'M',
        bio: 'I am a multidisciplinary visual designer driven by geometric structure, typographic elegance, and a devotion to minimal aesthetics. I translate complex brand concepts into highly functional visual identities, editorial layouts, and tangible packaging layouts. I build systems that bridge the gap between creative storytelling and industrial execution.',
        portrait: '/assets/images/designer_portrait.jpg',
        resumeUrl: '',
        resumeLabel: 'Download Biography / Resume (PDF)',
        experience: [
            { date: '2024 - Present', role: 'Lead Brand & Identity Designer', company: 'Independent Studio practice' },
            { date: '2022 - 2024',    role: 'Senior Graphic Designer',         company: 'Visual Communications Agency' },
            { date: '2020 - 2022',    role: 'Visual UX Designer',              company: 'Digital Experience Agency' }
        ],
        education: [
            { date: '2017 - 2020', role: 'Bachelor of Design (B.Des)',         company: 'National Institute of Design' },
            { date: '2015 - 2017', role: 'Creative Communication Certificate', company: 'Academy of Fine Arts' }
        ],
        capabilities: [
            'Brand Strategy',
            'Logo Architecture',
            'Editorial Layout',
            'Packaging Structural Design',
            'Interface Design (UI/UX)',
            'Art Direction',
            '3D Product Mockups'
        ],
        software: [
            { key: 'Ps',  name: 'Photoshop' },
            { key: 'Ai',  name: 'Illustrator' },
            { key: 'Id',  name: 'InDesign' },
            { key: 'Fi',  name: 'Figma' },
            { key: 'C4d', name: 'Cinema 4D' }
        ]
    },
    contact: {
        sectionBadge: '03 / Conversation',
        title: "Let's shape your",
        titleItalic: 'vision.',
        description: 'Looking to elevate your brand identity, redesign a website, or create custom prints? Reach out for collaboration or consulting inquiries.',
        email: 'sanjaymurugesan23@gmail.com',
        phone: '+91 98765 43210',
        location: 'Chennai, India & Remote',
        socials: {
            behance:   'https://www.behance.net/sanjayuiuxgd',
            linkedin:  'https://www.linkedin.com/in/sanjaym23',
            instagram: 'https://www.instagram.com/design._.folio',
            dribbble:  'https://dribbble.com/sanjayuiuxgd',
            github:    'https://github.com/Sanjay2392002'
        }
    }
};

/* ─────────────────────────────────────────────────────────
   SEED: Site-wide content (nav, footer, projects section)
   ───────────────────────────────────────────────────────── */
const defaultSite = {
    logo: 'DESIGN.PORTFOLIO',
    nav: [
        { label: 'Home',     href: '#hero' },
        { label: 'About',    href: '#about' },
        { label: 'Projects', href: '#projects' },
        { label: 'Contact',  href: '#contact' },
        { label: 'Resume',   href: '#about-resume' }
    ],
    navCta: "Let's Work",
    projects: {
        sectionBadge: '02 / Portfolio Work',
        title: 'Selected Case',
        titleItalic: 'Studies',
        categories: [
            'Logo Designs',
            'Brand Identity',
            'Social Media Designs',
            'Print Designs',
            'Packaging Designs',
            'Advertising Campaigns',
            'Product Mockups',
            'UI UX Designs',
            'Web Designs',
            'Creative Photography',
            '3D & AI Visuals',
            'Personal Projects'
        ]
    },
    footer: {
        copyright: '© 2026 DESIGN.PORTFOLIO. All Rights Reserved.',
        thankYouText: 'THANK YOU.'
    },
    contactForm: {
        namePlaceholder: 'Alex Morgan',
        emailPlaceholder: 'alex@example.com',
        categories: [
            { value: 'logo-brand',  label: 'Logo & Brand Identity' },
            { value: 'packaging',   label: 'Packaging Design' },
            { value: 'ui-ux-web',  label: 'UI/UX & Web Design' },
            { value: 'editorial',   label: 'Print & Editorial Layout' },
            { value: '3d-visuals',  label: '3D & AI Visuals' },
            { value: 'other',       label: 'Other Creative Project' }
        ],
        messagePlaceholder: 'Hi, I want to talk about a design proposal for...'
    }
};

/* ─────────────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────────────── */
const ensureDir = async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
};

const readJson = async (filePath, seed) => {
    await ensureDir();
    try {
        await fs.access(filePath);
    } catch {
        await fs.writeFile(filePath, JSON.stringify(seed, null, 4));
        return seed;
    }
    try {
        const raw = await fs.readFile(filePath, 'utf8');
        return JSON.parse(raw);
    } catch {
        return seed;
    }
};

const writeJson = async (filePath, data) => {
    await ensureDir();
    await fs.writeFile(filePath, JSON.stringify(data, null, 4));
};

/* ─────────────────────────────────────────────────────────
   PUBLIC API
   ───────────────────────────────────────────────────────── */
export const getProjects = ()           => readJson(DB_FILE,      seedProjects);
export const saveProjects = (data)      => writeJson(DB_FILE,     data);

export const getProfile = ()            => readJson(PROFILE_FILE, defaultProfile);
export const saveProfile = (data)       => writeJson(PROFILE_FILE, data);

export const getSiteContent = ()        => readJson(SITE_FILE,    defaultSite);
export const saveSiteContent = (data)   => writeJson(SITE_FILE,   data);
