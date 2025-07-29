import { motion, AnimatePresence } from "framer-motion";

const fadeTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.6 },
};

function GameIntro({ onContinue, gameTitle }) {
  return (
    <AnimatePresence>
      <motion.div
        key="game-intro"
        {...fadeTransition}
        className="absolute inset-0 flex flex-col items-center justify-center z-20 px-4 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-200"
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-center"
        >
          <h2 className="text-2xl sm:text-3xl mb-2 text-blue-700 font-semibold">
            🎮 Let's Play a Game!
          </h2>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-indigo-600 drop-shadow-md mb-4">
            {gameTitle}
          </h1>
          <p className="text-lg sm:text-xl mb-6 text-gray-700">Are you ready?</p>
          <button
            onClick={onContinue}
            className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white text-lg sm:text-xl rounded-xl shadow-md transition"
          >
            🚀 Start Game
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default GameIntro;
