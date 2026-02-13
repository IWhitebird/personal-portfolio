import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MyContext } from "../../MyContext";
import useTypewriter from "../../hooks/useTypewriter";
import useWindowSize from "../../hooks/useWindowSize";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";
import resumePdf from "../../assets/Resume.pdf";
import "./Chat.css";

const SOCIAL_LINKS = {
  github: "https://github.com/IWhitebird",
  linkedin: "https://linkedin.com/in/shreyas-patange",
  leetcode: "https://leetcode.com/IWhitebird",
  twitter: "https://twitter.com/IWhitewordd",
};

const PROJECT_LINKS = {
  gor: { url: "https://gorlang.vercel.app/", github: "https://github.com/IWhitebird/Gor" },
  geoquiz: { url: "https://guess-loc-v2.vercel.app/", github: "https://github.com/IWhitebird/guess-loc-v2" },
  "silicon pulse": { url: "https://silicon-pulse.vercel.app/", github: "https://github.com/Xeonen24/Silicon-Pulse-eComApp" },
  "stock analyzer": { url: "https://stock-analysis-iwhitebird.streamlit.app/", github: "https://github.com/IWhitebird/Stock-Analysis" },
};

const SECTION_IDS = {
  home: "content-container",
  experience: "experience",
  projects: "project",
  about: "about",
  contact: "contact",
};

const SUGGESTIONS = [
  "What does Shreyas do?",
  "Show me projects",
  "Take me to experience",
  "Open GitHub profile",
  "View resume",
  "What skills does he have?",
  "Switch to dark mode",
  "How can I contact him?",
];

