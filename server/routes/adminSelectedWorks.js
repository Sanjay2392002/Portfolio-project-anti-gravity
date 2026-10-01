import crypto from 'crypto';
import express from 'express';
import { db } from '../db/index.js';
import { requireAdmin } from '../middleware/auth.js';
import { requireSameOrigin } from '../middleware/security.js';

const router = express.Router();
const categories = new Set(['Logo Presentation', 'Stories', 'Posters & Ads', 'Thumbnails', 'Carousels', 'Other']);
const mutableFields = new Set(['brand', 'title', 'image', 'type', 'width', 'height', 'category', 'collection', 'sort_order']);
router.use(requireAdmin, requireSameOrigin);

const validateWork = (input, existing = {}) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { error: 'A work item is required.' };
  if (Object.keys(input).some((field) => !mutableFields.has(field))) return { error: 'The work item contains unsupported fields.' };
  const value = { ...existing, ...input };
  const brand = typeof value.brand === 'string' ? value.brand.trim() : '';
  const title = typeof value.title === 'string' ? value.title.trim() : '';
  const image = typeof value.image === 'string' ? value.image.trim() : '';
  const collection = typeof value.collection === 'string' ? value.collection.trim() : '';
  const type = value.type;
  const category = value.category;
  const width = Number(value.width);
  const height = Number(value.height);
  const sortOrder = value.sort_order === undefined ? 0 : Number(value.sort_order);

  if (!brand || brand.length > 120 || !title || title.length > 255) return { error: 'Brand and title are required and must fit their length limits.' };
  if (!categories.has(category) || !['image', 'pdf'].includes(type)) return { error: 'Choose a supported creative type and category.' };
  if (!Number.isInteger(width) || width < 0 || width > 20000 || !Number.isInteger(height) || height < 0 || height > 20000 || (type === 'image' && (!width || !height))) {
    return { error: 'Image dimensions must be whole numbers from 1 to 20,000 pixels.' };
  }
  if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 1000000) return { error: 'Sort order must be a whole number from 0 to 1,000,000.' };
  if (collection.length > 160) return { error: 'Carousel collection names can be up to 160 characters.' };

  let safeImagePath = image;
  if (image.startsWith('/')) {
    if (image.startsWith('//') || image.includes('\\') || /[\u0000-\u001f]/.test(image)) return { error: 'Use a valid site asset path.' };
    let decoded;
    try { decoded = decodeURIComponent(image); } catch { return { error: 'Use a valid encoded asset path.' }; }
    if (decoded.split('/').includes('..') || !/^\/(selected-works|uploads|assets)\//.test(decoded)) return { error: 'Assets must be stored in the portfolio media folders.' };
  } else {
    try {
      const url = new URL(image);
      if (url.protocol !== 'https:' || url.username || url.password) return { error: 'External assets must use a secure HTTPS URL.' };
      safeImagePath = url.toString();
    } catch {
      return { error: 'Enter an asset path or secure HTTPS URL.' };
    }
  }

  return {
    value: {
      brand,
      title,
      image: safeImagePath,
      type,
      width,
      height,
      category,
      collection: category === 'Carousels' ? collection : '',
      sort_order: sortOrder,
    },
  };
};

router.get('/', async (req, res) => {
  try {
    return res.json({ success: true, data: await db.getSelectedWorks() });
  } catch {
    return res.status(500).json({ success: false, error: 'Could not load selected work.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const checked = validateWork(req.body);
    if (checked.error) return res.status(400).json({ success: false, error: checked.error });
    const allWorks = await db.getSelectedWorks();
    const existingBrand = allWorks.find((work) => work.brand === checked.value.brand);
    const brandOrder = existingBrand?.brand_order ?? (Math.max(-1, ...allWorks.map((work) => work.brand_order || 0)) + 1);
    const sortOrder = req.body.sort_order === undefined
      ? Math.max(-1, ...allWorks.filter((work) => work.brand === checked.value.brand).map((work) => work.sort_order || 0)) + 1
      : checked.value.sort_order;
    const created = await db.createSelectedWork({ id: crypto.randomUUID(), ...checked.value, brand_order: brandOrder, sort_order: sortOrder });
    await db.logActivity('Create Selected Work', `Created creative ${created.id}.`);
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    const status = error.code === '23505' ? 409 : 500;
    return res.status(status).json({ success: false, error: status === 409 ? 'This work item already exists.' : 'Could not create work item.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const existing = await db.getSelectedWorkById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: 'Work item not found.' });
    const checked = validateWork(req.body, existing);
    if (checked.error) return res.status(400).json({ success: false, error: checked.error });
    const allWorks = await db.getSelectedWorks();
    const existingBrand = allWorks.find((work) => work.brand === checked.value.brand);
    const brandOrder = existingBrand?.brand_order ?? (Math.max(-1, ...allWorks.map((work) => work.brand_order || 0)) + 1);
    const updated = await db.updateSelectedWork(existing.id, { ...checked.value, brand_order: brandOrder });
    await db.logActivity('Update Selected Work', `Updated creative ${existing.id}.`);
    return res.json({ success: true, data: updated });
  } catch {
    return res.status(500).json({ success: false, error: 'Could not update work item.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db.deleteSelectedWork(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Work item not found.' });
    await db.logActivity('Delete Selected Work', `Deleted creative ${req.params.id}.`);
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ success: false, error: 'Could not delete work item.' });
  }
});

export default router;
