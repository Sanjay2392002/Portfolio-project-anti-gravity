import express from 'express';
import crypto from 'crypto';
import { db } from '../db/index.js';
import { requireAdmin } from '../middleware/auth.js';
import { requireSameOrigin } from '../middleware/security.js';

const router = express.Router();
router.use(requireAdmin, requireSameOrigin);

const projectFields = new Set(['title', 'slug', 'category_id', 'year', 'role', 'services', 'description', 'hero_image', 'status', 'featured', 'seo_title', 'seo_description', 'og_image', 'live_url', 'brand_accent_color']);
const blockTypes = new Set(['TEXT', 'IMAGE', 'FULL_BLEED_IMAGE', 'TWO_IMAGE', 'THREE_IMAGE', 'IMAGE_GRID', 'GALLERY', 'HORIZONTAL_GALLERY', 'VIDEO', 'QUOTE', 'TWO_COLUMN', 'THREE_COLUMN', 'PROJECT_METADATA', 'SPACER']);

const validAsset = (value) => {
  if (typeof value !== 'string' || value.length > 2048 || /[\u0000-\u001f\u007f]/.test(value)) return false;
  if (/^\/(assets|uploads|selected-works)\//.test(value) && !value.startsWith('//') && !value.includes('\\')) {
    try { return !decodeURIComponent(value).split('/').includes('..'); } catch { return false; }
  }
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
};

const validBlockContent = (value, depth = 0, budget = { nodes: 0 }) => {
  if (depth > 20 || ++budget.nodes > 5000) return false;
  if (Array.isArray(value)) return value.length <= 1000 && value.every((entry) => validBlockContent(entry, depth + 1, budget));
  if (!value || typeof value !== 'object') return true;
  for (const [key, entry] of Object.entries(value)) {
    if (key.toLowerCase() === 'html' || key === 'dangerouslySetInnerHTML') return false;
    if (['url', 'src', 'poster'].includes(key.toLowerCase()) && entry !== '' && entry !== null && !validAsset(entry)) return false;
    if (typeof entry === 'object' && entry !== null && !validBlockContent(entry, depth + 1, budget)) return false;
  }
  return true;
};

const validateProject = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'A project object is required.' };
  if (Object.keys(body).some((key) => key !== 'blocks' && !projectFields.has(key))) return { error: 'The project contains unsupported fields.' };
  const input = { ...body };
  for (const key of ['slug', 'year', 'role', 'description', 'seo_title', 'seo_description', 'live_url']) {
    if (input[key] !== undefined && input[key] !== null && typeof input[key] !== 'string') return { error: `The ${key.replace(/_/g, ' ')} must be text.` };
  }
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  if (!title || title.length > 255) return { error: 'A project title is required (maximum 255 characters).' };
  const slug = String(input.slug || title).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (!slug || slug.length > 255) return { error: 'Enter a valid project slug.' };
  const year = String(input.year ?? new Date().getFullYear()).trim();
  const role = String(input.role ?? 'Visual Designer').trim();
  const description = String(input.description ?? '').trim();
  if (year.length > 20 || !role || role.length > 255 || description.length > 20000) return { error: 'Project details exceed their allowed length.' };
  const status = input.status ?? 'draft';
  if (!['draft', 'published', 'archived'].includes(status)) return { error: 'Project status is invalid.' };
  if (input.featured !== undefined && typeof input.featured !== 'boolean') return { error: 'Featured must be true or false.' };
  const services = input.services ?? [];
  if (!Array.isArray(services) || services.length > 30 || services.some((service) => typeof service !== 'string' || service.trim().length > 100)) return { error: 'Services must be a list of up to 30 short labels.' };
  const heroImage = input.hero_image || '/assets/kings/kings-box-model.jpg';
  const ogImage = input.og_image || heroImage;
  if (!validAsset(heroImage) || !validAsset(ogImage)) return { error: 'Project images must use a site asset path or HTTPS URL.' };
  if (input.live_url) {
    try {
      const liveUrl = new URL(input.live_url);
      if (liveUrl.protocol !== 'https:' || liveUrl.username || liveUrl.password) return { error: 'Live project links must use HTTPS.' };
    } catch { return { error: 'Live project links must use HTTPS.' }; }
  }
  const accent = input.brand_accent_color ?? '#111111';
  if (typeof accent !== 'string' || !/^#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?$/.test(accent)) return { error: 'Brand accent must be a valid hex color.' };
  if (input.category_id !== undefined && input.category_id !== null && (typeof input.category_id !== 'string' || input.category_id.length > 64)) return { error: 'Project category is invalid.' };

  let blocks = null;
  if (Object.hasOwn(input, 'blocks')) {
    if (!Array.isArray(input.blocks) || input.blocks.length > 60) return { error: 'A project can contain up to 60 content blocks.' };
    blocks = [];
    for (const [index, block] of input.blocks.entries()) {
      if (!block || typeof block !== 'object' || Array.isArray(block) || !blockTypes.has(block.block_type)) return { error: `Content block ${index + 1} is invalid.` };
      if (!block.content || typeof block.content !== 'object' || Array.isArray(block.content) || JSON.stringify(block.content).length > 100000 || !validBlockContent(block.content)) return { error: `Content block ${index + 1} contains invalid content or an unsafe asset URL.` };
      blocks.push({ id: `blk_${crypto.randomUUID()}`, block_type: block.block_type, sort_order: index, content: block.content });
    }
  }

  const project = {
    title, slug, category_id: input.category_id || null, year, role,
    services: services.map((service) => service.trim()).filter(Boolean), description,
    hero_image: heroImage, status, featured: input.featured ?? false,
    seo_title: String(input.seo_title || title).trim().slice(0, 255),
    seo_description: String(input.seo_description || description).trim().slice(0, 5000),
    og_image: ogImage,
    live_url: input.live_url || '',
    brand_accent_color: accent,
  };
  return { project, blocks };
};

