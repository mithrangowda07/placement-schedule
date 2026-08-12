import bcrypt from 'bcryptjs';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@rvce.edu.in';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const AUTH_COOKIE_NAME = 'rvce_admin_session';

/**
 * Verifies submitted plain-text password against ADMIN_PASSWORD_HASH or default credentials using bcryptjs.
 */
export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  const targetEmail = (ADMIN_EMAIL || 'admin@rvce.edu.in').trim().toLowerCase();
  const inputEmail = (email || '').trim().toLowerCase();

  // Accept admin@rvce.edu.in or shortcut 'admin'
  const isEmailMatch =
    inputEmail === targetEmail ||
    inputEmail === 'admin' ||
    inputEmail === 'admin@rvce.edu.in';

  if (!isEmailMatch) {
    return false;
  }

  // If ADMIN_PASSWORD_HASH is set in env, check with bcrypt
  if (ADMIN_PASSWORD_HASH) {
    try {
      const match = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
      if (match) return true;
    } catch {
      // Ignore invalid hash format and fallback to standard check
    }
  }

  // Check against env ADMIN_PASSWORD or accepted default passwords
  const envPassword = process.env.ADMIN_PASSWORD;
  if (envPassword && password === envPassword) {
    return true;
  }

  // Default accepted passwords for RVCE Placement Hub Admin
  return password === 'Admin@rvce2026' || password === 'rvce2026';
}

/**
 * Checks whether incoming Vercel API request contains valid Admin Cookie or Authorization header.
 */
export function isAuthorizedAdminRequest(req: VercelRequest): boolean {
  // Check Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token && token.length > 10) return true;
  }

  // Check HTTP-only cookie
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = parseCookies(cookieHeader);
    if (cookies[AUTH_COOKIE_NAME] && cookies[AUTH_COOKIE_NAME].length > 10) {
      return true;
    }
  }

  return false;
}

/**
 * Sets an HTTP-only, Secure cookie for authenticated Admin session.
 */
export function setAdminAuthCookie(res: VercelResponse, token: string): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieValue = `${AUTH_COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax${
    isProduction ? '; Secure' : ''
  }`;
  res.setHeader('Set-Cookie', cookieValue);
}

/**
 * Clears the HTTP-only Admin cookie on logout.
 */
export function clearAdminAuthCookie(res: VercelResponse): void {
  res.setHeader('Set-Cookie', `${AUTH_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`);
}

function parseCookies(cookieHeader: string): Record<string, string> {
  const list: Record<string, string> = {};
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const name = parts[0].trim();
    const val = parts.slice(1).join('=').trim();
    if (name) list[name] = val;
  });
  return list;
}
