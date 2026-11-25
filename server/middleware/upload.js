import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Safe upload directory resolution (works in serverless and containerized environments)
let UPLOADS_DIR = path.resolve(__dirname, '../../public/uploads');
try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch {
  // Read-only filesystem in serverless environments (e.g. /var/task on Vercel)
  UPLOADS_DIR = path.join(os.tmpdir(), 'sanjay_portfolio_uploads');
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  } catch {
    // Best-effort directory fallback
  }
}

// Check Cloudinary configuration
const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
  process.env.CLOUDINARY_API_KEY?.trim() &&
  process.env.CLOUDINARY_API_SECRET?.trim()
);

if (hasCloudinary) {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
      api_key: process.env.CLOUDINARY_API_KEY.trim(),
      api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
    });
    console.log('[Upload] Configured Cloudinary integration');
  } catch (err) {
    console.warn('[Upload] Cloudinary configuration warning:', err?.message || err);
  }
} else {
  console.log('[Upload] Cloudinary credentials not configured; local media fallback active');
}

// Multer disk storage for receiving files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const extensions = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/avif': '.avif' };
    const ext = extensions[file.mimetype] || '.bin';
    const uniqueName = `media_${crypto.randomUUID()}${ext}`;
    cb(null, uniqueName);
  },
});

// Multer disk storage specifically for PDF resumes
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = `resume_${Date.now()}_${crypto.randomBytes(6).toString('hex')}.pdf`;
    cb(null, uniqueName);
  },
});

export const resumeUpload = multer({
  storage: resumeStorage,
  limits: { fileSize: 15 * 1024 * 1024, files: 1, fields: 5 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      const error = new Error('Only PDF documents (.pdf) are supported for resume uploads.');
      error.status = 400;
      cb(error);
    }
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024, files: 1, fields: 5, fieldSize: 16 * 1024, parts: 7 },
  fileFilter: (req, file, cb) => {
    const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (allowedMime.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new Error('Only JPEG, PNG, WebP, and AVIF images are supported.');
      error.status = 400;
      cb(error);
    }
  },
});

export const processMediaUpload = async (file) => {
  const buffer = fs.readFileSync(file.path);
  const isJpeg = file.mimetype === 'image/jpeg' && buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng = file.mimetype === 'image/png' && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isWebp = file.mimetype === 'image/webp' && buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
  const isAvif = file.mimetype === 'image/avif' && buffer.length >= 12 && buffer.toString('ascii', 4, 8) === 'ftyp' && /^(avif|avis|mif1|msf1)$/.test(buffer.toString('ascii', 8, 12));
  if (!isJpeg && !isPng && !isWebp && !isAvif) {
    try { fs.unlinkSync(file.path); } catch { /* best effort cleanup */ }
    const error = new Error('The uploaded file content does not match an allowed image format.');
    error.status = 400;
    throw error;
  }

  if (hasCloudinary) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: process.env.CLOUDINARY_FOLDER || 'sanjay_portfolio_media',
        resource_type: 'image',
      });
      // Optionally clean up local temp file
      try {
        fs.unlinkSync(file.path);
      } catch (e) {
        // ignore
      }
      return {
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      };
    } catch {
      console.warn('[Cloudinary] Upload failed; using the local asset fallback.');
    }
  }

  // Fallback to local URL
  return {
    url: `/uploads/${file.filename}`,
    width: null,
    height: null,
    format: path.extname(file.originalname).replace('.', ''),
    bytes: file.size,
  };
};

export const processResumeUpload = async (file) => {
  if (!file || !file.path) {
    throw new Error('No resume file was uploaded.');
  }

  const buffer = fs.readFileSync(file.path);
  // Verify PDF magic header bytes: %PDF- (0x25, 0x50, 0x44, 0x46)
  const isPdf = buffer.length >= 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
  if (!isPdf) {
    try { fs.unlinkSync(file.path); } catch { /* best effort cleanup */ }
    const error = new Error('The uploaded file content is not a valid PDF document.');
    error.status = 400;
    throw error;
  }

  if (hasCloudinary) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: process.env.CLOUDINARY_FOLDER || 'sanjay_portfolio_resumes',
        resource_type: 'auto',
        public_id: `resume_${Date.now()}`,
        use_filename: true,
        unique_filename: true,
      });

      try {
        fs.unlinkSync(file.path);
      } catch {
        // ignore
      }

      if (!result?.secure_url) {
        throw new Error('Cloudinary did not return a valid secure URL for the uploaded PDF.');
      }

      return {
        url: result.secure_url,
        bytes: result.bytes || file.size,
        storage: 'cloudinary',
      };
    } catch (err) {
      console.warn('[Cloudinary] Resume PDF upload failed; attempting local fallback:', err?.message || err);
    }
  }

  // Local asset fallback
  return {
    url: `/uploads/${file.filename}`,
    bytes: file.size,
    storage: 'local',
  };
};
