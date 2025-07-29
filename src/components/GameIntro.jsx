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
        className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-200 px-4"
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-center"
        >
          <h2 className="text-2xl sm:text-3xl mb-2 text-rose-500 font-semibold drop-shadow-sm">
            🎮 Let's Play a Game!
          </h2>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-extrabold text-rose-600 drop-shadow-md mb-6">
            {gameTitle}
          </h1>

          <p className="text-lg sm:text-xl mb-6 text-gray-700">
            Are you ready?
          </p>

          <button
            onClick={onContinue}
            className="relative top-4 sm:top-6 px-6 sm:px-8 py-3 sm:py-4 bg-rose-500 hover:bg-rose-600 text-white text-lg sm:text-xl rounded-xl shadow-lg transition"
          >
            🚀 Start Game
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default GameIntro;
