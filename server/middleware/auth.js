import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { JWT_AUDIENCE, JWT_ISSUER, JWT_SECRET } from '../config/security.js';

export const requireAdmin = async (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  const token = req.cookies?.admin_token;
  if (!token) return res.status(401).json({ success: false, error: 'Authentication required.' });

  try {
    const claims = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    if (typeof claims !== 'object' || typeof claims.sub !== 'string') {
      return res.status(401).json({ success: false, error: 'Session is invalid or expired.' });
    }

    const user = await db.getUserById(claims.sub);
    if (!user || user.role !== 'admin' || (claims.sv || 0) !== (user.session_version || 0)) {
      return res.status(401).json({ success: false, error: 'Session is invalid or expired.' });
    }

    req.user = { id: user.id, email: user.email, role: user.role };
    return next();
  } catch {
    return res.status(401).json({ success: false, error: 'Session is invalid or expired.' });
  }
};
