import express from 'express';
import { db } from '../db/index.js';
import { requireAdmin } from '../middleware/auth.js';
import { requireSameOrigin } from '../middleware/security.js';
import { isValidEmail } from '../utils/validation.js';

const router = express.Router();
router.use(requireAdmin, requireSameOrigin);

const isRecord = (value) => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const boundedJsonRecord = (value, maxBytes = 200000) => {
  if (!isRecord(value)) return false;
  try { return Buffer.byteLength(JSON.stringify(value), 'utf8') <= maxBytes; } catch { return false; }
};

const aboutKeys = new Set([
  'headline', 'subheadline', 'biography_paragraph_1', 'biography_paragraph_2',
  'experiences', 'capabilities', 'tools', 'availability',
]);

const validateAbout = (value) => {
  if (!boundedJsonRecord(value, 200000)) return { error: 'About content must be a valid object under 200 KB.' };
  if (Object.keys(value).some((key) => !aboutKeys.has(key))) return { error: 'About content contains unsupported fields.' };

  const textFields = ['headline', 'subheadline', 'biography_paragraph_1', 'biography_paragraph_2', 'availability'];
  for (const field of textFields) {
    if (value[field] !== undefined && (typeof value[field] !== 'string' || value[field].length > 2000)) {
      return { error: `${field} must be text under 2,000 characters.` };
    }
  }

  if (value.experiences !== undefined) {
    if (!Array.isArray(value.experiences) || value.experiences.length > 20) return { error: 'Add no more than 20 experience entries.' };
    const ids = new Set();
    for (const item of value.experiences) {
      if (!isRecord(item) || Object.keys(item).some((key) => !['id', 'role', 'company', 'period', 'description'].includes(key))) return { error: 'An experience entry contains unsupported fields.' };
      if (typeof item.id !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(item.id) || ids.has(item.id)) return { error: 'Experience identifiers must be valid and unique.' };
      if (typeof item.role !== 'string' || !item.role.trim() || item.role.length > 120 || typeof item.company !== 'string' || !item.company.trim() || item.company.length > 120) return { error: 'Each experience needs a company and role under 120 characters.' };
      if (item.period !== undefined && (typeof item.period !== 'string' || item.period.length > 80)) return { error: 'Experience periods must be text under 80 characters.' };
      if (item.description !== undefined && (typeof item.description !== 'string' || item.description.length > 500)) return { error: 'Experience descriptions must be text under 500 characters.' };
      ids.add(item.id);
    }
  }

  if (value.capabilities !== undefined) {
    if (!Array.isArray(value.capabilities) || value.capabilities.length > 20) return { error: 'Add no more than 20 capability groups.' };
    for (const group of value.capabilities) {
      if (!isRecord(group) || Object.keys(group).some((key) => !['category', 'skills'].includes(key))) return { error: 'A capability group contains unsupported fields.' };
      if (typeof group.category !== 'string' || !group.category.trim() || group.category.length > 100 || !Array.isArray(group.skills) || group.skills.length > 30 || group.skills.some((skill) => typeof skill !== 'string' || !skill.trim() || skill.length > 120)) return { error: 'Capability groups need a category and up to 30 short skill labels.' };
    }
  }

  if (value.tools !== undefined && (!Array.isArray(value.tools) || value.tools.length > 30 || value.tools.some((tool) => typeof tool !== 'string' || !tool.trim() || tool.length > 120))) {
    return { error: 'Skills and software must be a list of up to 30 short labels.' };
  }
  return { value };
};

