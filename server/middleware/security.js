import { isTrustedOrigin } from '../config/security.js';

export const requireSameOrigin = (req, res, next) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();
  const origin = req.get('origin');
  if (!isTrustedOrigin(origin)) {
    return res.status(403).json({ success: false, error: 'Request origin is not allowed.' });
  }
  next();
};

export const createRateLimiter = ({ windowMs, max, message }) => {
  const buckets = new Map();
  const cleanup = setInterval(() => {
    const cutoff = Date.now() - windowMs;
    for (const [key, bucket] of buckets) {
      if (bucket.startedAt < cutoff) buckets.delete(key);
    }
  }, Math.min(windowMs, 5 * 60 * 1000));
  cleanup.unref?.();

  return (req, res, next) => {
    const now = Date.now();
    let key = '127.0.0.1';
    try {
      const xff = req.headers?.['x-forwarded-for'];
      if (typeof xff === 'string' && xff.trim().length > 0) {
        key = xff.split(',')[0].trim();
      } else if (typeof req.headers?.['x-real-ip'] === 'string' && req.headers['x-real-ip'].trim().length > 0) {
        key = req.headers['x-real-ip'].trim();
      } else if (req.socket?.remoteAddress) {
        key = req.socket.remoteAddress;
      } else if (req.connection?.remoteAddress) {
        key = req.connection.remoteAddress;
      }
    } catch {
      key = '127.0.0.1';
    }
    let bucket = buckets.get(key);
    if (!bucket || now - bucket.startedAt >= windowMs) {
      if (buckets.size >= 10000) buckets.delete(buckets.keys().next().value);
      bucket = { startedAt: now, count: 0 };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    if (bucket.count > max) {
      const retryAfter = Math.max(1, Math.ceil((windowMs - (now - bucket.startedAt)) / 1000));
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({ success: false, error: message });
    }
    next();
  };
};
