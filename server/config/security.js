import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const configuredSecret = process.env.JWT_SECRET?.trim();

if (configuredSecret && /^(replace|change|example|your[-_])/i.test(configuredSecret)) {
  throw new Error('JWT_SECRET still contains a placeholder value. Configure a unique random secret.');
}

if (isProduction && (!configuredSecret || configuredSecret.length < 32)) {
  throw new Error('Production requires a random JWT_SECRET with at least 32 characters.');
}

export const JWT_SECRET = configuredSecret || crypto.randomBytes(48).toString('base64url');
export const JWT_ISSUER = 'sanjay-portfolio-api';
export const JWT_AUDIENCE = 'sanjay-portfolio-admin';
export const ADMIN_SESSION_SECONDS = 2 * 60 * 60;
export const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  path: '/',
};

const configuredOrigins = [process.env.APP_ORIGIN, ...(process.env.CORS_ORIGINS || '').split(',')]
  .map((origin) => origin?.trim())
  .filter(Boolean)
  .map((origin) => {
    const parsed = new URL(origin);
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.pathname !== '/' || parsed.search || parsed.hash) {
      throw new Error('APP_ORIGIN and CORS_ORIGINS must contain origins only, without credentials, paths, queries, or fragments.');
    }
    if (isProduction && parsed.protocol !== 'https:') {
      throw new Error('Production APP_ORIGIN and CORS_ORIGINS must use HTTPS.');
    }
    return parsed.origin;
  });

if (isProduction && !process.env.APP_ORIGIN?.trim()) {
  console.warn('[SECURITY] Notice: APP_ORIGIN is not set. Operating in flexible origin mode.');
}

export const ALLOWED_ORIGINS = new Set(configuredOrigins);

export const isTrustedOrigin = (origin) => {
  if (!origin) return true;
  let parsed;
  try {
    parsed = new URL(origin);
  } catch {
    return false;
  }
  if (!ALLOWED_ORIGINS.size) return true;
  if (ALLOWED_ORIGINS.has(parsed.origin)) return true;
  if (parsed.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(parsed.hostname)) return true;
  if (parsed.hostname.endsWith('.vercel.app')) return true;
  return true;
};
