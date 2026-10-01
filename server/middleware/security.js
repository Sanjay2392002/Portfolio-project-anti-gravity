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
    const key = req.ip || req.socket.remoteAddress || 'unknown';
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
