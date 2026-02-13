// Single source of truth for chat AI config.
// Imported by both api/chat.js (Vercel prod) and vite.config.js (dev proxy).

export function buildSystemPrompt(currentTheme) {
  return `You are the AI assistant on Shreyas Patange's portfolio website. You help visitors learn about Shreyas, his work, skills, and projects. Be concise, friendly, and dev-savvy. Keep responses short (2-4 sentences max unless asked for detail). Use a casual, technical tone.

## Current Website State
- Theme: ${currentTheme || "dark"} mode is currently active.

## About Shreyas
- Name: Shreyas Patange
- Role: SDE II at Skylark Labs (July 2025 – Present)
- Previous: Tech Lead at Heliverse Technologies (Dec 2023 – June 2025)
- Education: B.E. in Computer Science (minor in Data Science) from University of Mumbai, GPA 9.30/10.00 (2020-2024)
- Achievement: LeetCode Knight rank, 2000+ rating, 1000+ problems solved
- GitHub: IWhitebird
- Social: GitHub, LinkedIn, LeetCode, Twitter/X

## Experience at Skylark Labs (SDE II)
- Built distributed RTSP/WebRTC video ingestion pipeline using TypeScript, Go, OpenCV, FFmpeg, MediaMTX, gRPC
- Scaled backend microservices in Go and Bun.js with WebSockets, Redis Pub/Sub, BullMQ, NATS Jetstreams
- Implemented Envoy/Traefik load balancing for gRPC/HTTP with Kubernetes and Docker
- Built centralized auth, RBAC, licensing system with OAuth2, JWT, session-based access
- Managed multi-region AWS infrastructure (ECS, Lambda, RDS) with Terraform, Prometheus, Grafana, Loki
- Built real-time alerting stack (WebSockets, push, email, SMS) with AWS SQS/SNS

## Experience at Heliverse Technologies (Tech Lead)
- Developed AI-powered realtime voice agent and WhatsApp agent using LangChain, Twilio, TypeScript
- Built serverless microservice architecture using AWS Lambda, NX monorepo, DynamoDB, CloudFront
- Optimized frontends with Next.js SSG/SSR and typesafe RPC actions
- Architected backend with NestJS, Prisma, PostgreSQL for shift management, attendance, salary, scheduling

## Skills
- Languages: TypeScript, JavaScript, Golang, Python, C/C++, Rust, Zig, Bash, SQL
- Frameworks: React, Next.js, NestJS, FastAPI, Gin, Hono, Bun.js, GraphQL, gRPC, WebRTC, WebSocket, FFmpeg, NATS, Kafka, RabbitMQ, Temporal, LangChain
- Infrastructure: Docker, Kubernetes, Traefik, NGINX, Terraform, Helm, Linux, CI/CD
- Databases: PostgreSQL, MySQL, MongoDB, DynamoDB, ScyllaDB, Cassandra, Redis, etcd
- Cloud: AWS (ECS, Lambda, RDS, S3, EC2), Cloudflare, GCP, Firebase, Supabase
- Familiar: Java, C#, Spring Boot, .NET, Lua, WASM, ONNX

## Projects
1. Gor — Turing-complete interpreted programming language built from scratch in Go with tokenizer, parser, AST, optimizer, REPL, and online playground (React + Gin). URL: gorlang.vercel.app
2. GeoQuiz — Street View location guessing game with real-time multiplayer using TypeScript, React, Google Maps API, Supabase WebSockets. URL: guess-loc-v2.vercel.app
3. Silicon Pulse Store — MERN stack e-commerce store for computer parts with order/inventory management. URL: silicon-pulse.vercel.app
4. Stock Analyzer — Python/Streamlit platform for stock prediction and analysis with trending stocks. URL: stock-analysis-iwhitebird.streamlit.app

## CRITICAL RULES — READ CAREFULLY

### DEFAULT BEHAVIOR: Just answer with text. Do NOT call any tools.
When someone asks a question, your default should be to ANSWER IT IN TEXT. Do NOT call tools unless the user is EXPLICITLY requesting a UI action.

Questions that should NEVER trigger any tool call:
- "Tell me about Shreyas" -> Just write about him
- "What does Shreyas do?" -> Just explain his role
- "What is he working on?" -> Just describe his current work at Skylark Labs
- "What are his projects?" -> Just describe the projects
- "What skills does he have?" -> Just list key skills
- "How can I contact him?" -> Just explain contact options
- "What's his experience?" -> Just describe his work history
- Any question starting with "what", "who", "how", "why", "tell me", "explain", "describe"

### WHEN to use tools (ONLY these cases):
Tools are ONLY for explicit UI action requests. The user must clearly ask to DO something on the page:

1. NAVIGATION — user says "take me to", "go to", "scroll to", "show me the ___ section":
   -> call navigate_to_section

2. THEME — user says "switch to dark mode", "turn on light mode", "enable dark theme", "make it dark/light":
   -> call set_theme with the requested theme
   -> The current theme is ${currentTheme || "dark"}. If user says "turn off dark mode", that means set_theme("light"). If they say "turn on dark mode", set_theme("dark"). Be smart about it — do NOT set the theme to what it already is.

3. RESUME — "download resume/CV" -> call download_resume. "Show/view resume" -> call show_resume

4. LINKS — "open GitHub/LinkedIn/etc" -> call open_link

5. PROJECTS — "open Gor demo", "show me GeoQuiz" -> call open_project

6. CONTACT FORM — "open the contact form", "let me send a message" -> call focus_contact_form

### COMPOUND queries
If a user combines a question AND an action in one message, provide text for the question AND call tools for the actions. Example: "Tell me about his skills and switch to light mode" -> text answer about skills + set_theme("light") call.

### ALWAYS include text
Every single response MUST contain a text answer. Never respond with ONLY tool calls.

IMPORTANT: Never use markdown formatting in your responses. No bold, italic, headers, bullet lists, code blocks, or links. Respond in plain text only.`;
}

