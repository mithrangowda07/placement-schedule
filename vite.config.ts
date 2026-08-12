import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import type { Plugin } from 'vite';

function apiDevServerPlugin(): Plugin {
  return {
    name: 'api-dev-server-plugin',
    configureServer(server) {
      const env = loadEnv('development', process.cwd(), '');
      Object.assign(process.env, env);

      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api')) {
          return next();
        }

        try {
          const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost:5173'}`);
          const pathname = urlObj.pathname;

          const query: Record<string, string> = {};
          urlObj.searchParams.forEach((val, key) => {
            query[key] = val;
          });

          let body: any = {};
          if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method || '')) {
            body = await new Promise((resolve) => {
              let raw = '';
              req.on('data', (chunk) => {
                raw += chunk;
              });
              req.on('end', () => {
                try {
                  resolve(raw ? JSON.parse(raw) : {});
                } catch {
                  resolve({});
                }
              });
            });
          }

          const vercelReq: any = Object.assign(req, {
            query,
            body,
            cookies: {},
          });

          const vercelRes: any = Object.assign(res, {
            status(code: number) {
              res.statusCode = code;
              return vercelRes;
            },
            json(data: any) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
              return vercelRes;
            },
            send(data: any) {
              res.end(data);
              return vercelRes;
            },
          });

          if (pathname === '/api/companies') {
            const mod = await server.ssrLoadModule('/api/companies.ts');
            await mod.default(vercelReq, vercelRes);
            return;
          }

          if (pathname === '/api/company') {
            const mod = await server.ssrLoadModule('/api/company.ts');
            await mod.default(vercelReq, vercelRes);
            return;
          }

          if (pathname === '/api/admin/login') {
            const mod = await server.ssrLoadModule('/api/admin/login.ts');
            await mod.default(vercelReq, vercelRes);
            return;
          }

          if (pathname === '/api/admin/companies') {
            const mod = await server.ssrLoadModule('/api/admin/companies.ts');
            await mod.default(vercelReq, vercelRes);
            return;
          }

          next();
        } catch (err: any) {
          console.error('[API Dev Server Error]:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message || 'Internal Dev API Error' }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), apiDevServerPlugin()],
});
