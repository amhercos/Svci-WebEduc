import React, { useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';

function WordInput({ currentWord, setCurrentWord, onSubmit, onPlayClickSound }) {
  const [showCredits, setShowCredits] = useState(false);
  const base = import.meta.env.BASE_URL;

  const handleSubmit = (e) => {
    onSubmit(e);
    onPlayClickSound();
  };

  const authors = [
    "Althea Nikka",
    "Cherry Mae",
    "Cheryl",
  ];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-cover bg-center bg-no-repeat px-4 font-sans"
      style={{ backgroundImage: `url('${base}wordInputBackground.jpg')` }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white/20 border border-white/20 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center gap-4 w-full max-w-lg transition-all duration-300"
      >
        <input
          type="text"
          placeholder="Enter a word"
          value={currentWord}
          onChange={(e) => setCurrentWord(e.target.value)}
          className="w-full sm:w-80 px-5 py-3 text-lg rounded-xl border border-white/60 text-gray-800 bg-white/70 placeholder:text-gray-500 shadow-inner focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
        />
        <button
          type="submit"
          className="w-full sm:w-auto px-8 py-3 text-lg font-semibold rounded-xl bg-sky-500 hover:bg-sky-600 text-white shadow-md transition-all duration-200"
        >
          Submit
        </button>
      </form>

      {/* Credits Button */}
      <button
        onClick={() => setShowCredits(true)}
        className="fixed bottom-6 right-6 text-white text-2xl font-light p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors duration-200"
        aria-label="Show Credits"
      >
        ©
      </button>

      {/* Credits Pop-up */}
      <AnimatePresence>
        {showCredits && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative p-8 rounded-2xl bg-white/80 shadow-2xl w-full max-w-sm text-center"
            >
              <button
                onClick={() => setShowCredits(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <h2 className="text-3xl font-bold mb-4 text-gray-800 tracking-wider"></h2>
              <div className="font-light text-xl text-gray-700 space-y-2">
                {authors.map((author, index) => (
                  <div key={index} className=" font-bold py-2 rounded-lg">
                    {author}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default WordInput;