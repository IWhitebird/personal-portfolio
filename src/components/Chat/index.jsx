import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MyContext } from "../../MyContext";
import useTypewriter from "../../hooks/useTypewriter";
import useWindowSize from "../../hooks/useWindowSize";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";
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
  "Download resume",
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
    <div
      className={`chat-msg chat-msg--assistant ${isTyping ? "chat-msg--typing" : ""}`}
      onClick={isTyping ? skipToEnd : undefined}
    >
      <span className="chat-prompt-ai">$ </span>
      <span className="chat-msg-text">
        {animate ? displayedText : text}
        {isTyping && <span className="chat-block-cursor" />}
      </span>
    </div>
  );
};

const Chat = ({ onToggleTheme }) => {
  const { mode } = useContext(MyContext);
  const { width } = useWindowSize();
  const isMobile = width <= 768;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
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
          a.href = "/Shreyas_Resume.pdf";
          a.download = "Shreyas_Resume.pdf";
          a.click();
          return "downloading resume";
        }
        case "toggle_theme": {
          onToggleTheme?.();
          return "toggled theme";
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
    [onToggleTheme]
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

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages }),
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
        }

        if (!data.text && !data.toolCalls) {
          setMessages((prev) => [
            ...prev,
            { role: "system", content: "no response — try rephrasing" },
          ]);
        }
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          { role: "system", content: `error: ${err.message}` },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, executeToolCalls, flushTypingFlags]
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
                <div className="chat-titlebar-shortcut">
                  <kbd>ctrl+k</kbd>
                </div>
              </div>

              {/* Messages */}
              <div className="chat-messages">
                {messages.length === 0 && (
                  <div className="chat-welcome">
                    <div className="chat-welcome-text">
                      Ask me anything about Shreyas, or use the quick actions below.
                    </div>
                    <div className="chat-suggestions">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          className="chat-chip"
                          onClick={() => handleSuggestion(s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
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
                      <div key={i} className="chat-msg chat-msg--action">
                        <span className="chat-action-arrow">&rarr;</span>
                        <span className="chat-msg-text">{msg.content}</span>
                      </div>
                    );
                  }

                  return (
                    <div key={i} className={`chat-msg chat-msg--${msg.role}`}>
                      {msg.role === "user" && (
                        <span className="chat-prompt">&gt; </span>
                      )}
                      <span className="chat-msg-text">{msg.content}</span>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="chat-msg chat-msg--assistant">
                    <span className="chat-prompt-ai">$ </span>
                    <span className="chat-block-cursor" />
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form className="chat-input-row" onSubmit={handleSubmit} onClick={focusInput}>
                <span className="chat-input-prompt">&gt;</span>
                <div className="chat-input-display">
                  <input
                    ref={inputRef}
                    className="chat-input-hidden"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    disabled={isLoading}
                    autoComplete="off"
                    spellCheck="false"
                  />
                  <span className="chat-input-text">
                    {input || (!isLoading && !inputFocused && (
                      <span className="chat-input-placeholder">ask anything...</span>
                    ))}
                  </span>
                  {!isLoading && inputFocused && (
                    <span className="chat-block-cursor chat-input-block-cursor" />
                  )}
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chat;