const supportedAbout = (value) => {
  if (!isRecord(value)) return null;
  const result = Object.fromEntries(['headline', 'subheadline', 'biography_paragraph_1', 'biography_paragraph_2', 'availability']
    .filter((key) => typeof value[key] === 'string')
    .map((key) => [key, value[key]]));
  if (Array.isArray(value.experiences)) {
    result.experiences = value.experiences.filter(isRecord).slice(0, 20).map((item) => ({
      id: typeof item.id === 'string' ? item.id : '',
      role: typeof item.role === 'string' ? item.role : '',
      company: typeof item.company === 'string' ? item.company : '',
      period: typeof item.period === 'string' ? item.period : '',
      description: typeof item.description === 'string' ? item.description : '',
    }));
  }
  if (Array.isArray(value.capabilities)) {
    result.capabilities = value.capabilities.filter(isRecord).slice(0, 20).map((group) => ({
      category: typeof group.category === 'string' ? group.category : '',
      skills: Array.isArray(group.skills) ? group.skills.filter((skill) => typeof skill === 'string').slice(0, 30) : [],
    }));
  }
  if (Array.isArray(value.tools)) result.tools = value.tools.filter((tool) => typeof tool === 'string').slice(0, 30);
  return result;
};

const validateCategories = (value) => {
  if (!Array.isArray(value) || value.length < 1 || value.length > 100) return 'Keep between 1 and 100 categories.';
  const ids = new Set();
  const slugs = new Set();
  for (const category of value) {
    if (!isRecord(category) || typeof category.id !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(category.id)) return 'Each category needs a valid identifier.';
    const name = typeof category.name === 'string' ? category.name.trim() : '';
    const slug = typeof category.slug === 'string' ? category.slug.trim() : '';
    if (!name || name.length > 100 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100) return 'Category names and URL slugs are required and must be valid.';
    if (category.description !== undefined && (typeof category.description !== 'string' || category.description.length > 1000)) return 'Category descriptions must be 1,000 characters or less.';
    if (!Number.isInteger(category.sort_order) || category.sort_order < 0 || category.sort_order > 10000) return 'Category order must be a whole number from 0 to 10,000.';
    if (ids.has(category.id) || slugs.has(slug)) return 'Category identifiers and URL slugs must be unique.';
    ids.add(category.id);
    slugs.add(slug);
  }
  return null;
};

const settingsKeys = new Set([
  'site_name', 'hero_eyebrow', 'hero_headline', 'hero_description', 'email', 'phone',
  'linkedin_url', 'behance_url', 'resume_url',
  'availability', 'footer_text', 'seo_title', 'seo_description', 'og_image',
]);

const defaultSiteSettings = {
  site_name: 'SANJAY',
  hero_eyebrow: "Hi, I'm Sanjay.",
  hero_headline: 'GRAPHIC DESIGNER',
  hero_description: 'I create social media posters and clear user interfaces for brands and digital products.',
  email: 'sanjaymurugesan23@gmail.com',
  phone: '+91 7010948452',
  linkedin_url: 'https://www.linkedin.com/in/sanjaym23',
  behance_url: 'https://www.behance.net/sanjayuiuxgd',
  resume_url: '/cv-sanjay.pdf',
  availability: 'Available for design work.',
  footer_text: '© 2026 SANJAY. All rights reserved.',
  seo_title: 'Sanjay — Graphic Designer',
  seo_description: 'Portfolio of Sanjay, graphic designer focused on social media design and user interface design.',
  og_image: '',
};

const validateSettings = (value) => {
  if (!boundedJsonRecord(value, 50000)) return 'Site settings must be a valid object under 50 KB.';
  if (Object.keys(value).some((key) => !settingsKeys.has(key))) return 'Site settings contain unsupported fields.';
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry !== 'string' || entry.length > (key.includes('description') ? 5000 : 2048)) return `The ${key} setting has an invalid value.`;
    if (key.endsWith('_url') || key === 'og_image') {
      if (!entry) continue;
      if (entry.startsWith('/') && !entry.startsWith('//') && !entry.includes('..') && !entry.includes('\\')) continue;
      try {
        const url = new URL(entry);
        if (url.protocol === 'https:' && !url.username && !url.password) continue;
      } catch { /* returned below */ }
      return `${key} must be an HTTPS URL or a local asset path.`;
    }
    if (key === 'email' && entry && !isValidEmail(entry)) return 'Enter a valid contact email.';
    if (key === 'phone' && entry && !/^\+?[0-9(). -]{5,30}$/.test(entry)) return 'Enter a valid phone number using digits, spaces, and basic phone punctuation.';
  }
  return null;
};

