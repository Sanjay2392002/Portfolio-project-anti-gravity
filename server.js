import express from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { v2 as cloudinary } from 'cloudinary';
import { getProjects, saveProjects } from './db.js';

// Load Environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and parsing middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets and local uploads path
app.use(express.static('public'));
app.use('/uploads', express.static('public/uploads'));

// Setup Local File Upload storage via Multer
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
        } catch {}
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ storage });

// Configure Cloudinary if keys are defined in .env
const isCloudinaryConfigured = 
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log("☁️ Cloudinary image storage configured successfully.");
} else {
    console.log("📁 Cloudinary credentials missing. Defaulting to local uploads path.");
}

/* -----------------------------------------
   API ENDPOINTS
   ----------------------------------------- */

// 1. GET ALL PROJECTS
app.get('/api/projects', async (req, res) => {
    try {
        const list = await getProjects();
        res.json(list);
    } catch (e) {
        res.status(500).json({ error: "Failed to retrieve projects list" });
    }
});

// 2. CREATE A NEW PROJECT
app.post('/api/projects', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No showcase image file uploaded" });
        }

        const {
            title,
            category,
            year,
            duration,
            tools,
            focus,
            output,
            concept,
            swatches,     // Expected: comma-separated hex strings
            typography    // Expected: JSON string
        } = req.body;

        let imgUrl = "";

        if (isCloudinaryConfigured) {
            // Upload to Cloudinary bucket
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "graphic_design_portfolio"
            });
            imgUrl = result.secure_url;
            
            // Delete local temp file after upload
            try {
                await fs.unlink(req.file.path);
            } catch (err) {
                console.error("Local temp file deletion failed:", err);
            }
        } else {
            // Use local file path served under static middleware
            imgUrl = `/uploads/${req.file.filename}`;
        }

        // Parse swatches (comma-separated hex codes to array)
        const swatchArr = swatches 
            ? swatches.split(',').map(s => s.trim()) 
            : ["#0044FF", "#C85A32", "#FAF9F5", "#141518"];

        // Parse typography (JSON string to array)
        let typoArr = [];
        try {
            typoArr = typography ? JSON.parse(typography) : [];
        } catch {
            typoArr = [
                { name: "Headline typography", font: "Outfit Bold", size: "72px" },
                { name: "Body text", font: "Outfit Regular", size: "16px" }
            ];
        }

        // Build unique ID
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);

        const newProject = {
            id,
            category,
            title,
            img: imgUrl,
            year: year || "2026",
            duration: duration || "3 Weeks",
            tools: tools || "Illustrator, Photoshop",
            focus: focus || "Branding construction",
            output: output || "Case mockup",
            concept,
            swatches: swatchArr,
            typography: typoArr
        };

        const list = await getProjects();
        list.push(newProject);
        await saveProjects(list);

        res.status(201).json(newProject);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to upload project" });
    }
});

// 3. DELETE A PROJECT
app.delete('/api/projects/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const list = await getProjects();
        
        const projectToDelete = list.find(p => p.id === id);
        if (!projectToDelete) {
            return res.status(404).json({ error: "Project not found" });
        }

        // If local file, delete it from disk
        if (projectToDelete.img.startsWith('/uploads/')) {
            const filename = projectToDelete.img.replace('/uploads/', '');
            const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
            try {
                await fs.unlink(filePath);
            } catch (err) {
                console.error("Local file delete warning:", err.message);
            }
        }

        const filteredList = list.filter(p => p.id !== id);
        await saveProjects(filteredList);

        res.json({ success: true, message: `Project ${id} deleted successfully` });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to delete project" });
    }
});

// Start listening
app.listen(PORT, () => {
    console.log(`🚀 Portfolio backend server running at http://localhost:${PORT}`);
});
