import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAdminCredentials, setAdminAuthCookie } from '../../src/lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, email, password } = req.body || {};
  const inputEmail = email || username || '';

  if (!inputEmail || !password) {
    return res.status(400).json({ error: 'Email/Username and password are required' });
  }

  const isValid = await verifyAdminCredentials(inputEmail, password);

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }

  const sessionToken = `admin_sess_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

  // Set HTTP-only Cookie
  setAdminAuthCookie(res, sessionToken);

  return res.status(200).json({
    success: true,
    token: sessionToken,
    user: inputEmail,
    message: 'Admin authenticated successfully',
  });
}
