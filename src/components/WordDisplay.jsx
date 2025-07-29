import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

function WordDisplay({ word }) {
  const baseUrl = import.meta.env.BASE_URL;

  const textRef = useRef(null);
  const [adjustedFontSize, setAdjustedFontSize] = useState("");
  const [adjustedLineHeight, setAdjustedLineHeight] = useState("");

  const isSingleWord = word.trim().split(/\s+/).length === 1;
  const characterCount = word.length;

  useEffect(() => {
    const calculateFontSize = () => {
      const el = textRef.current;
      if (!el) return;

      let fontSize;

      // Base font sizes depending on word length
      if (isSingleWord) {
        if (characterCount <= 6) fontSize = 190;
        else if (characterCount <= 10) fontSize = 150;
        else fontSize = 100;
      } else {
        fontSize = 120;
      }

      el.style.fontSize = `${fontSize}px`;

      const parentWidth = el.parentElement.offsetWidth;
      const textWidth = el.scrollWidth;

      // Shrink if it overflows
      while (textWidth > parentWidth && fontSize > 24) {
        fontSize -= 1;
        el.style.fontSize = `${fontSize}px`;
      }

      setAdjustedFontSize(`${fontSize}px`);
      setAdjustedLineHeight(`${Math.max(fontSize * 1.1, 1.1)}px`);
    };

    calculateFontSize();
    window.addEventListener("resize", calculateFontSize);
    return () => window.removeEventListener("resize", calculateFontSize);
  }, [word, isSingleWord, characterCount]);

  return (
    <div
      className="absolute inset-0 bg-cover bg-center bg-no-repeat flex items-center justify-center px-4"
      style={{ backgroundImage: `url(${baseUrl}wordInputBackground.jpg)` }}
    >
      <div className="w-full max-w-screen-xl">
        <motion.h2
          ref={textRef}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [0.8, 1.1, 1], opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center font-extrabold text-[#489bcb] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
          style={{
            fontSize: adjustedFontSize,
            lineHeight: adjustedLineHeight,
            whiteSpace: isSingleWord ? "nowrap" : "normal",
            overflow: "hidden",
            wordBreak: isSingleWord ? "break-word" : "normal",
            hyphens: "auto",
          }}
        >
          {word}
        </motion.h2>
      </div>
    </div>
  );
}

export default WordDisplay;
