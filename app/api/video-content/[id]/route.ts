import { openRouterFetch } from '../../../../lib/openrouter';
import { verifyDownload } from '../../../../lib/signing';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const url = new URL(request.url);
  const index = Number(url.searchParams.get('index') ?? '0');
  const exp = Number(url.searchParams.get('exp') ?? '0');
  const sig = url.searchParams.get('sig') ?? '';

  if (!verifyDownload(id, index, exp, sig)) return new Response('Invalid or expired link', { status: 401 });

  const upstream = await openRouterFetch(`/videos/${encodeURIComponent(id)}/content?index=${index}`);
  if (!upstream.ok) return new Response(await upstream.text(), { status: upstream.status });

  const headers = new Headers();
  headers.set('Content-Type', upstream.headers.get('content-type') ?? 'video/mp4');
  headers.set('Content-Disposition', `inline; filename="${id}.mp4"`);
  headers.set('Cache-Control', 'private, max-age=300');
  return new Response(upstream.body, { status: 200, headers });
}
