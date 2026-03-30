const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

// -- Persons --
export const getPersons    = ()            => request('/api/persons');
export const getPerson     = (id: string)  => request(`/api/persons/${id}`);
export const createPerson  = (data: any)   => request('/api/persons', { method: 'POST', body: JSON.stringify(data) });

// -- Firearms --
export const getFirearms   = ()            => request('/api/firearms');
export const getFirearm    = (id: string)  => request(`/api/firearms/${id}`);
export const createFirearm = (data: any)   => request('/api/firearms', { method: 'POST', body: JSON.stringify(data) });

// -- Permits --
export const getPermits    = ()            => request('/api/permits');
export const getPermit     = (id: string)  => request(`/api/permits/${id}`);
export const createPermit  = (data: any)   => request('/api/permits', { method: 'POST', body: JSON.stringify(data) });
export const updatePermit  = (id: string, data: any) => request(`/api/permits/${id}`, { method: 'PUT', body: JSON.stringify(data) });

// -- Licenses --
export const getLicenses   = ()            => request('/api/licenses');
export const getLicense    = (id: string)  => request(`/api/licenses/${id}`);
export const createLicense = (data: any)   => request('/api/licenses', { method: 'POST', body: JSON.stringify(data) });
export const updateLicense = (id: string, data: any) => request(`/api/licenses/${id}`, { method: 'PUT', body: JSON.stringify(data) });

// -- Transactions --
export const getTransactions  = ()           => request('/api/transactions');
export const createTransaction = (data: any) => request('/api/transactions', { method: 'POST', body: JSON.stringify(data) });

// -- Dealers --
export const getDealers = () => request('/api/dealers');
export const getDealer  = (id: string) => request(`/api/dealers/${id}`);

// -- Reports --
export const getReports    = ()           => request('/api/reports');
export const createReport  = (data: any) => request('/api/reports', { method: 'POST', body: JSON.stringify(data) });

// -- Serialization --
export const getSerializations  = ()           => request('/api/serialization');
export const createSerialization = (data: any) => request('/api/serialization', { method: 'POST', body: JSON.stringify(data) });

// -- Admin --
export const getAdminStats    = ()           => request('/api/admin/stats');
export const getAdminMessages = ()           => request('/api/admin/messages');
export const createAdminMessage = (data: any) => request('/api/admin/messages', { method: 'POST', body: JSON.stringify(data) });

// -- Vector Search --
export const search = (q: string, type = 'all', limit = 10) =>
  request(`/api/search?q=${encodeURIComponent(q)}&type=${type}&limit=${limit}`);
