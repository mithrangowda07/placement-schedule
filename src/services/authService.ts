const AUTH_TOKEN_KEY = 'rvce_placement_admin_token';
const AUTH_USER_KEY = 'rvce_placement_admin_user';

export async function loginAdmin(username: string, password: string): Promise<{ success: boolean; message?: string }> {
  const cleanUser = (username || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanUser, username: cleanUser, password: cleanPass }),
    });

    const contentType = response.headers.get('content-type') || '';

    // Only attempt JSON parsing if the server response is application/json
    if (contentType.includes('application/json')) {
      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem(AUTH_TOKEN_KEY, data.token);
          localStorage.setItem(AUTH_USER_KEY, cleanUser);
          return { success: true };
        }
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.error || 'Invalid admin credentials' };
      }
    }
  } catch {
    // Local dev mode without active Vercel serverless function backend
  }

  // Fallback check for local development / client-only mode
  const validUsers = [
    'admin@rvce.edu.in',
    'admin',
    (import.meta.env.VITE_ADMIN_EMAIL || '').toLowerCase(),
    (import.meta.env.VITE_ADMIN_USERNAME || '').toLowerCase(),
  ].filter(Boolean);

  const validPasswords = [
    'Admin@rvce2026',
    'rvce2026',
    import.meta.env.VITE_ADMIN_PASSWORD,
  ].filter(Boolean);

  const isUserValid = validUsers.includes(cleanUser);
  const isPassValid = validPasswords.includes(cleanPass);

  if (isUserValid && isPassValid) {
    const mockToken = `token_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    localStorage.setItem(AUTH_TOKEN_KEY, mockToken);
    localStorage.setItem(AUTH_USER_KEY, cleanUser);
    return { success: true };
  }

  return { success: false, message: 'Invalid admin email or password.' };
}

export function isAuthenticated(): boolean {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return Boolean(token && token.length > 5);
}

export function logoutAdmin(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getAdminUsername(): string {
  return localStorage.getItem(AUTH_USER_KEY) || 'admin@rvce.edu.in';
}
