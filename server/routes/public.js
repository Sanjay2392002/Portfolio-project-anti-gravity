import express from 'express';
import { db } from '../db/index.js';
import { createRateLimiter, requireSameOrigin } from '../middleware/security.js';
import { isValidEmail } from '../utils/validation.js';

const router = express.Router();
const contactRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many messages were sent. Please try again later.',
});

const textSetting = (settings, key, fallback, maxLength = 2048) =>
  typeof settings?.[key] === 'string' && settings[key].length <= maxLength ? settings[key] : fallback;

const secureLinkSetting = (settings, key, fallback, allowLocal = false) => {
  const value = settings?.[key];
  if (typeof value !== 'string' || /[\u0000-\u001f\u007f]/.test(value)) return fallback;
  if (allowLocal && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') && !value.split('/').includes('..')) return value;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.toString() : fallback;
  } catch {
    return fallback;
  }
};

// Always deliver fresh database content to public visitors without stale cache
router.use((req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
});

router.get('/selected-works', async (req, res) => {
  try {
    return res.json({ success: true, data: await db.getSelectedWorks() });
  } catch {
    return res.status(500).json({ success: false, error: 'Could not load selected work.' });
  }
});

// GET /api/projects
router.get('/projects', async (req, res) => {
  try {
    const projects = await db.getProjects(false);
    res.json({ success: true, data: projects });
  } catch (err) {
    console.error('[API] Failed to fetch published projects.', { code: err.code || 'UNHANDLED' });
    res.status(500).json({ success: false, error: 'Failed to fetch projects' });
  }
});

// GET /api/projects/:slug
router.get('/projects/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const project = await db.getProjectBySlug(slug, false);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    res.json({ success: true, data: project });
  } catch (err) {
    console.error('[API] Failed to fetch project detail.', { code: err.code || 'UNHANDLED' });
    res.status(500).json({ success: false, error: 'Failed to fetch project' });
  }
});

// GET /api/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await db.getCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    console.error('[API] Failed to fetch categories.', { code: err.code || 'UNHANDLED' });
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
});

// GET /api/about
router.get('/about', async (req, res) => {
  try {
    const about = await db.getSettings('about_content');
    const publicAbout = about && typeof about === 'object' && !Array.isArray(about) ? {
      headline: typeof about.headline === 'string' ? about.headline : '',
      subheadline: typeof about.subheadline === 'string' ? about.subheadline : '',
      biography_paragraph_1: typeof about.biography_paragraph_1 === 'string' ? about.biography_paragraph_1 : '',
      biography_paragraph_2: typeof about.biography_paragraph_2 === 'string' ? about.biography_paragraph_2 : '',
      experiences: Array.isArray(about.experiences) ? about.experiences.filter((item) => item && typeof item === 'object' && !Array.isArray(item)).slice(0, 20).map((item) => ({
        id: typeof item.id === 'string' ? item.id : '',
        role: typeof item.role === 'string' ? item.role : '',
        company: typeof item.company === 'string' ? item.company : '',
        period: typeof item.period === 'string' ? item.period : '',
        description: typeof item.description === 'string' ? item.description : '',
      })) : [],
      capabilities: Array.isArray(about.capabilities) ? about.capabilities.filter((group) => group && typeof group === 'object' && !Array.isArray(group)).slice(0, 20).map((group) => ({
        category: typeof group.category === 'string' ? group.category : '',
        skills: Array.isArray(group.skills) ? group.skills.filter((skill) => typeof skill === 'string').slice(0, 30) : [],
      })) : [],
      tools: Array.isArray(about.tools) ? about.tools.filter((tool) => typeof tool === 'string').slice(0, 30) : [],
      availability: typeof about.availability === 'string' ? about.availability : '',
    } : null;
    res.json({ success: true, data: publicAbout });
  } catch (err) {
    console.error('[API] Failed to fetch about information.', { code: err.code || 'UNHANDLED' });
    res.status(500).json({ success: false, error: 'Failed to fetch about information' });
  }
});

// GET /api/settings/public
router.get('/settings/public', async (req, res) => {
  try {
    const settings = await db.getSettings('site_settings');
    const resumeFile = await db.getMeta('resume_file');
    const resumeSourceUrl = resumeFile?.url || resumeFile?.download_url || settings?.resume_url;
    const versionedResumeDownload = typeof resumeSourceUrl === 'string' && resumeSourceUrl.includes('/raw/upload/')
      ? resumeSourceUrl.replace(/\/raw\/upload\/(?:fl_attachment(?::[^/]*)?\/)?/, '/raw/upload/fl_attachment:Sanjay_M_Resume/')
      : resumeSourceUrl;
    const publicSettings = {
      site_name: textSetting(settings, 'site_name', 'SANJAY', 100),
      hero_eyebrow: textSetting(settings, 'hero_eyebrow', "Hi, I'm Sanjay.", 200),
      hero_headline: textSetting(settings, 'hero_headline', 'GRAPHIC DESIGNER', 500),
      hero_description: textSetting(settings, 'hero_description', 'I create social media posters and clear user interfaces for brands and digital products.', 5000),
      email: isValidEmail(settings?.email) ? settings.email : 'sanjaymurugesan23@gmail.com',
      phone: typeof settings?.phone === 'string' && /^\+?[0-9(). -]{5,30}$/.test(settings.phone) ? settings.phone : '+91 7010948452',
      linkedin_url: secureLinkSetting(settings, 'linkedin_url', 'https://www.linkedin.com/in/sanjaym23'),
      behance_url: secureLinkSetting(settings, 'behance_url', 'https://www.behance.net/sanjayuiuxgd'),
      resume_url: secureLinkSetting(settings, 'resume_url', '', true),
      resume_download_url: secureLinkSetting({ download_url: versionedResumeDownload }, 'download_url', secureLinkSetting(settings, 'resume_url', '', true), true),
      availability: textSetting(settings, 'availability', 'Available for design work.', 500),
      footer_text: textSetting(settings, 'footer_text', '© 2026 SANJAY. All rights reserved.', 500),
      seo_title: textSetting(settings, 'seo_title', 'Sanjay — Graphic Designer', 255),
      seo_description: textSetting(settings, 'seo_description', 'Portfolio of Sanjay, graphic designer focused on social media design and user interface design.', 5000),
      og_image: secureLinkSetting(settings, 'og_image', '', true),
    };
    res.json({ success: true, data: publicSettings });
  } catch (err) {
    console.error('[API] Failed to fetch public settings.', { code: err.code || 'UNHANDLED' });
    res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
});

// POST /api/contact
router.post('/contact', contactRateLimit, async (req, res) => {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    if (!name || !email || !message || name.length > 120 || message.length > 5000 || !isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'Please provide a valid name, email, and message.' });
    }

    let saved = null;
    try {
      saved = await db.createContactMessage({ name, email, message });
      await db.logActivity('New Contact Inquiry', `Inquiry from ${name} (${email})`);
    } catch (saveErr) {
      console.warn('[API] Notice: could not persist inquiry to database:', saveErr.message);
    }

    res.json({
      success: true,
      message: "Thank you for reaching out! I'll get back to you shortly.",
      data: saved || { name, email, message, created_at: new Date().toISOString() },
    });
  } catch (err) {
    console.error('[API] Failed to handle contact form.', { code: err.code || 'UNHANDLED' });
    res.status(500).json({ success: false, error: 'Failed to send message.' });
  }
});

export default router;
