import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

function netlifyFunctionsPlugin() {
  return {
    name: 'netlify-functions-middleware',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        try {
          if (!req.url || !req.url.startsWith('/.netlify/functions/')) return next();
          const parts = req.url.split('/').filter(Boolean);
          const fnName = parts[parts.indexOf('functions') + 1];
          if (!fnName) return next();
          const fnPath = path.resolve(process.cwd(), 'netlify', 'functions', `${fnName}.js`);
          const raw = await new Promise<Buffer>((resolve) => {
            const chunks: Buffer[] = [];
            req.on('data', (c: Buffer) => chunks.push(Buffer.from(c)));
            req.on('end', () => resolve(Buffer.concat(chunks)));
            req.on('error', () => resolve(Buffer.alloc(0)));
          });
          const event = {
            httpMethod: req.method,
            headers: req.headers,
            queryStringParameters: {},
            body: raw && raw.length ? raw.toString() : undefined,
            rawBody: raw
          };
          const mod = require(fnPath);
          const handler = mod.handler || mod.default || mod;
          const result = await handler(event);
          const statusCode = result?.statusCode ?? 200;
          const headers = result?.headers ?? { 'Content-Type': 'application/json' };
          res.writeHead(statusCode, headers);
          res.end(result?.body ?? '');
        } catch (err: any) {
          if ((err && err.code === 'MODULE_NOT_FOUND') || /Cannot find module/.test(String(err.message))) return next();
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: String(err?.message || err) }));
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
    hmr: { overlay: false },
  },
  plugins: [
    react(),
    mode === "development" && netlifyFunctionsPlugin()
  ].filter(Boolean),
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/framer-motion')) return 'vendor-motion';
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) return 'vendor-charts';
          if (id.includes('node_modules/@supabase')) return 'vendor-supabase';
          if (id.includes('node_modules/@radix-ui')) return 'vendor-radix';
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) return 'vendor-react';
          if (id.includes('node_modules/react')) return 'vendor-react';
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
}));
