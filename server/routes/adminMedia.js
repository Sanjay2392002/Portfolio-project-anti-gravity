import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../db/index.js';
import { requireAdmin } from '../middleware/auth.js';
import { requireSameOrigin } from '../middleware/security.js';
import { upload, processMediaUpload } from '../middleware/upload.js';

const uploadsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../public/uploads');

const router = express.Router();
router.use(requireAdmin, requireSameOrigin);

// GET /api/admin/media
router.get('/', async (req, res) => {
  try {
    const media = await db.getMedia();
    res.json({ success: true, data: media });
  } catch {
    res.status(500).json({ success: false, error: 'Could not load media.' });
  }
});

// POST /api/admin/media (Upload)
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    const processed = await processMediaUpload(req.file);
    const originalName = path.basename(req.file.originalname).replace(/[\u0000-\u001f]/g, '').slice(0, 200) || 'Uploaded image';
    const altText = typeof req.body?.alt_text === 'string' ? req.body.alt_text.trim().slice(0, 250) : '';

    const mediaItem = {
      id: `med_${crypto.randomUUID()}`,
      filename: req.file.filename,
      original_name: originalName,
      mime_type: req.file.mimetype,
      file_size: processed.bytes || req.file.size,
      width: processed.width,
      height: processed.height,
      url: processed.url,
      alt_text: altText || originalName,
      created_at: new Date().toISOString(),
    };

    const saved = await db.createMedia(mediaItem);
    await db.logActivity('Upload Media', `Uploaded media ${mediaItem.id}.`);

    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch { /* best effort cleanup */ }
    }
    const status = err.status || (err.code === 'LIMIT_FILE_SIZE' ? 413 : 500);
    res.status(status).json({ success: false, error: status >= 500 ? 'Could not upload media.' : err.message });
  }
});

// DELETE /api/admin/media/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.deleteMedia(req.params.id);
    if (!result.deleted) {
      return res.status(result.inUse ? 409 : 404).json({
        success: false,
        error: result.inUse ? 'This asset is used by portfolio content. Replace it before removing the media record.' : 'Media item not found.',
      });
    }
    const filename = result.media?.filename;
    if (typeof filename === 'string' && /^media_[a-f0-9-]+\.(jpg|png|webp|avif)$/.test(filename) && path.basename(filename) === filename) {
      const filePath = path.resolve(uploadsDir, filename);
      if (filePath.startsWith(`${uploadsDir}${path.sep}`) && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await db.logActivity('Delete Media', `Deleted media asset ID ${req.params.id}.`);
    res.json({ success: true, message: 'Media removed' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not remove media.' });
  }
});

export default router;
