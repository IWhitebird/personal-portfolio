import { useState, useEffect, useRef, useCallback } from 'react';

function useTypewriter(fullText, speed = 50, enabled = true) {
  const [charIndex, setCharIndex] = useState(0);
  const charIndexRef = useRef(0);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);
  const intervalMs = 1000 / speed;

  const skipToEnd = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    charIndexRef.current = fullText?.length || 0;
    setCharIndex(charIndexRef.current);
  }, [fullText]);

  useEffect(() => {
    if (!enabled || !fullText) {
      charIndexRef.current = fullText ? fullText.length : 0;
      setCharIndex(charIndexRef.current);
      return;
    }

    charIndexRef.current = 0;
    setCharIndex(0);
    lastTimeRef.current = null;

    const step = (timestamp) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }

      const elapsed = timestamp - lastTimeRef.current;
      const charsToAdd = Math.floor(elapsed / intervalMs);

      if (charsToAdd > 0) {
        const next = Math.min(charIndexRef.current + charsToAdd, fullText.length);
        charIndexRef.current = next;
        setCharIndex(next);
        lastTimeRef.current = timestamp;

        if (next >= fullText.length) {
          rafRef.current = null;
          return;
        }
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [fullText, speed, enabled, intervalMs]);

  return {
    displayedText: fullText ? fullText.slice(0, charIndex) : '',
    isTyping: charIndex < (fullText?.length ?? 0),
    skipToEnd,
  };
}

export default useTypewriter;