router.get('/categories', async (req, res) => {
  try { return res.json({ success: true, data: await db.getCategories() }); }
  catch { return res.status(500).json({ success: false, error: 'Could not load categories.' }); }
});

router.put('/categories', async (req, res) => {
  const message = validateCategories(req.body?.categories);
  if (message) return res.status(400).json({ success: false, error: message });
  try {
    const saved = await db.saveCategories(req.body.categories);
    await db.logActivity('Update Categories', `Updated ${saved.length} categories.`);
    return res.json({ success: true, data: saved });
  } catch (error) {
    if (error.code === 'CATEGORY_IN_USE') return res.status(409).json({ success: false, error: error.message });
    if (error.code === '23505') return res.status(409).json({ success: false, error: 'Category names and slugs must be unique.' });
    return res.status(500).json({ success: false, error: 'Could not save categories.' });
  }
});

router.get('/about', async (req, res) => {
  try { return res.json({ success: true, data: supportedAbout(await db.getSettings('about_content')) }); }
  catch { return res.status(500).json({ success: false, error: 'Could not load about content.' }); }
});

router.put('/about', async (req, res) => {
  const checked = validateAbout(req.body);
  if (checked.error) return res.status(400).json({ success: false, error: checked.error });
  try {
    const updated = await db.setSettings('about_content', checked.value);
    await db.logActivity('Update About', 'Updated profile content.');
    return res.json({ success: true, data: updated });
  } catch { return res.status(500).json({ success: false, error: 'Could not save about content.' }); }
});

router.get('/settings', async (req, res) => {
  try {
    const settings = await db.getSettings('site_settings') || {};
    const supportedSettings = Object.fromEntries([...settingsKeys]
      .filter((key) => typeof settings[key] === 'string')
      .map((key) => [key, settings[key]]));
    return res.json({ success: true, data: { ...defaultSiteSettings, ...supportedSettings } });
  }
  catch { return res.status(500).json({ success: false, error: 'Could not load site settings.' }); }
});

router.put('/settings', async (req, res) => {
  const message = validateSettings(req.body);
  if (message) return res.status(400).json({ success: false, error: message });
  try {
    const updated = await db.setSettings('site_settings', req.body);
    await db.logActivity('Update Settings', 'Updated site settings.');
    return res.json({ success: true, data: updated });
  } catch { return res.status(500).json({ success: false, error: 'Could not save site settings.' }); }
});

router.get('/activity', async (req, res) => {
  const limit = req.query.limit === undefined ? 50 : Number(req.query.limit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) return res.status(400).json({ success: false, error: 'Activity limit must be between 1 and 100.' });
  try { return res.json({ success: true, data: await db.getActivityLogs(limit) }); }
  catch { return res.status(500).json({ success: false, error: 'Could not load activity.' }); }
});

router.get('/contact-messages', async (req, res) => {
  const limit = req.query.limit === undefined ? 100 : Number(req.query.limit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 500) return res.status(400).json({ success: false, error: 'Message limit must be between 1 and 500.' });
  try { return res.json({ success: true, data: await db.getContactMessages(limit) }); }
  catch { return res.status(500).json({ success: false, error: 'Could not load inquiries.' }); }
});

router.patch('/contact-messages/:id', async (req, res) => {
  if (typeof req.body?.read !== 'boolean') return res.status(400).json({ success: false, error: 'Read must be true or false.' });
  try {
    const message = await db.updateContactMessage(req.params.id, req.body.read);
    if (!message) return res.status(404).json({ success: false, error: 'Inquiry not found.' });
    await db.logActivity('Update Inquiry', `Updated inquiry ${message.id}.`);
    return res.json({ success: true, data: message });
  } catch { return res.status(500).json({ success: false, error: 'Could not update inquiry.' }); }
});

router.delete('/contact-messages/:id', async (req, res) => {
  try {
    const deleted = await db.deleteContactMessage(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Inquiry not found.' });
    await db.logActivity('Delete Inquiry', `Deleted inquiry ${req.params.id}.`);
    return res.json({ success: true });
  } catch { return res.status(500).json({ success: false, error: 'Could not delete inquiry.' }); }
});

export default router;
