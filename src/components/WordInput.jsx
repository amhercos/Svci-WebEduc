import React from "react";

function WordInput({ currentWord, setCurrentWord, onSubmit }) {
  const baseUrl = import.meta.env.BASE_URL;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-cover bg-center bg-no-repeat px-4"
      style={{ backgroundImage: `url(${baseUrl}wordInputBackground.jpg)` }}
    >
      <form
        onSubmit={onSubmit}
        className="backdrop-blur-md bg-white/30 border border-white/30 p-4 sm:p-6 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full max-w-md"
      >
        <input
          type="text"
          placeholder="Enter a word"
          value={currentWord}
          onChange={(e) => setCurrentWord(e.target.value)}
          className="w-full sm:w-60 px-4 sm:px-6 py-2 text-base rounded-xl border border-white/40 text-black bg-white/40 placeholder:text-black/50 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#FCEF91] transition"
        />
        <button
          type="submit"
          className="w-full sm:w-auto px-4 py-2 text-base rounded-xl bg-[#FB9E3A] hover:bg-[#E6521F] text-white shadow-md transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default WordInput;
