import express from 'express';
import multer  from 'multer';
import cors    from 'cors';
import dotenv  from 'dotenv';
import path    from 'path';
import fs      from 'fs/promises';
import { v2 as cloudinary } from 'cloudinary';
import {
    getProjects, saveProjects,
    getProfile,  saveProfile,
    getSiteContent, saveSiteContent
} from './db.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3000;

/* ─── Middleware ─── */
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));
app.use('/uploads', express.static('public/uploads'));

/* ─── Multer local storage ─── */
const storage = multer.diskStorage({
    destination: async (_req, _file, cb) => {
        const dir = path.join(process.cwd(), 'public', 'uploads');
        await fs.mkdir(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (_req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + unique + path.extname(file.originalname));
    }
});

const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } });

/* Profile fields: hero_portrait, about_portrait, resume_pdf */
const profileUpload = upload.fields([
    { name: 'hero_portrait',   maxCount: 1 },
    { name: 'about_portrait',  maxCount: 1 },
    { name: 'resume_pdf',      maxCount: 1 }
]);

/* ─── Cloudinary config ─── */
const cloudinaryReady =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY    &&
    process.env.CLOUDINARY_API_SECRET;

if (cloudinaryReady) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key:    process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('☁️  Cloudinary configured.');
} else {
    console.log('📁  Using local uploads (no Cloudinary credentials).');
}

/* ─── Helper: upload file (local or cloud) ─── */
const uploadFile = async (file, resourceType = 'image') => {
    if (cloudinaryReady) {
        try {
            const result = await cloudinary.uploader.upload(file.path, {
                folder:        'graphic_design_portfolio',
                resource_type: resourceType
            });
            try { await fs.unlink(file.path); } catch {}
            return result.secure_url;
        } catch (err) {
            console.warn('Cloudinary upload warning (falling back to local storage):', err.message || err);
        }
    }
    return `/uploads/${file.filename}`;
};

/* ─── Helper: delete local file ─── */
const deleteLocal = async (imgUrl) => {
    if (imgUrl && imgUrl.startsWith('/uploads/')) {
        const fp = path.join(process.cwd(), 'public', imgUrl);
        try { await fs.unlink(fp); } catch {}
    }
};

/* ═══════════════════════════════════════════════════════════
   PROJECTS  —  CRUD
   ═══════════════════════════════════════════════════════════ */

/* GET /api/projects */
app.get('/api/projects', async (_req, res) => {
    try { res.json(await getProjects()); }
    catch { res.status(500).json({ error: 'Failed to fetch projects' }); }
});

