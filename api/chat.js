import { callGemini } from "./chat-config.js";

const GEMINI_API_KEY = process.env.GOOGLE_AI_API_KEY;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
  }

  try {
    const { messages, currentTheme } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array required" });
    }

    const result = await callGemini(GEMINI_API_KEY, messages, currentTheme);
    return res.status(200).json(result);
  } catch (err) {
    console.error("Chat API error:", err);
    return res.status(502).json({ error: err.message || "Internal server error" });
  }
}
