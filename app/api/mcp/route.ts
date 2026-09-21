import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';
import { openRouterJson } from '../../../lib/openrouter';
import { publicBaseUrl, signDownload } from '../../../lib/signing';

const imageUrl = z.string().url();

const handler = createMcpHandler(
  (server) => {
    server.tool('list_video_models', 'List OpenRouter video models with live capabilities and pricing.', {}, async () => {
      const data = await openRouterJson('/videos/models');
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    });

    server.tool(
      'generate_video',
      'Create a video generation job through OpenRouter. This is billable.',
      {
        model: z.string().min(1),
        prompt: z.string().min(1),
        duration: z.number().int().min(1).optional(),
        resolution: z.string().optional(),
        aspect_ratio: z.string().optional(),
        generate_audio: z.boolean().optional(),
        seed: z.number().int().optional(),
        first_frame_url: imageUrl.optional(),
        last_frame_url: imageUrl.optional(),
        reference_image_urls: z.array(imageUrl).max(50).optional(),
        reference_video_urls: z.array(z.string().url()).max(10).optional(),
        reference_audio_urls: z.array(z.string().url()).max(10).optional()
      },
      async (args) => {
        const payload: Record<string, unknown> = {
          model: args.model,
          prompt: args.prompt
        };
        for (const k of ['duration', 'resolution', 'aspect_ratio', 'generate_audio', 'seed'] as const) {
          if (args[k] !== undefined) payload[k] = args[k];
        }

        const frames = [];
        if (args.first_frame_url) frames.push({ type: 'image_url', image_url: { url: args.first_frame_url }, frame_type: 'first_frame' });
        if (args.last_frame_url) frames.push({ type: 'image_url', image_url: { url: args.last_frame_url }, frame_type: 'last_frame' });
        if (frames.length) payload.frame_images = frames;

        const refs = [];
        for (const url of args.reference_image_urls ?? []) refs.push({ type: 'image_url', image_url: { url } });
        for (const url of args.reference_video_urls ?? []) refs.push({ type: 'video_url', video_url: { url } });
        for (const url of args.reference_audio_urls ?? []) refs.push({ type: 'audio_url', audio_url: { url } });
        if (refs.length) payload.input_references = refs;

        const data = await openRouterJson('/videos', { method: 'POST', body: JSON.stringify(payload) });
        return { content: [{ type: 'text', text: JSON.stringify(data) }] };
      }
    );

    server.tool(
      'check_video',
      'Check an OpenRouter video generation job by ID.',
      { id: z.string().min(1) },
      async ({ id }) => {
        const data = await openRouterJson(`/videos/${encodeURIComponent(id)}`);
        return { content: [{ type: 'text', text: JSON.stringify(data) }] };
      }
    );

    server.tool(
      'get_video_download_link',
      'Create a temporary signed download link for a completed OpenRouter video job.',
      { id: z.string().min(1), index: z.number().int().min(0).default(0) },
      async ({ id, index }) => {
        const exp = Date.now() + 15 * 60 * 1000;
        const sig = signDownload(id, index, exp);
        const url = `${publicBaseUrl()}/api/video-content/${encodeURIComponent(id)}?index=${index}&exp=${exp}&sig=${sig}`;
        return { content: [{ type: 'text', text: url }] };
      }
    );
  },
  {},
  { basePath: '/api' }
);

function authorized(request: Request) {
  const expected = process.env.BRIDGE_TOKEN;
  if (!expected) return false;
  const auth = request.headers.get('authorization');
  if (auth === `Bearer ${expected}`) return true;
  const token = new URL(request.url).searchParams.get('token');
  return token === expected;
}

async function secure(request: Request) {
  if (!authorized(request)) return new Response('Unauthorized', { status: 401 });
  return handler(request);
}

export { secure as GET, secure as POST, secure as DELETE };
