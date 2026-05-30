import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';

const app = new Hono();

app.get('/api/health', (c) => c.json({ ok: true }));

app.use('/*', serveStatic({ root: './dist/public' }));

const PORT = parseInt(process.env.PORT ?? '3001');
serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`Server → http://localhost:${PORT}`);
});
