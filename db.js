import mongoose from 'mongoose';
import { Project, Profile, SiteContent, Section, Category, Service, Experience, User } from './models.js';
import fs from 'fs/promises';
import path from 'path';

/* ─────────────────────────────────────────────────────────
   CONNECT
   ───────────────────────────────────────────────────────── */
export const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio');
        console.log('📦 Connected to MongoDB');
        await seedDatabase();
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err);
    }
};

/* ─────────────────────────────────────────────────────────
   SEED
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
        concept: 'SOLA is a premium, sustainable coffee brand.',
        swatches: ['#0A0F14', '#FFDF79', '#00D2C4', '#F0F3F5'],
        typography: [
            { name: 'Wordmark', font: 'Outfit Medium', size: '36px' },
            { name: 'Sub-brand', font: 'Outfit Light', size: '12px' }
        ]
    }
];

const defaultProfile = {
    hero: {
        badge: 'GRAPHIC AND VISUAL DESIGNER',
        name: 'Sanjay M',
        title: 'PORTFOLIO',
        description: 'Sanjay M is a visual designer specializing in brand identity, editorial layout, packaging, and digital experiences.',
        portrait: '/assets/images/designer_portrait.jpg',
        ctaPrimary: 'View Showcase',
        ctaSecondary: 'Get In Touch'
    },
    about: {
        sectionBadge: '01 / Profile',
        title: 'About Sanjay',
        titleItalic: 'M',
        bio: 'I am a multidisciplinary visual designer.',
        portrait: '/assets/images/designer_portrait.jpg',
        resumeUrl: '',
        resumeLabel: 'Download Biography / Resume (PDF)',
        experience: [{ date: '2024 - Present', role: 'Lead Brand & Identity Designer', company: 'Independent Studio practice' }],
        education: [{ date: '2017 - 2020', role: 'Bachelor of Design (B.Des)', company: 'National Institute of Design' }],
        capabilities: ['Brand Strategy', 'Logo Architecture'],
        software: [{ key: 'Ps', name: 'Photoshop' }],
        services: [
            {
                title: 'Brand Strategy & Identity',
                desc: 'Structuring distinctive logo marks, mathematical grid alignments, visual systems, and comprehensive brand identity booklets designed to endure.',
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
                capabilities: ['Logo Architecture', 'Brand Guideline Systems', 'Color & Type Strategy']
            },
            {
                title: 'Editorial & Print Layout',
                desc: 'Swiss-inspired grid layout publications, high-end uncoated catalogs, and structural editorial brochures built with visual breathing room.',
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>',
                capabilities: ['Grid-System Publications', 'Luxury Catalog Layouts', 'Brochures & Collateral']
            },
            {
                title: 'Packaging & 3D Mockups',
                desc: 'Tactile packaging boxes, material realism labeling, custom dielines, amber glass bottles, and photorealistic 3D product visual mockups.',
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 16 12 21 3 16 3 8 12 3 21 8 21 16"></polyline><polyline points="3 8 12 13 21 8"></polyline><line x1="12" y1="13" x2="12" y2="21"></line></svg>',
                capabilities: ['Cosmetics & Lifestyle Lines', 'Tactile Label Embellishments', 'Cinema 4D Visuals']
            },
            {
                title: 'UI/UX & Web Design',
                desc: 'Clean layouts, visual wireframes, premium digital experiences, responsive interface systems, and smooth interactive animations.',
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line><path d="M6 21h12"></path><path d="M12 17v4"></path></svg>',
                capabilities: ['Aesthetic Digital Interfaces', 'Vite & Next.js Prototyping', 'GSAP Micro-interactions']
            }
        ]
    },
    contact: {
        sectionBadge: '03 / Conversation',
        title: "Let's shape your",
        titleItalic: 'vision.',
        description: 'Looking to elevate your brand identity...',
        email: 'sanjaymurugesan23@gmail.com',
        phone: '+91 98765 43210',
        location: 'Chennai, India & Remote',
        socials: {
            behance: 'https://www.behance.net/sanjayuiuxgd',
            linkedin: 'https://www.linkedin.com/in/sanjaym23'
        }
    }
};

const defaultSite = {
    logo: 'DESIGN.PORTFOLIO',
    nav: [
        { label: 'Home', href: '#hero' },
        { label: 'About', href: '#about' },
        { label: 'Services', href: '#services' },
        { label: 'Projects', href: '#projects' },
        { label: 'Contact', href: '#contact' }
    ],
    navCta: "Let's Work",
    projects: {
        sectionBadge: '03 / Portfolio Work',
        title: 'Selected Case',
        titleItalic: 'Studies',
        categories: ['Logo Designs', 'Brand Identity']
    },
    footer: {
        copyright: '© 2026 DESIGN.PORTFOLIO. All Rights Reserved.',
        thankYouText: 'THANK YOU.'
    },
    contactForm: {
        namePlaceholder: 'Alex Morgan',
        emailPlaceholder: 'alex@example.com',
        categories: [{ value: 'logo-brand', label: 'Logo & Brand Identity' }],
        messagePlaceholder: 'Hi, I want to talk about a design proposal for...'
    }
};

const seedDatabase = async () => {
    try {
        const projCount = await Project.countDocuments();
        if (projCount === 0) {
            let projectsData = seedProjects;
            try {
                const projectsFile = await fs.readFile(path.join(process.cwd(), 'data', 'projects.json'), 'utf8');
                projectsData = JSON.parse(projectsFile);
            } catch (err) {
                console.warn('📁 Could not load data/projects.json for seeding, falling back to default seed projects.');
            }
            await Project.insertMany(projectsData);
        }

        const profCount = await Profile.countDocuments();
        if (profCount === 0) {
            let profileData = defaultProfile;
            try {
                const profileFile = await fs.readFile(path.join(process.cwd(), 'data', 'profile.json'), 'utf8');
                profileData = JSON.parse(profileFile);
            } catch (err) {
                console.warn('📁 Could not load data/profile.json for seeding, falling back to default profile.');
            }
            await Profile.create(profileData);
        }

        const siteCount = await SiteContent.countDocuments();
        if (siteCount === 0) {
            let siteData = defaultSite;
            try {
                const siteFile = await fs.readFile(path.join(process.cwd(), 'data', 'site.json'), 'utf8');
                siteData = JSON.parse(siteFile);
            } catch (err) {
                console.warn('📁 Could not load data/site.json for seeding, falling back to default site content.');
            }
            await SiteContent.create(siteData);
        }
    } catch (err) {
        console.error('❌ Database seeding error during dynamic file reads:', err);
    }

    const sectionCount = await Section.countDocuments();
    if (sectionCount === 0) {
        await Section.insertMany([
            { name: 'Hero', type: 'hero', order: 1 },
            { name: 'About', type: 'about', order: 2 },
            { name: 'Services', type: 'services', order: 3 },
            { name: 'Projects', type: 'projects', order: 4 },
            { name: 'Contact', type: 'contact', order: 5 }
        ]);
    } else {
        // Automatically inject services section if it is missing
        const servicesSection = await Section.findOne({ type: 'services' });
        if (!servicesSection) {
            await Section.create({ name: 'Services', type: 'services', order: 3 });
            await Section.updateOne({ type: 'projects' }, { $set: { order: 4 } });
            await Section.updateOne({ type: 'contact' }, { $set: { order: 5 } });
            console.log('⚡ Services section automatically injected and ordered in Sections collection.');
        }
    }
    
    // Securely seed admin user
    const bcrypt = await import('bcryptjs');
    const adminCount = await User.countDocuments();
    if (adminCount === 0) {
        const username = process.env.ADMIN_USERNAME || 'sanjay239002@gmail.com';
        const password = process.env.ADMIN_PASSWORD || 'qwerty21';
        const hashedPassword = await bcrypt.default.hash(password, 10);
        await User.create({ username, password: hashedPassword });
        console.log(`👤 Admin user created with username: ${username}`);
    } else {
        console.log('👤 Admin user already exists. Preserving credentials.');
    }

    // Run migration for Categories
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
        const site = await SiteContent.findOne();
        const categories = site?.projects?.categories || defaultSite.projects.categories;
        const categoryDocs = categories.map((cat, idx) => ({
            name: cat,
            slug: cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            order: idx
        }));
        await Category.insertMany(categoryDocs);
        console.log('📦 Seeded Categories collection');
    }

    // Run migration for Services
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
        const profile = await Profile.findOne();
        const servicesList = profile?.about?.services || defaultProfile.about.services;
        const serviceDocs = servicesList.map((ser, idx) => ({
            title: ser.title,
            desc: ser.desc,
            icon: ser.icon,
            capabilities: ser.capabilities || [],
            order: idx
        }));
        await Service.insertMany(serviceDocs);
        console.log('📦 Seeded Services collection');
    }

    // Run migration for Experiences & Education
    const expCount = await Experience.countDocuments();
    if (expCount === 0) {
        const profile = await Profile.findOne();
        const experienceList = profile?.about?.experience || defaultProfile.about.experience || [];
        const educationList = profile?.about?.education || defaultProfile.about.education || [];
        
        const docs = [];
        experienceList.forEach((item, idx) => {
            docs.push({
                type: 'experience',
                date: item.date,
                role: item.role,
                company: item.company,
                description: item.description || '',
                location: item.location || '',
                order: idx
            });
        });
        educationList.forEach((item, idx) => {
            docs.push({
                type: 'education',
                date: item.date,
                role: item.role,
                company: item.company,
                description: item.description || '',
                location: item.location || '',
                order: idx
            });
        });
        
        if (docs.length > 0) {
            await Experience.insertMany(docs);
            console.log('📦 Seeded Experiences & Education collection');
        }
    }
};

/* ─────────────────────────────────────────────────────────
   PUBLIC API
   ───────────────────────────────────────────────────────── */
export const getProjects = async () => {
    return await Project.find().sort({ order: 1 });
};
export const saveProjects = async (data) => {
    // If it's a replacement of all projects
    await Project.deleteMany({});
    await Project.insertMany(data);
};

export const getProfile = async () => {
    const p = await Profile.findOne();
    return p ? p.toObject() : defaultProfile;
};
export const saveProfile = async (data) => {
    let p = await Profile.findOne();
    if (p) {
        Object.assign(p, data);
        await p.save();
    } else {
        await Profile.create(data);
    }
};

export const getSiteContent = async () => {
    const s = await SiteContent.findOne();
    return s ? s.toObject() : defaultSite;
};
export const saveSiteContent = async (data) => {
    let s = await SiteContent.findOne();
    if (s) {
        Object.assign(s, data);
        await s.save();
    } else {
        await SiteContent.create(data);
    }
};

export const getSections = async () => {
    return await Section.find().sort({ order: 1 });
};
