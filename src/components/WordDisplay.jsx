// src/components/WordDisplay.jsx
import React from "react";

function WordDisplay({ word }) {
  return (
    <div
      className="absolute inset-0 bg-cover bg-center bg-no-repeat flex items-center justify-center px-4"
      style={{ backgroundImage: "url('/wordInputBackground.jpg')" }}
    >
      <h2
        className="text-[3rem] sm:text-[5rem] md:text-[8rem] lg:text-[12rem] xl:text-[16rem] font-extrabold text-[#5EABD6] tracking-wide uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] text-center break-words"
      >
        {word}
      </h2>
    </div>
  );
}

export default WordDisplay;
