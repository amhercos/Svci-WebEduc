// src/components/WordDisplay.jsx
import React from "react";

function WordDisplay({ word }) {
  return (
    <div
      className="absolute inset-0 bg-cover bg-center bg-no-repeat flex items-center justify-center"
      style={{ backgroundImage: "url('/wordInputBackground.jpg')" }}
    >
      <h2 className="mb-12 text-[16rem] font-extrabold text-[#5EABD6] tracking-wide uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
        {word}
      </h2>
    </div>
  );
}

export default WordDisplay;
