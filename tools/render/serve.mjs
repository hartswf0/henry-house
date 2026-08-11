// Minimal static server so the browser can ES-import the SAME model files the
// drawings use. The 3D model is not a separate model — it is model/geometry.mjs.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { extname, normalize, join } from 'node:path';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const TYPES = {
  '.html': 'text/html', '.mjs': 'text/javascript', '.js': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.css': 'text/css',
};

export function serve(port = 0) {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      try {
        const url = decodeURIComponent(req.url.split('?')[0]);
        const path = join(ROOT, normalize(url).replace(/^(\.\.[/\\])+/, ''));
        if (!path.startsWith(ROOT)) { res.writeHead(403).end(); return; }
        const buf = await readFile(path);
        res.writeHead(200, {
          'Content-Type': TYPES[extname(path)] ?? 'application/octet-stream',
          'Cache-Control': 'no-store',
        });
        res.end(buf);
      } catch {
        res.writeHead(404).end('not found');
      }
    });
    server.listen(port, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { port } = await serve(8099);
  console.log(`serving ${ROOT} on http://127.0.0.1:${port}`);
}
