const GEMINI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are the AI assistant on Shreyas Patange's portfolio website. You help visitors learn about Shreyas, his work, skills, and projects. Be concise, friendly, and dev-savvy. Keep responses short (2-4 sentences max unless asked for detail). Use a casual, technical tone.

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

## Tool Usage
You have tools available. Use them when the user asks to navigate, download, or interact with the portfolio:
- Use navigate_to_section when they want to see a section (experience, projects, about, contact, home)
- Use download_resume when they ask for the resume/CV
- Use toggle_theme when they ask to switch dark/light mode
- Use open_link when they want to visit GitHub, LinkedIn, LeetCode, or Twitter
- Use focus_contact_form when they want to reach out or send a message
Always respond with a brief text message alongside tool calls.

IMPORTANT: Never use markdown formatting in your responses. No bold, italic, headers, bullet lists, code blocks, or links. Respond in plain text only.`;

const TOOLS = [
  {
    function_declarations: [
      {
        name: "navigate_to_section",
        description: "Scroll the portfolio to a specific section",
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
        description: "Download Shreyas's resume PDF",
        parameters: { type: "object", properties: {} },
      },
      {
        name: "toggle_theme",
        description: "Toggle between dark and light mode",
        parameters: { type: "object", properties: {} },
      },
      {
        name: "open_link",
        description: "Open one of Shreyas's social/professional profiles",
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
        description: "Scroll to the contact section and focus the form for the user to send a message",
        parameters: { type: "object", properties: {} },
      },
      {
        name: "open_project",
        description: "Open a project demo or its GitHub repository",
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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array required" });
    }

    const contents = messages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        tools: TOOLS,
        tool_config: { function_calling_config: { mode: "AUTO" } },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Gemini API error:", err);
      return res.status(502).json({ error: "Gemini API request failed" });
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];

    if (!candidate) {
      return res.status(502).json({ error: "No response from Gemini" });
    }

    const parts = candidate.content?.parts || [];
    let text = "";
    const toolCalls = [];

    for (const part of parts) {
      if (part.text) {
        text += part.text;
      }
      if (part.functionCall) {
        toolCalls.push({
          name: part.functionCall.name,
          args: part.functionCall.args || {},
        });
      }
    }

    return res.status(200).json({
      text,
      toolCalls: toolCalls.length > 0 ? toolCalls : null,
    });
  } catch (err) {
    console.error("Chat API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