// GET /api/admin/projects
router.get('/', async (req, res) => {
  try {
    const projects = await db.getProjects(true);
    res.json({ success: true, data: projects });
  } catch {
    res.status(500).json({ success: false, error: 'Could not load projects.' });
  }
});

// GET /api/admin/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const project = await db.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    res.json({ success: true, data: project });
  } catch {
    res.status(500).json({ success: false, error: 'Could not load project.' });
  }
});

// POST /api/admin/projects
router.post('/', async (req, res) => {
  try {
    const validated = validateProject(req.body);
    if (validated.error) return res.status(400).json({ success: false, error: validated.error });
    const id = `prj_${crypto.randomUUID()}`;
    const existing = await db.getProjects(true);
    const maxSort = existing.reduce((max, p) => Math.max(max, p.sort_order || 0), 0);
    const projectData = {
      id,
      sort_order: maxSort + 1,
      ...validated.project,
    };
    const created = await db.createProject(projectData, validated.blocks || []);
    await db.logActivity('Create Project', `Created project ${created.id}.`);
    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    const status = err.code === '23505' || err.code === '23503' ? 409 : err.status || 500;
    return res.status(status).json({ success: false, error: status === 409 ? 'A project with this slug already exists or the selected category is invalid.' : status >= 500 ? 'Could not create project.' : err.message });
  }
});

// PUT /api/admin/projects/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.getProjectById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const validated = validateProject(req.body);
    if (validated.error) return res.status(400).json({ success: false, error: validated.error });
    const updated = await db.updateProject(id, validated.project, validated.blocks);
    await db.logActivity('Update Project', `Updated project ${id}.`);
    return res.json({ success: true, data: updated });
  } catch (err) {
    const status = err.code === '23505' || err.code === '23503' ? 409 : err.status || 500;
    return res.status(status).json({ success: false, error: status === 409 ? 'A project with this slug already exists or the selected category is invalid.' : status >= 500 ? 'Could not update project.' : err.message });
  }
});

// PUT /api/admin/projects/reorder
router.put('/reorder/all', async (req, res) => {
  try {
    const { orders } = req.body; // array of { id, sort_order }
    if (!Array.isArray(orders) || orders.length > 500 || orders.some((item) => !item || typeof item.id !== 'string' || !Number.isInteger(item.sort_order) || item.sort_order < 0)) {
      return res.status(400).json({ success: false, error: 'A valid ordered project list is required.' });
    }
    const ids = orders.map((item) => item.id);
    if (new Set(ids).size !== ids.length) return res.status(400).json({ success: false, error: 'Project identifiers must be unique.' });
    const current = await db.getProjects(true);
    if (current.length !== orders.length || current.some((project) => !ids.includes(project.id))) {
      return res.status(409).json({ success: false, error: 'The project list changed. Reload and try again.' });
    }
    const all = await db.reorderProjects(orders);
    await db.logActivity('Reorder Projects', `Reordered ${orders.length} projects.`);
    res.json({ success: true, data: all });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not reorder projects.' });
  }
});