/* POST /api/projects  — create */
app.post('/api/projects', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

        const {
            title, category, year, duration, tools, client,
            focus, output, concept, swatches, typography
        } = req.body;

        const imgUrl    = await uploadFile(req.file);
        const swatchArr = swatches ? swatches.split(',').map(s => s.trim()) : ['#0044FF','#C85A32','#FAF9F5','#141518'];
        let   typoArr   = [];
        try   { typoArr = typography ? JSON.parse(typography) : []; } catch {}

        const slug = (title || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const id   = slug + '-' + Date.now().toString().slice(-6);

        const project = {
            id, category, title,
            img: imgUrl,
            year: year || '2026',
            duration: duration || '3 Weeks',
            tools: tools || 'Illustrator, Photoshop',
            client: client || 'Personal Concept',
            focus: focus || 'Visual Composition',
            output: output || 'Digital Showcase',
            concept: concept || '',
            swatches: swatchArr,
            typography: typoArr
        };

        const list = await getProjects();
        list.push(project);
        await saveProjects(list);
        res.status(201).json(project);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

/* PUT /api/projects/:id  — update */
app.put('/api/projects/:id', upload.single('image'), async (req, res) => {
    try {
        const list = await getProjects();
        const idx  = list.findIndex(p => p.id === req.params.id);
        if (idx === -1) return res.status(404).json({ error: 'Project not found' });

        const p = list[idx];
        const { title, category, year, duration, tools, client, focus, output, concept, swatches, typography } = req.body;

        let imgUrl = p.img;
        if (req.file) {
            await deleteLocal(p.img);
            imgUrl = await uploadFile(req.file);
        }

        const swatchArr = swatches ? swatches.split(',').map(s => s.trim()) : p.swatches;
        let   typoArr   = p.typography;
        try   { if (typography) typoArr = JSON.parse(typography); } catch {}

        list[idx] = {
            ...p,
            title:    title    ?? p.title,
            category: category ?? p.category,
            year:     year     ?? p.year,
            duration: duration ?? p.duration,
            tools:    tools    ?? p.tools,
            client:   client   ?? p.client,
            focus:    focus    ?? p.focus,
            output:   output   ?? p.output,
            concept:  concept  !== undefined ? concept : p.concept,
            img: imgUrl,
            swatches: swatchArr,
            typography: typoArr
        };

        await saveProjects(list);
        res.json(list[idx]);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

/* DELETE /api/projects/:id */
app.delete('/api/projects/:id', async (req, res) => {
    try {
        const list = await getProjects();
        const item = list.find(p => p.id === req.params.id);
        if (!item) return res.status(404).json({ error: 'Project not found' });

        await deleteLocal(item.img);
        await saveProjects(list.filter(p => p.id !== req.params.id));
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

/* ═══════════════════════════════════════════════════════════
   PROFILE  —  GET / PUT
   ═══════════════════════════════════════════════════════════ */

/* GET /api/profile */
app.get('/api/profile', async (_req, res) => {
    try { res.json(await getProfile()); }
    catch { res.status(500).json({ error: 'Failed to fetch profile' }); }
});

/* PUT /api/profile */
app.put('/api/profile', profileUpload, async (req, res) => {
    try {
        const profile = await getProfile();
        const b = req.body;

        /* ── File uploads ── */
        if (req.files?.hero_portrait) {
            const old = profile.hero?.portrait;
            if (old?.startsWith('/uploads/')) await deleteLocal(old);
            profile.hero.portrait = await uploadFile(req.files.hero_portrait[0]);
        }
        if (req.files?.about_portrait) {
            const old = profile.about?.portrait;
            if (old?.startsWith('/uploads/')) await deleteLocal(old);
            profile.about.portrait = await uploadFile(req.files.about_portrait[0]);
        }
        if (req.files?.resume_pdf) {
            profile.about.resumeUrl = await uploadFile(req.files.resume_pdf[0], 'raw');
        }

        /* ── Hero text fields ── */
        if (!profile.hero) profile.hero = {};
        const heroFields = ['badge','name','title','description','ctaPrimary','ctaSecondary'];
        heroFields.forEach(f => { if (b[`hero_${f}`] !== undefined) profile.hero[f] = b[`hero_${f}`]; });

        /* ── About text fields ── */
        if (!profile.about) profile.about = {};
        const aboutFields = ['sectionBadge','title','titleItalic','bio','resumeLabel'];
        aboutFields.forEach(f => { if (b[`about_${f}`] !== undefined) profile.about[f] = b[`about_${f}`]; });

        if (b.about_experience)   { try { profile.about.experience   = JSON.parse(b.about_experience); }   catch {} }
        if (b.about_education)    { try { profile.about.education    = JSON.parse(b.about_education); }    catch {} }
        if (b.about_software)     { try { profile.about.software     = JSON.parse(b.about_software); }     catch {} }
        if (b.about_capabilities) {
            profile.about.capabilities = b.about_capabilities.split(',').map(s => s.trim()).filter(Boolean);
        }

        /* ── Contact text fields ── */
        if (!profile.contact) profile.contact = {};
        const contactFields = ['sectionBadge','title','titleItalic','description','email','phone','location'];
        contactFields.forEach(f => { if (b[`contact_${f}`] !== undefined) profile.contact[f] = b[`contact_${f}`]; });

        if (b.contact_socials) { try { profile.contact.socials = JSON.parse(b.contact_socials); } catch {} }

        await saveProfile(profile);
        res.json(profile);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

/* ═══════════════════════════════════════════════════════════
   SITE CONTENT  —  GET / PUT
   (nav, footer, projects section, form categories, etc.)
   ═══════════════════════════════════════════════════════════ */

/* GET /api/site */
app.get('/api/site', async (_req, res) => {
    try { res.json(await getSiteContent()); }
    catch { res.status(500).json({ error: 'Failed to fetch site content' }); }
});

/* PUT /api/site */
app.put('/api/site', async (req, res) => {
    try {
        const site = await getSiteContent();
        const b    = req.body;

        if (b.logo !== undefined)    site.logo   = b.logo;
        if (b.navCta !== undefined)  site.navCta = b.navCta;
        if (b.nav)     { try { site.nav     = JSON.parse(b.nav);     } catch {} }
        if (b.footer)  { try { site.footer  = JSON.parse(b.footer);  } catch {} }
        if (b.projects){ try { site.projects = JSON.parse(b.projects);} catch {} }
        if (b.contactForm){ try { site.contactForm = JSON.parse(b.contactForm); } catch {} }

        /* Allow updating individual nested fields */
        if (b.footer_copyright   !== undefined && site.footer) site.footer.copyright   = b.footer_copyright;
        if (b.footer_thankYouText!== undefined && site.footer) site.footer.thankYouText = b.footer_thankYouText;

        if (b.projects_sectionBadge !== undefined && site.projects) site.projects.sectionBadge = b.projects_sectionBadge;
        if (b.projects_title        !== undefined && site.projects) site.projects.title        = b.projects_title;
        if (b.projects_titleItalic  !== undefined && site.projects) site.projects.titleItalic  = b.projects_titleItalic;
        if (b.projects_categories)  { try { site.projects.categories = JSON.parse(b.projects_categories); } catch {} }
        if (b.contactForm_categories){ try { site.contactForm.categories = JSON.parse(b.contactForm_categories); } catch {} }

        await saveSiteContent(site);
        res.json(site);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update site content' });
    }
});

/* ─── Start ─── */
app.listen(PORT, () => {
    console.log(`🚀 Portfolio server running at http://localhost:${PORT}`);
});
