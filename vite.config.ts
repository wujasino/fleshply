import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

let componentTagger: any = undefined;
try {
  componentTagger = require('lovable-tagger').componentTagger;
} catch (e) { /* optional */ }

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
    mode === "development" && componentTagger && componentTagger(),
    mode === "development" && netlifyFunctionsPlugin()
  ].filter(Boolean),
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Animation (largest single dep)
          'vendor-motion': ['framer-motion'],
          // Charts (recharts + deps)
          'vendor-charts': ['recharts'],
          // Supabase
          'vendor-supabase': ['@supabase/supabase-js'],
          // Radix UI primitives
          'vendor-radix': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-tabs',
            '@radix-ui/react-select',
            '@radix-ui/react-switch',
          ],
        },
      },
    },
    // Raise warning threshold to avoid noise for known large deps
    chunkSizeWarningLimit: 600,
  },
}));
