import fs from 'fs/promises';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'projects.json');

// Default initial projects seed
const seedProjects = [
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

export const initDb = async () => {
    try {
        await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
        try {
            await fs.access(DB_FILE);
        } catch {
            // Seed database file if missing
            await fs.writeFile(DB_FILE, JSON.stringify(seedProjects, null, 4));
        }
    } catch (e) {
        console.error("Database directory setup failed:", e);
    }
};

export const getProjects = async () => {
    try {
        await initDb();
        const data = await fs.readFile(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        console.error("Error reading database:", e);
        return [];
    }
};

export const saveProjects = async (projects) => {
    try {
        await initDb();
        await fs.writeFile(DB_FILE, JSON.stringify(projects, null, 4));
        return true;
    } catch (e) {
        console.error("Error saving database:", e);
        return false;
    }
};
