# OpenRouter Video MCP Bridge

Private MCP bridge for OpenRouter's asynchronous video API.

## Tools

- `list_video_models` — live model capabilities/pricing
- `generate_video` — submit a billable generation job
- `check_video` — poll job state
- `get_video_download_link` — temporary signed MP4 link

Supports text-to-video, first/last frame image-to-video, and reference images/video/audio where the selected OpenRouter model supports them.

## Deploy to Vercel

1. Upload/import this project into Vercel.
2. In **Project → Settings → Environment Variables**, add:
   - `OPENROUTER_API_KEY` — your OpenRouter key
   - `BRIDGE_TOKEN` — a long random secret you create
3. Redeploy.
4. MCP endpoint:
   - Preferred if your MCP client supports bearer auth: `https://YOUR-PROJECT.vercel.app/api/mcp` with `Authorization: Bearer YOUR_BRIDGE_TOKEN`
   - Fallback for clients that only accept a URL: `https://YOUR-PROJECT.vercel.app/api/mcp?token=YOUR_BRIDGE_TOKEN`

Do not share either secret publicly. Query-string auth is a compatibility fallback and can appear in access logs; bearer auth is preferred.

## OpenRouter behavior

OpenRouter video generation is asynchronous. `generate_video` returns a job ID. Use `check_video` until status is `completed`, then call `get_video_download_link`.

Model capabilities differ. Always run `list_video_models` before choosing duration/resolution/aspect ratio for a new model.
