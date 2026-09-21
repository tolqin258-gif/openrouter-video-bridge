export default function Home() {
  return (
    <main style={{ fontFamily: 'system-ui', maxWidth: 760, margin: '48px auto', padding: 24 }}>
      <h1>OpenRouter Video MCP Bridge</h1>
      <p>This deployment exposes a private MCP endpoint for OpenRouter video generation.</p>
      <p>MCP endpoint: <code>/api/mcp</code></p>
      <p>Configure <code>OPENROUTER_API_KEY</code> and <code>BRIDGE_TOKEN</code> in Vercel Environment Variables.</p>
    </main>
  );
}
