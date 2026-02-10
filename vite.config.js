import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

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
        const { messages } = JSON.parse(body);

        const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const systemPrompt = `You are the AI assistant on Shreyas Patange's portfolio website. You help visitors learn about Shreyas, his work, skills, and projects. Be concise, friendly, and dev-savvy. Keep responses short (2-4 sentences max unless asked for detail). Use a casual, technical tone.

## About Shreyas
- Role: SDE II at Skylark Labs (July 2025 – Present)
- Previous: Tech Lead at Heliverse Technologies (Dec 2023 – June 2025)
- Education: B.E. in Computer Science, University of Mumbai, GPA 9.30/10
- Achievement: LeetCode Knight rank, 2000+ rating, 1000+ problems solved
- GitHub: IWhitebird

## Skills
Languages: TypeScript, JavaScript, Golang, Python, C/C++, Rust, Zig, Bash, SQL
Frameworks: React, Next.js, NestJS, FastAPI, Gin, Hono, Bun.js, GraphQL, gRPC, WebRTC
Infrastructure: Docker, Kubernetes, Traefik, NGINX, Terraform, Helm, Linux, CI/CD
Databases: PostgreSQL, MySQL, MongoDB, DynamoDB, ScyllaDB, Redis, etcd
Cloud: AWS, Cloudflare, GCP, Firebase, Supabase

## Projects
1. Gor — Interpreted programming language in Go
2. GeoQuiz — Street View location guessing game with multiplayer
3. Silicon Pulse Store — MERN e-commerce store
4. Stock Analyzer — Python/Streamlit stock prediction platform

Use tools when the user asks to navigate, download resume, toggle theme, or open links.

IMPORTANT: Never use markdown formatting in your responses. No bold, italic, headers, bullet lists, code blocks, or links. Respond in plain text only.`;

        const tools = [{
          function_declarations: [
            { name: "navigate_to_section", description: "Scroll to a section", parameters: { type: "object", properties: { section: { type: "string", enum: ["home","experience","projects","about","contact"] } }, required: ["section"] } },
            { name: "download_resume", description: "Download resume PDF", parameters: { type: "object", properties: {} } },
            { name: "toggle_theme", description: "Toggle dark/light mode", parameters: { type: "object", properties: {} } },
            { name: "open_link", description: "Open a social profile", parameters: { type: "object", properties: { platform: { type: "string", enum: ["github","linkedin","leetcode","twitter"] } }, required: ["platform"] } },
            { name: "focus_contact_form", description: "Open contact form", parameters: { type: "object", properties: {} } },
            { name: "open_project", description: "Open a project demo or GitHub repo", parameters: { type: "object", properties: { name: { type: "string", enum: ["gor","geoquiz","silicon pulse","stock analyzer"] }, type: { type: "string", enum: ["demo","github"] } }, required: ["name"] } },
          ]
        }];

        const contents = messages.map((msg) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }));

        try {
          const reqBody = {
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents,
            tools,
            tool_config: { function_calling_config: { mode: "AUTO" } },
          };

          console.log('[chat-dev] API key present:', !!apiKey);
          console.log('[chat-dev] Sending', contents.length, 'messages to Gemini');

          const geminiRes = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reqBody),
          });

          const data = await geminiRes.json();
          console.log('[chat-dev] Gemini status:', geminiRes.status);
          console.log('[chat-dev] Gemini response:', JSON.stringify(data, null, 2));

          if (data.error) {
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: data.error.message || 'Gemini API error', details: data.error }));
            return;
          }

          const candidate = data.candidates?.[0];
          if (!candidate || !candidate.content) {
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              error: 'No valid response from Gemini',
              finishReason: candidate?.finishReason,
              blockReason: data.promptFeedback?.blockReason,
            }));
            return;
          }

          const parts = candidate.content.parts || [];
          let text = '';
          const toolCalls = [];

          for (const part of parts) {
            if (part.text) text += part.text;
            if (part.functionCall) toolCalls.push({ name: part.functionCall.name, args: part.functionCall.args || {} });
          }

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ text, toolCalls: toolCalls.length > 0 ? toolCalls : null }));
        } catch (err) {
          console.error('[chat-dev] Error:', err);
          res.statusCode = 500;
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
