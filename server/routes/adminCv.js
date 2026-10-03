import express from 'express';
import multer from 'multer';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { db } from '../db/index.js';
import { requireAdmin } from '../middleware/auth.js';
import { requireSameOrigin } from '../middleware/security.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024, files: 1 } });
const hasCloudinary = Boolean(process.env.CLOUDINARY_CLOUD_NAME?.trim() && process.env.CLOUDINARY_API_KEY?.trim() && process.env.CLOUDINARY_API_SECRET?.trim());

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
    api_key: process.env.CLOUDINARY_API_KEY.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
  });
}

router.use(requireAdmin, requireSameOrigin);

const storageUnavailable = (res) => {
  if (!db.isPostgres) {
    res.status(503).json({ success: false, error: 'Persistent PostgreSQL storage is required to manage the CV.' });
    return true;
  }
  return false;
};

const currentSettings = async () => (await db.getSettings('site_settings')) || {};
const versionedAttachmentUrl = (url) => typeof url === 'string' && url.includes('/raw/upload/')
  ? url.replace(/\/raw\/upload\/(?:fl_attachment(?::[^/]*)?\/)?/, '/raw/upload/fl_attachment:Sanjay_M_Resume.pdf/')
  : url;

router.get('/', async (req, res) => {
  if (storageUnavailable(res)) return;
  try {
    const [metadata, settings] = await Promise.all([db.getMeta('resume_file'), currentSettings()]);
    const data = metadata
      ? { ...metadata, download_url: versionedAttachmentUrl(metadata.url) || metadata.download_url }
      : (settings.resume_url ? { url: settings.resume_url, filename: path.basename(settings.resume_url), updated_at: null } : null);
    return res.json({ success: true, data });
  } catch {
    return res.status(500).json({ success: false, error: 'Could not load CV details.' });
  }
});

router.post('/', upload.single('file'), async (req, res) => {
  if (storageUnavailable(res)) return;
  if (!hasCloudinary) return res.status(503).json({ success: false, error: 'Configure Cloudinary to upload a CV.' });
  const file = req.file;
  if (!file) return res.status(400).json({ success: false, error: 'Choose a PDF file to upload.' });
  if (file.mimetype !== 'application/pdf' || file.buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
    return res.status(400).json({ success: false, error: 'The selected file must be a valid PDF.' });
  }

  try {
    const oldFile = await db.getMeta('resume_file');
    const filename = path.basename(file.originalname).replace(/[\u0000-\u001f]/g, '').slice(0, 200) || 'CV.pdf';
    const uploaded = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({
        folder: process.env.CLOUDINARY_FOLDER || 'sanjay_portfolio',
        public_id: 'resume.pdf',
        resource_type: 'raw',
        overwrite: true,
        use_filename: false,
        access_mode: 'public',
      }, (error, result) => error ? reject(error) : resolve(result));
      stream.end(file.buffer);
    });

    const metadata = {
      url: uploaded.secure_url,
      download_url: versionedAttachmentUrl(uploaded.secure_url),
      public_id: uploaded.public_id,
      filename,
      bytes: uploaded.bytes,
      version: uploaded.version,
      format: 'pdf',
      updated_at: new Date().toISOString(),
    };
    const settings = await currentSettings();
    await db.setSettings('site_settings', { ...settings, resume_url: metadata.url });
    await db.setMeta('resume_file', metadata);
    await db.logActivity('Update CV', 'Uploaded a replacement CV.');
    if (oldFile?.public_id && oldFile.public_id !== metadata.public_id) {
      try { await cloudinary.uploader.destroy(oldFile.public_id, { resource_type: 'raw' }); } catch { /* keep the saved replacement */ }
    }
    return res.json({ success: true, data: metadata });
  } catch {
    return res.status(500).json({ success: false, error: 'Could not upload the CV. Please try again.' });
  }
});

router.delete('/', async (req, res) => {
  if (storageUnavailable(res)) return;
  try {
    const existing = await db.getMeta('resume_file');
    const settings = await currentSettings();
    await db.setSettings('site_settings', { ...settings, resume_url: '' });
    await db.setMeta('resume_file', null);
    if (existing?.public_id && hasCloudinary) {
      try { await cloudinary.uploader.destroy(existing.public_id, { resource_type: 'raw' }); } catch { /* metadata is already cleared */ }
    }
    await db.logActivity('Remove CV', 'Removed the current CV.');
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ success: false, error: 'Could not remove the CV.' });
  }
});

export default router;
