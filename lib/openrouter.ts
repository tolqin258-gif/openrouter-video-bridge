const BASE = 'https://openrouter.ai/api/v1';

function apiKey() {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY is not configured');
  return key;
}

export async function openRouterFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${apiKey()}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  return fetch(`${BASE}${path}`, { ...init, headers, cache: 'no-store' });
}

export async function openRouterJson(path: string, init: RequestInit = {}) {
  const res = await openRouterFetch(path, init);
  const text = await res.text();
  let data: unknown;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!res.ok) {
    throw new Error(`OpenRouter ${res.status}: ${typeof data === 'object' ? JSON.stringify(data) : String(data)}`);
  }
  return data;
}
