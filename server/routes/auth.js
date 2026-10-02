import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { requireAdmin } from '../middleware/auth.js';
import { createRateLimiter, requireSameOrigin } from '../middleware/security.js';
import { isValidEmail } from '../utils/validation.js';
import {
  ADMIN_COOKIE_OPTIONS,
  ADMIN_SESSION_SECONDS,
  JWT_AUDIENCE,
  JWT_ISSUER,
  JWT_SECRET,
} from '../config/security.js';

const router = express.Router();
const loginRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: 'Too many sign-in attempts. Please try again later.',
});
const passwordRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many password-change attempts. Please try again later.',
});
const dummyHash = bcrypt.hashSync('timing-only-not-a-real-account', 12);

const issueAdminSession = (res, user) => {
  const token = jwt.sign(
    { email: user.email, sv: user.session_version || 0 },
    JWT_SECRET,
    { subject: user.id, issuer: JWT_ISSUER, audience: JWT_AUDIENCE, expiresIn: ADMIN_SESSION_SECONDS, algorithm: 'HS256' }
  );
  res.cookie('admin_token', token, { ...ADMIN_COOKIE_OPTIONS, maxAge: ADMIN_SESSION_SECONDS * 1000 });
};

router.use(requireSameOrigin);

router.post('/login', loginRateLimit, async (req, res) => {
  const identifier = typeof (req.body?.email || req.body?.username || req.body?.identifier) === 'string'
    ? String(req.body.email || req.body.username || req.body.identifier).trim()
    : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!identifier || password.length < 1 || Buffer.byteLength(password, 'utf8') > 72) {
    return res.status(400).json({ success: false, error: 'Enter your username or email and password.' });
  }

  try {
    const user = await db.getUserByUsernameOrEmail(identifier);
    const passwordMatches = await bcrypt.compare(password, user?.password_hash || dummyHash);
    if (!user || user.role !== 'admin' || !passwordMatches) {
      return res.status(401).json({ success: false, error: 'Invalid username/email or password.' });
    }

    issueAdminSession(res, user);
    try {
      await db.logActivity('Admin Login', `Administrator ${user.username || user.email} signed in.`);
    } catch (logErr) {
      console.warn('[AUTH] Could not record activity log:', logErr?.message);
    }
    return res.json({ success: true, user: { id: user.id, username: user.username || 'Sanjay', email: user.email, role: user.role } });
  } catch (err) {
    console.error('[AUTH LOGIN ERROR]', err);
    return res.status(500).json({ success: false, error: 'Sign-in is temporarily unavailable.' });
  }
});

router.post('/password', requireAdmin, passwordRateLimit, async (req, res) => {
  const currentPassword = typeof req.body?.current_password === 'string' ? req.body.current_password : '';
  const newPassword = typeof req.body?.new_password === 'string' ? req.body.new_password : '';
  if (!currentPassword || Buffer.byteLength(currentPassword, 'utf8') > 72 || newPassword.length < 8 || Buffer.byteLength(newPassword, 'utf8') > 72) {
    return res.status(400).json({ success: false, error: 'Enter your current password and a new password with at least 8 characters.' });
  }

  try {
    const user = await db.getUserById(req.user.id);
    if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect.' });
    }
    const updatedUser = await db.updateUserPassword(user.id, await bcrypt.hash(newPassword, 12));
    if (!updatedUser) return res.status(401).json({ success: false, error: 'Administrator account is unavailable.' });
    issueAdminSession(res, updatedUser);
    await db.logActivity('Admin Password Changed', `Administrator ${user.id} changed the account password.`);
    return res.json({ success: true, message: 'Password changed. Other active sessions have been signed out.' });
  } catch {
    return res.status(500).json({ success: false, error: 'Could not change the password.' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('admin_token', ADMIN_COOKIE_OPTIONS);
  res.json({ success: true });
});

router.get('/me', requireAdmin, (req, res) => {
  res.json({ success: true, user: req.user });
});

export default router;
