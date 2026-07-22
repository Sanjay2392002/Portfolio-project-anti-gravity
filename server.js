import express from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { v2 as cloudinary } from 'cloudinary';
import { getProjects, saveProjects, getProfile, saveProfile } from './db.js';

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

// Setup Multi-file storage for Profile upload fields
const profileUpload = upload.fields([
    { name: 'hero_portrait', maxCount: 1 },
    { name: 'about_portrait', maxCount: 1 },
    { name: 'resume_pdf', maxCount: 1 }
]);

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

// 4. UPDATE AN EXISTING PROJECT
app.put('/api/projects/:id', upload.single('image'), async (req, res) => {
    try {
        const id = req.params.id;
        const list = await getProjects();
        const projectIdx = list.findIndex(p => p.id === id);
        
        if (projectIdx === -1) {
            return res.status(404).json({ error: "Project not found" });
        }

        const project = list[projectIdx];

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

        let imgUrl = project.img; // Default to existing image

        if (req.file) {
            // Upload new image
            if (isCloudinaryConfigured) {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: "graphic_design_portfolio"
                });
                imgUrl = result.secure_url;
                
                try {
                    await fs.unlink(req.file.path);
                } catch (err) {
                    console.error("Local temp file deletion failed:", err);
                }
            } else {
                imgUrl = `/uploads/${req.file.filename}`;
            }

            // Optional: delete old local image if it was local to prevent clutter
            if (project.img.startsWith('/uploads/')) {
                const filename = project.img.replace('/uploads/', '');
                const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
                try {
                    await fs.unlink(filePath);
                } catch (err) {
                    console.error("Local file delete warning:", err.message);
                }
            }
        }

        // Parse swatches (comma-separated hex codes to array)
        let swatchArr = project.swatches;
        if (swatches) {
            swatchArr = swatches.split(',').map(s => s.trim());
        }

        // Parse typography (JSON string to array)
        let typoArr = project.typography;
        if (typography) {
            try {
                typoArr = JSON.parse(typography);
            } catch {
                // Keep existing
            }
        }

        list[projectIdx] = {
            ...project,
            title: title || project.title,
            category: category || project.category,
            year: year || project.year,
            duration: duration || project.duration,
            tools: tools || project.tools,
            focus: focus || project.focus,
            output: output || project.output,
            concept: concept !== undefined ? concept : project.concept,
            img: imgUrl,
            swatches: swatchArr,
            typography: typoArr
        };

        await saveProjects(list);
        res.json(list[projectIdx]);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to update project" });
    }
});

// 5. GET PROFILE DATA
app.get('/api/profile', async (req, res) => {
    try {
        const profile = await getProfile();
        res.json(profile);
    } catch (e) {
        res.status(500).json({ error: "Failed to retrieve profile details" });
    }
});

// 6. UPDATE PROFILE DATA (WITH OPTIONAL PORTRAITS AND RESUME FILE)
app.put('/api/profile', profileUpload, async (req, res) => {
    try {
        const profile = await getProfile();

        const {
            hero_subtitle,
            hero_title,
            hero_description,
            about_title,
            about_bio,
            about_experience,   // JSON string of experience timeline array
            about_education,    // JSON string of education timeline array
            about_capabilities, // comma-separated tags
            about_software,     // JSON string of software array
            contact_email,
            contact_phone,
            contact_location,
            contact_socials     // JSON string of socials object
        } = req.body;

        // Process file uploads
        if (req.files) {
            if (req.files['hero_portrait']) {
                const file = req.files['hero_portrait'][0];
                if (isCloudinaryConfigured) {
                    const result = await cloudinary.uploader.upload(file.path, {
                        folder: "graphic_design_portfolio"
                    });
                    profile.hero.portrait = result.secure_url;
                    try { await fs.unlink(file.path); } catch {}
                } else {
                    profile.hero.portrait = `/uploads/${file.filename}`;
                }
            }

            if (req.files['about_portrait']) {
                const file = req.files['about_portrait'][0];
                if (isCloudinaryConfigured) {
                    const result = await cloudinary.uploader.upload(file.path, {
                        folder: "graphic_design_portfolio"
                    });
                    profile.about.portrait = result.secure_url;
                    try { await fs.unlink(file.path); } catch {}
                } else {
                    profile.about.portrait = `/uploads/${file.filename}`;
                }
            }

            if (req.files['resume_pdf']) {
                const file = req.files['resume_pdf'][0];
                if (isCloudinaryConfigured) {
                    const result = await cloudinary.uploader.upload(file.path, {
                        folder: "graphic_design_portfolio",
                        resource_type: "raw"
                    });
                    profile.about.resumeUrl = result.secure_url;
                    try { await fs.unlink(file.path); } catch {}
                } else {
                    profile.about.resumeUrl = `/uploads/${file.filename}`;
                }
            }
        }

        // Update textual fields if provided
        if (hero_subtitle !== undefined) profile.hero.subtitle = hero_subtitle;
        if (hero_title !== undefined) profile.hero.title = hero_title;
        if (hero_description !== undefined) profile.hero.description = hero_description;

        if (about_title !== undefined) profile.about.title = about_title;
        if (about_bio !== undefined) profile.about.bio = about_bio;

        if (about_experience) {
            try {
                profile.about.experience = JSON.parse(about_experience);
            } catch (err) {
                console.error("Error parsing experience:", err);
            }
        }

        if (about_education) {
            try {
                profile.about.education = JSON.parse(about_education);
            } catch (err) {
                console.error("Error parsing education:", err);
            }
        }

        if (about_capabilities) {
            profile.about.capabilities = about_capabilities.split(',').map(s => s.trim()).filter(Boolean);
        }

        if (about_software) {
            try {
                profile.about.software = JSON.parse(about_software);
            } catch (err) {
                console.error("Error parsing software:", err);
            }
        }

        if (contact_email !== undefined) profile.contact.email = contact_email;
        if (contact_phone !== undefined) profile.contact.phone = contact_phone;
        if (contact_location !== undefined) profile.contact.location = contact_location;

        if (contact_socials) {
            try {
                profile.contact.socials = JSON.parse(contact_socials);
            } catch (err) {
                console.error("Error parsing socials:", err);
            }
        }

        await saveProfile(profile);
        res.json(profile);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to update profile details" });
    }
});

// Start listening
app.listen(PORT, () => {
    console.log(`🚀 Portfolio backend server running at http://localhost:${PORT}`);
});