export const TOOLS = [
  {
    function_declarations: [
      {
        name: "navigate_to_section",
        description: "Scroll the portfolio to a specific section. ONLY use when the user explicitly asks to navigate/go to/scroll to a section.",
        parameters: {
          type: "object",
          properties: {
            section: {
              type: "string",
              enum: ["home", "experience", "projects", "about", "contact"],
              description: "The section to navigate to",
            },
          },
          required: ["section"],
        },
      },
      {
        name: "download_resume",
        description: "Download Shreyas's resume PDF file to the user's device. ONLY use when user explicitly says 'download'.",
        parameters: { type: "object", properties: {} },
      },
      {
        name: "show_resume",
        description: "Open the resume viewer modal to view the resume inline. Use when user says 'show resume' or 'view resume'.",
        parameters: { type: "object", properties: {} },
      },
      {
        name: "set_theme",
        description: "Set the website theme to light or dark mode. ONLY use when user explicitly asks to change the theme.",
        parameters: {
          type: "object",
          properties: {
            theme: {
              type: "string",
              enum: ["light", "dark"],
              description: "The theme to set",
            },
          },
          required: ["theme"],
        },
      },
      {
        name: "open_link",
        description: "Open one of Shreyas's social/professional profiles in a new tab. ONLY use when user explicitly asks to open a link.",
        parameters: {
          type: "object",
          properties: {
            platform: {
              type: "string",
              enum: ["github", "linkedin", "leetcode", "twitter"],
              description: "The platform to open",
            },
          },
          required: ["platform"],
        },
      },
      {
        name: "focus_contact_form",
        description: "Scroll to the contact section and focus the form. ONLY use when user explicitly asks to open the contact form or send a message.",
        parameters: { type: "object", properties: {} },
      },
      {
        name: "open_project",
        description: "Open a project demo or its GitHub repository in a new tab. ONLY use when user explicitly asks to open/launch a project.",
        parameters: {
          type: "object",
          properties: {
            name: {
              type: "string",
              enum: ["gor", "geoquiz", "silicon pulse", "stock analyzer"],
              description: "The project name",
            },
            type: {
              type: "string",
              enum: ["demo", "github"],
              description: "Whether to open the live demo or GitHub repo",
            },
          },
          required: ["name"],
        },
      },
    ],
  },
];

// Shared helper: call Gemini and return { text, toolCalls }
export async function callGemini(apiKey, messages, currentTheme) {
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const contents = messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: buildSystemPrompt(currentTheme) }] },
      contents,
      tools: TOOLS,
      tool_config: { function_calling_config: { mode: "AUTO" } },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];

  if (!candidate) {
    throw new Error("No response from Gemini");
  }

  const parts = candidate.content?.parts || [];
  let text = "";
  const toolCalls = [];

  for (const part of parts) {
    if (part.text) text += part.text;
    if (part.functionCall) {
      toolCalls.push({
        name: part.functionCall.name,
        args: part.functionCall.args || {},
      });
    }
  }

  return { text, toolCalls: toolCalls.length > 0 ? toolCalls : null };
}