function stripMarkdown(text) {
  if (!text) return text;
  return text
    .replace(/```[\s\S]*?```/g, (match) => match.replace(/```\w*\n?/g, "").trim())
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/(?<!\w)\*(.+?)\*(?!\w)/g, "$1")
    .replace(/(?<!\w)_(.+?)_(?!\w)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/^[-*_]{3,}\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const msgVariants = {
  hidden: { opacity: 0, y: 6, filter: "blur(2px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.3, ease: "easeOut" } },
};

const actionVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 0.45, x: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

const TypewriterMessage = ({ text, animate, onComplete, scrollFn }) => {
  const reduceMotion = usePrefersReducedMotion();
  const { displayedText, isTyping, skipToEnd } = useTypewriter(
    text,
    50,
    animate && !reduceMotion
  );

  useEffect(() => {
    if (!isTyping && animate && onComplete) {
      onComplete();
    }
  }, [isTyping, animate, onComplete]);

  useEffect(() => {
    if (isTyping && scrollFn) {
      scrollFn();
    }
  }, [displayedText, isTyping, scrollFn]);

  return (
    <motion.div
      className={`chat-msg chat-msg--assistant ${isTyping ? "chat-msg--typing" : ""}`}
      onClick={isTyping ? skipToEnd : undefined}
      variants={msgVariants}
      initial="hidden"
      animate="visible"
    >
      <span className="chat-prompt-ai">$ </span>
      <span className="chat-msg-text">
        {animate ? displayedText : text}
        {isTyping && <span className="chat-block-cursor" />}
      </span>
    </motion.div>
  );
};

const Chat = ({ onSetTheme, onShowResume }) => {
  const { mode } = useContext(MyContext);
  const { width } = useWindowSize();
  const isMobile = width <= 768;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isMobile && isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [isMobile, isOpen]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  // Auto-resize textarea to fit content
  const autoResize = useCallback((el) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 100) + "px";
  }, []);

  const executeToolCall = useCallback(
    (call) => {
      switch (call.name) {
        case "navigate_to_section": {
          const sectionId = SECTION_IDS[call.args.section] || call.args.section;
          const el = document.getElementById(sectionId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
            return `navigated to ${call.args.section}`;
          }
          return null;
        }
        case "download_resume": {
          const a = document.createElement("a");
          a.href = resumePdf;
          a.download = "Resume.pdf";
          a.click();
          return "downloading resume";
        }
        case "show_resume": {
          onShowResume?.();
          return "opened resume viewer";
        }
        case "set_theme": {
          const theme = call.args.theme;
          if (theme === "light" || theme === "dark") {
            onSetTheme?.(theme);
            return `switched to ${theme} mode`;
          }
          return null;
        }
        case "open_link": {
          const url = SOCIAL_LINKS[call.args.platform];
          if (url) {
            window.open(url, "_blank", "noopener");
            return `opened ${call.args.platform}`;
          }
          return null;
        }
        case "open_project": {
          const name = (call.args.name || "").toLowerCase();
          const project = PROJECT_LINKS[name] || Object.values(PROJECT_LINKS).find(
            (_, i) => Object.keys(PROJECT_LINKS)[i].includes(name)
          );
          if (project) {
            const target = call.args.type === "github" ? project.github : project.url;
            window.open(target, "_blank", "noopener");
            return `opened ${call.args.name} ${call.args.type === "github" ? "repo" : "demo"}`;
          }
          return null;
        }
        case "focus_contact_form": {
          const contact = document.getElementById("contact");
          if (contact) {
            contact.scrollIntoView({ behavior: "smooth" });
            setTimeout(() => {
              const firstInput = contact.querySelector("input");
              firstInput?.focus();
            }, 600);
            return "opened contact form";
          }
          return null;
        }
        default:
          return null;
      }
    },
    [onSetTheme, onShowResume]
  );

  const executeToolCalls = useCallback(
    (toolCalls) => {
      if (!toolCalls) return [];
      return toolCalls.map(executeToolCall).filter(Boolean);
    },
    [executeToolCall]
  );

  const flushTypingFlags = useCallback(() => {
    setMessages((prev) =>
      prev.map((msg) => (msg._isNew ? { ...msg, _isNew: false } : msg))
    );
  }, []);

  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim() || isLoading) return;

      flushTypingFlags();

      const userMsg = { role: "user", content: text.trim() };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");
      setIsLoading(true);

      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }

      // Abort any previous in-flight request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        // Only send user/assistant messages to Gemini (not system/action logs),
        // and cap to last 20 messages to stay within context limits
        const apiMessages = newMessages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .slice(-20);

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages, currentTheme: mode }),
          signal: controller.signal,
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          setMessages((prev) => [
            ...prev,
            { role: "system", content: `error: ${data.error || res.statusText}` },
          ]);
          return;
        }

        const toolLogs = executeToolCalls(data.toolCalls);

        if (toolLogs.length > 0) {
          for (const log of toolLogs) {
            setMessages((prev) => [
              ...prev,
              { role: "system", content: log, _isAction: true },
            ]);
          }
        }

        if (data.text) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: stripMarkdown(data.text), _isNew: true },
          ]);
        } else if (toolLogs.length > 0) {
          // Gemini returned tool calls but no text. We MUST insert an assistant
          // message so the conversation keeps alternating user/model roles.
          // Without this, Gemini sees consecutive user messages and hallucinates.
          const summary = "Done — " + toolLogs.join(", ") + ".";
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: summary, _isNew: true },
          ]);
        }

        if (!data.text && !data.toolCalls) {
          setMessages((prev) => [
            ...prev,
            { role: "system", content: "no response — try rephrasing" },
          ]);
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        setMessages((prev) => [
          ...prev,
          { role: "system", content: `error: ${err.message}` },
        ]);
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [messages, isLoading, executeToolCalls, flushTypingFlags, mode]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestion = (text) => {
    sendMessage(text);
  };

  const handleTypingComplete = useCallback(() => {
    flushTypingFlags();
  }, [flushTypingFlags]);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <>
      {!isOpen && (
        <motion.button
          className="chat-fab"
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          aria-label="Open chat"
          title="Chat with AI (Ctrl+K)"
        >
          <svg className="chat-fab-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 17L8 13H4V5H20V13H11L7 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="9" cy="9" r="1" fill="currentColor" />
            <circle cx="12" cy="9" r="1" fill="currentColor" />
            <circle cx="15" cy="9" r="1" fill="currentColor" />
          </svg>
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="chat-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className={`chat-sidebar ${mode === "light" ? "chat-light" : ""}`}
              initial={isMobile ? { y: "100%" } : { x: "100%" }}
              animate={isMobile ? { y: 0 } : { x: 0 }}
              exit={isMobile ? { y: "100%" } : { x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              {/* Title bar */}
              <div className="chat-titlebar">
                <button
                  className="chat-close-btn"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
                <span className="chat-titlebar-text">shreyas.terminal</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {messages.length > 0 && (
                    <button
                      className="chat-close-btn"
                      onClick={() => {
                        if (abortRef.current) abortRef.current.abort();
                        setMessages([]);
                        setIsLoading(false);
                      }}
                      aria-label="Clear chat"
                      title="Clear chat"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 3h6M3.5 3V2.25a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75V3M7 3v4.75a.75.75 0 01-.75.75h-2.5a.75.75 0 01-.75-.75V3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}
                  <div className="chat-titlebar-shortcut">
                    <kbd>ctrl+k</kbd>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="chat-messages" onClick={focusInput}>
                {messages.length === 0 && (
                  <motion.div
                    className="chat-welcome"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                  >
                    <div className="chat-welcome-text">
                      Ask me anything about Shreyas, or use the quick actions below.
                    </div>
                    <div className="chat-suggestions">
                      {SUGGESTIONS.map((s, i) => (
                        <motion.button
                          key={s}
                          className="chat-chip"
                          onClick={() => handleSuggestion(s)}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 0.5, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 + i * 0.04 }}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          {s}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {messages.map((msg, i) => {
                  if (msg.role === "assistant") {
                    return (
                      <TypewriterMessage
                        key={i}
                        text={msg.content}
                        animate={!!msg._isNew}
                        onComplete={handleTypingComplete}
                        scrollFn={scrollToBottom}
                      />
                    );
                  }

                  if (msg.role === "system" && msg._isAction) {
                    return (
                      <motion.div
                        key={i}
                        className="chat-msg chat-msg--action"
                        variants={actionVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <span className="chat-action-arrow">&rarr;</span>
                        <span className="chat-msg-text">{msg.content}</span>
                      </motion.div>
                    );
                  }

                  return (
                    <motion.div
                      key={i}
                      className={`chat-msg chat-msg--${msg.role}`}
                      variants={msgVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {msg.role === "user" && (
                        <span className="chat-prompt">&gt; </span>
                      )}
                      <span className="chat-msg-text">{msg.content}</span>
                    </motion.div>
                  );
                })}

                {isLoading && (
                  <motion.div
                    className="chat-msg chat-msg--assistant"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="chat-prompt-ai">$ </span>
                    <span className="chat-block-cursor" />
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form className="chat-input-row" onSubmit={handleSubmit} onClick={focusInput}>
                <span className="chat-input-prompt">&gt;</span>
                <textarea
                  ref={inputRef}
                  className="chat-input"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    autoResize(e.target);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="ask anything..."
                  disabled={isLoading}
                  autoComplete="off"
                  spellCheck="false"
                  rows={1}
                />
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chat;
