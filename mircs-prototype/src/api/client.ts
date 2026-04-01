const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

async function request(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  if (res.status === 204) return null;
  return res.json();
}

export const getPersons        = ()           => request('/api/persons');
export const getPerson         = (id: string) => request(`/api/persons/${id}`);
export const getFirearms       = ()           => request('/api/firearms');
export const getFirearm        = (id: string) => request(`/api/firearms/${id}`);
export const getPermits        = ()           => request('/api/permits');
export const getPermit         = (id: string) => request(`/api/permits/${id}`);
export const getLicenses       = ()           => request('/api/licenses');
export const getLicense        = (id: string) => request(`/api/licenses/${id}`);
export const getTransactions   = ()           => request('/api/transactions');
export const getTransaction    = (id: string) => request(`/api/transactions/${id}`);
export const getDealers        = ()           => request('/api/dealers');
export const getDealer         = (id: string) => request(`/api/dealers/${id}`);
export const getReports        = ()           => request('/api/reports');
export const getReport         = (id: string) => request(`/api/reports/${id}`);
export const getSerializations = ()           => request('/api/serialization');

export const getAdminStats     = ()           => request('/api/admin/stats');
export const getAdminMessages  = ()           => request('/api/admin/messages');
export const createAdminMessage = (data: unknown) =>
  request('/api/admin/messages', { method: 'POST', body: JSON.stringify(data) });
export const deleteAdminMessage = (id: string) =>
  request(`/api/admin/messages/${id}`, { method: 'DELETE' });
export const getExpiredPermits = ()           => request('/api/admin/expired-permits');

export const search = (q: string, type = 'all', limit = 10) =>
  request(`/api/search?q=${encodeURIComponent(q)}&type=${type}&limit=${limit}`);
