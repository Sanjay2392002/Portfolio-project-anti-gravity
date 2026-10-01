import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, '../../public/uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Check Cloudinary configuration
const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('[Upload] Configured Cloudinary integration');
} else {
  console.log('[Upload] Using local filesystem upload fallback (public/uploads)');
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
