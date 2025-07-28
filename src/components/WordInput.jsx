// src/components/WordInput.jsx

import React from "react";



function WordInput({ currentWord, setCurrentWord, onSubmit }) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/wordInputBackground.jpg')" }} // uses your current background
    >
      <form
        onSubmit={onSubmit}
        className="backdrop-blur-md bg-white/30 border border-white/30 p-6 rounded-2xl shadow-2xl flex gap-4"
      >
        <input
          type="text"
          placeholder="Enter a word"
          value={currentWord}
          onChange={(e) => setCurrentWord(e.target.value)}
          className="px-6 py-2 rounded-xl border border-white/40 text-black bg-white/40 placeholder:text-black/50 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#FCEF91] transition w-60"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-[#FB9E3A] hover:bg-[#E6521F] text-white shadow-md transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default WordInput;
