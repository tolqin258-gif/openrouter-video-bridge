import { createHmac, timingSafeEqual } from 'node:crypto';

function secret() {
  const value = process.env.BRIDGE_TOKEN;
  if (!value) throw new Error('BRIDGE_TOKEN is not configured');
  return value;
}

export function signDownload(id: string, index: number, exp: number) {
  return createHmac('sha256', secret()).update(`${id}:${index}:${exp}`).digest('hex');
}

export function verifyDownload(id: string, index: number, exp: number, sig: string) {
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const expected = signDownload(id, index, exp);
  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(sig, 'hex'));
  } catch {
    return false;
  }
}

export function publicBaseUrl() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  throw new Error('Set APP_URL to the public Vercel URL');
}