// POST /api/admin/projects/:id/publish
router.post('/:id/publish', async (req, res) => {
  try {
    const updated = await db.updateProject(req.params.id, {
      status: 'published',
      published_at: new Date().toISOString(),
    });
    if (!updated) return res.status(404).json({ success: false, error: 'Project not found.' });
    await db.logActivity('Publish Project', `Published project ${updated.id}.`);
    res.json({ success: true, data: updated });
  } catch {
    res.status(500).json({ success: false, error: 'Could not publish project.' });
  }
});

// POST /api/admin/projects/:id/unpublish
router.post('/:id/unpublish', async (req, res) => {
  try {
    const updated = await db.updateProject(req.params.id, { status: 'draft' });
    if (!updated) return res.status(404).json({ success: false, error: 'Project not found.' });
    await db.logActivity('Unpublish Project', `Unpublished project ${updated.id}.`);
    res.json({ success: true, data: updated });
  } catch {
    res.status(500).json({ success: false, error: 'Could not unpublish project.' });
  }
});

// POST /api/admin/projects/:id/archive
router.post('/:id/archive', async (req, res) => {
  try {
    const updated = await db.updateProject(req.params.id, { status: 'archived' });
    if (!updated) return res.status(404).json({ success: false, error: 'Project not found.' });
    await db.logActivity('Archive Project', `Archived project ${updated.id}.`);
    res.json({ success: true, data: updated });
  } catch {
    res.status(500).json({ success: false, error: 'Could not archive project.' });
  }
});

// POST /api/admin/projects/:id/restore
router.post('/:id/restore', async (req, res) => {
  try {
    const updated = await db.updateProject(req.params.id, { status: 'draft' });
    if (!updated) return res.status(404).json({ success: false, error: 'Project not found.' });
    await db.logActivity('Restore Project', `Restored project ${updated.id} to draft.`);
    res.json({ success: true, data: updated });
  } catch {
    res.status(500).json({ success: false, error: 'Could not restore project.' });
  }
});

// POST /api/admin/projects/:id/duplicate
router.post('/:id/duplicate', async (req, res) => {
  try {
    const source = await db.getProjectById(req.params.id);
    if (!source) {
      return res.status(404).json({ success: false, error: 'Source project not found' });
    }

    const newId = `prj_${crypto.randomUUID()}`;
    const newTitle = `${source.title} (Copy)`;
    const newSlug = `${source.slug}-copy-${Date.now().toString().slice(-4)}`;

    const duplicatedData = {
      ...source,
      id: newId,
      title: newTitle,
      slug: newSlug,
      status: 'draft',
      published_at: null,
      sort_order: (source.sort_order || 0) + 1,
    };

    const duplicatedBlocks = (source.blocks || []).map((b, i) => ({
      ...b,
      id: `blk_${crypto.randomUUID()}`,
      project_id: newId,
    }));

    const created = await db.createProject(duplicatedData, duplicatedBlocks);
    await db.logActivity('Duplicate Project', `Duplicated project ${source.id}.`);

    res.status(201).json({ success: true, data: created });
  } catch {
    res.status(500).json({ success: false, error: 'Could not duplicate project.' });
  }
});

// DELETE /api/admin/projects/:id (soft delete unless query permanent=true)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const permanent = req.query.permanent === 'true';
    const project = await db.getProjectById(id);

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    if (!permanent) {
      const archived = await db.updateProject(id, { status: 'archived' });
      await db.logActivity('Archive Project', `Archived project ${project.id}.`);
      return res.json({ success: true, message: 'Project archived', data: archived });
    }

    await db.deleteProject(id, true);
    await db.logActivity('Permanently Delete Project', `Permanently deleted project ${project.id}.`);
    res.json({ success: true, message: 'Project permanently deleted' });
  } catch {
    res.status(500).json({ success: false, error: 'Could not delete project.' });
  }
});

export default router;
