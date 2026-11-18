const USER_KEY = 'peerly_user';

export function getToken() { return null; } // kompatibilitas untuk halaman lama
export function setToken() {}
export function clearSession() { localStorage.removeItem(USER_KEY); }
export function getUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); }
  catch { return null; }
}
export function setUser(user) { localStorage.setItem(USER_KEY, JSON.stringify(user)); }

export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const response = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; }
  catch { data = { error: text || `HTTP ${response.status}` }; }
  if (!response.ok) {
    const error = new Error(data.error || `HTTP ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export function requireAuth(expectedRole) {
  const user = getUser();
  if (!user) {
    location.href = '/pages/login.html';
    return null;
  }
  if (expectedRole && user.role !== expectedRole) {
    location.href = '/pages/dashboard.html';
    return null;
  }
  return user;
}

export async function logout() {
  try { await api('/api/auth/logout', { method: 'POST' }); } catch (_) {}
  clearSession();
  location.href = '/';
}
