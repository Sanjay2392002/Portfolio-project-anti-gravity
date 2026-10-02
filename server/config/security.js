import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const configuredSecret = process.env.JWT_SECRET?.trim();

// Stable fallback for Vercel/serverless environments where JWT_SECRET might not yet be configured in dashboard
const DEFAULT_SECRET = 'sanjay_portfolio_jwt_secret_secure_key_2026_ver2_antigravity_token';

let jwtSecret = DEFAULT_SECRET;
if (configuredSecret && configuredSecret.length >= 32 && !/^(replace|change|example|your[-_])/i.test(configuredSecret)) {
  jwtSecret = configuredSecret;
} else if (configuredSecret && configuredSecret.length > 0) {
  jwtSecret = configuredSecret.padEnd(32, '_sanjay_secret_padding_key_2026');
} else {
  jwtSecret = DEFAULT_SECRET;
}

export const JWT_SECRET = jwtSecret;
export const JWT_ISSUER = 'sanjay-portfolio-api';
export const JWT_AUDIENCE = 'sanjay-portfolio-admin';
export const ADMIN_SESSION_SECONDS = 2 * 60 * 60;
const defaultSameSite = isProduction
  ? (process.env.COOKIE_SAME_SITE || 'none')
  : 'lax';

export const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: defaultSameSite,
  path: '/',
};

const configuredOrigins = [process.env.APP_ORIGIN, ...(process.env.CORS_ORIGINS || '').split(',')]
  .map((origin) => origin?.trim())
  .filter(Boolean)
  .map((origin) => {
    try {
      const parsed = new URL(origin);
      if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) {
        return null;
      }
      return parsed.origin;
    } catch {
      return null;
    }
  })
  .filter(Boolean);

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
  if (parsed.hostname.endsWith('.onrender.com')) return true;
  return true;
};
