import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { callGemini } from './api/chat-config.js';

function geminiDevProxy() {
  let apiKey;
  return {
    name: 'gemini-dev-proxy',
    configResolved(config) {
      const env = loadEnv(config.mode, config.root, '');
      apiKey = env.GOOGLE_AI_API_KEY;
    },
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        for await (const chunk of req) body += chunk;
        const { messages, currentTheme } = JSON.parse(body);

        try {
          console.log('[chat-dev] Sending', messages.length, 'messages to Gemini (theme:', currentTheme, ')');
          const result = await callGemini(apiKey, messages, currentTheme);
          console.log('[chat-dev] Response:', result.text?.slice(0, 80), '| tools:', result.toolCalls?.map(t => t.name));

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(result));
        } catch (err) {
          console.error('[chat-dev] Error:', err.message);
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    geminiDevProxy(),
    ViteImageOptimizer({
      jpg: { quality: 80 },
      png: { quality: 80 },
    }),
  ],
  server: { port: 3000 },
});
