import express from 'express';
import multer  from 'multer';
import cors    from 'cors';
import dotenv  from 'dotenv';
import path    from 'path';
import fs      from 'fs/promises';
import crypto  from 'crypto';
import { v2 as cloudinary } from 'cloudinary';
import {
    getProjects, saveProjects,
    getProfile,  saveProfile,
    getSiteContent, saveSiteContent,
    connectDB, getSections
} from './db.js';
import { User, Section, Submission, Category, Service, Experience } from './models.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();
connectDB();

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' 
    ? crypto.randomBytes(32).toString('hex') 
    : 'devsecret123');


const app  = express();
const PORT = process.env.PORT || 3000;

/* ─── Middleware ─── */
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static('public/uploads'));

// Serve Admin Panel (Production)
app.use('/admin', express.static(path.join(process.cwd(), 'admin', 'dist')));
app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'admin', 'dist', 'index.html'));
});

// Serve Main Portfolio
app.use(express.static(process.cwd()));
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'index.html'));
});

/* ─── Multer local storage ─── */
const storage = multer.diskStorage({
    destination: async (_req, _file, cb) => {
        const isVercel = !!process.env.VERCEL;
        const dir = isVercel ? '/tmp' : path.join(process.cwd(), 'public', 'uploads');
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

/* ─── JWT Middleware ─── */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

/* ═══════════════════════════════════════════════════════════
   AUTH  —  Login
   ═══════════════════════════════════════════════════════════ */
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, username });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

/* ═══════════════════════════════════════════════════════════
   SECTIONS  —  CRUD
   ═══════════════════════════════════════════════════════════ */
app.get('/api/sections', async (_req, res) => {
    try { res.json(await getSections()); }
    catch { res.status(500).json({ error: 'Failed to fetch sections' }); }
});

app.post('/api/sections', authenticateToken, async (req, res) => {
    try {
        const section = await Section.create(req.body);
        res.status(201).json(section);
    } catch (e) {
        res.status(500).json({ error: 'Failed to create section' });
    }
});

app.put('/api/sections/:id', authenticateToken, async (req, res) => {
    try {
        const section = await Section.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(section);
    } catch (e) {
        res.status(500).json({ error: 'Failed to update section' });
    }
});

app.delete('/api/sections/:id', authenticateToken, async (req, res) => {
    try {
        await Section.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to delete section' });
    }
});

/* ═══════════════════════════════════════════════════════════
   PROJECTS  —  CRUD
   ═══════════════════════════════════════════════════════════ */

/* GET /api/projects */
app.get('/api/projects', async (_req, res) => {
    try { res.json(await getProjects()); }
    catch { res.status(500).json({ error: 'Failed to fetch projects' }); }
});

/* POST /api/projects  — create */
app.post('/api/projects', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

        const {
            title, category, year, duration, tools, client,
            focus, output, concept, swatches, typography, isFeatured
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
            typography: typoArr,
            isFeatured: isFeatured === 'true' || isFeatured === true
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
app.put('/api/projects/:id', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const list = await getProjects();
        const idx  = list.findIndex(p => p.id === req.params.id);
        if (idx === -1) return res.status(404).json({ error: 'Project not found' });

        const p = list[idx];
        const { title, category, year, duration, tools, client, focus, output, concept, swatches, typography, isFeatured } = req.body;

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
            typography: typoArr,
            isFeatured: isFeatured !== undefined ? (isFeatured === 'true' || isFeatured === true) : p.isFeatured
        };

        await saveProjects(list);
        res.json(list[idx]);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

/* DELETE /api/projects/:id */
app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
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
    try {
        const profile = await getProfile();
        const experiences = await Experience.find({ type: 'experience' }).sort({ order: 1 });
        const education = await Experience.find({ type: 'education' }).sort({ order: 1 });
        const services = await Service.find().sort({ order: 1 });
        
        if (!profile.about) profile.about = {};
        profile.about.experience = experiences;
        profile.about.education = education;
        profile.about.services = services;
        
        res.json(profile);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

/* PUT /api/profile */
app.put('/api/profile', authenticateToken, profileUpload, async (req, res) => {
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
        if (b.about_services)     { try { profile.about.services     = JSON.parse(b.about_services); }     catch {} }
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
    try {
        const site = await getSiteContent();
        const cats = await Category.find().sort({ order: 1 });
        if (!site.projects) site.projects = {};
        site.projects.categories = cats.map(c => c.name);
        res.json(site);
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to fetch site content' });
    }
});

/* PUT /api/site */
app.put('/api/site', authenticateToken, async (req, res) => {
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

/* ═══════════════════════════════════════════════════════════
   CATEGORIES  —  CRUD
   ═══════════════════════════════════════════════════════════ */
app.get('/api/categories', async (_req, res) => {
    try {
        const cats = await Category.find().sort({ order: 1 });
        res.json(cats);
    } catch {
        res.status(500).json({ error: 'Failed to fetch categories.' });
    }
});

app.post('/api/categories', authenticateToken, async (req, res) => {
    try {
        const cat = await Category.create(req.body);
        res.status(201).json(cat);
    } catch {
        res.status(500).json({ error: 'Failed to create category.' });
    }
});

app.put('/api/categories/:id', authenticateToken, async (req, res) => {
    try {
        const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(cat);
    } catch {
        res.status(500).json({ error: 'Failed to update category.' });
    }
});

app.delete('/api/categories/:id', authenticateToken, async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch {
        res.status(500).json({ error: 'Failed to delete category.' });
    }
});

/* ═══════════════════════════════════════════════════════════
   SERVICES  —  CRUD
   ═══════════════════════════════════════════════════════════ */
app.get('/api/services', async (_req, res) => {
    try {
        const services = await Service.find().sort({ order: 1 });
        res.json(services);
    } catch {
        res.status(500).json({ error: 'Failed to fetch services.' });
    }
});

app.post('/api/services', authenticateToken, async (req, res) => {
    try {
        const service = await Service.create(req.body);
        res.status(201).json(service);
    } catch {
        res.status(500).json({ error: 'Failed to create service.' });
    }
});

app.put('/api/services/:id', authenticateToken, async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(service);
    } catch {
        res.status(500).json({ error: 'Failed to update service.' });
    }
});

app.delete('/api/services/:id', authenticateToken, async (req, res) => {
    try {
        await Service.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch {
        res.status(500).json({ error: 'Failed to delete service.' });
    }
});

/* ═══════════════════════════════════════════════════════════
   EXPERIENCE  —  CRUD
   ═══════════════════════════════════════════════════════════ */
app.get('/api/experience', async (_req, res) => {
    try {
        const items = await Experience.find().sort({ order: 1 });
        res.json(items);
    } catch {
        res.status(500).json({ error: 'Failed to fetch experience.' });
    }
});

app.post('/api/experience', authenticateToken, async (req, res) => {
    try {
        const item = await Experience.create(req.body);
        res.status(201).json(item);
    } catch {
        res.status(500).json({ error: 'Failed to create experience.' });
    }
});

app.put('/api/experience/:id', authenticateToken, async (req, res) => {
    try {
        const item = await Experience.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(item);
    } catch {
        res.status(500).json({ error: 'Failed to update experience.' });
    }
});

app.delete('/api/experience/:id', authenticateToken, async (req, res) => {
    try {
        await Experience.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch {
        res.status(500).json({ error: 'Failed to delete experience.' });
    }
});

/* ═══════════════════════════════════════════════════════════
   SUBMISSIONS  —  Contact Form Responses
   ═══════════════════════════════════════════════════════════ */
app.post('/api/contact', async (req, res) => {
    const { name, email, category, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required.' });
    }
    try {
        const sub = await Submission.create({ name, email, category, message });
        res.status(201).json(sub);
    } catch (e) {
        res.status(500).json({ error: 'Failed to save submission.' });
    }
});

app.get('/api/submissions', authenticateToken, async (_req, res) => {
    try {
        const subs = await Submission.find().sort({ createdAt: -1 });
        res.json(subs);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch submissions.' });
    }
});

app.delete('/api/submissions/:id', authenticateToken, async (req, res) => {
    try {
        await Submission.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to delete submission.' });
    }
});

/* ─── Start ─── */
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 Portfolio server running at http://localhost:${PORT}`);
    });
}

export default app;
