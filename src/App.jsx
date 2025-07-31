// src/App.jsx
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Confetti from 'react-confetti';

import WordInput from './components/WordInput';
import WordDisplay from './components/WordDisplay';
import ChestSelection from './components/ChestSelection';
import AnimalSoundGame from './components/AnimalSoundGame';
import GameIntro from './components/GameIntro';
import OddColorGame from './components/OddColorGame';
import PokemonGame from './components/PokemonGame';
import AnimalGuessingGame from './components/AnimalGuessingGame';
import CupAndBallGame from './components/CupAndBallGame';

function App() {
  const [currentWord, setCurrentWord] = useState('');
  const [showWord, setShowWord] = useState(false);
  const [chestResult, setChestResult] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [hasReadWord, setHasReadWord] = useState(false);
  const [showGameIntro, setShowGameIntro] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

  const miniGames = [
    { title: 'Find the Odd Color', component: OddColorGame },
    { title: 'You Caught a Pokemon!', component: PokemonGame },
    { title: "What's the Animal?", component: AnimalGuessingGame },
    // { title: 'Cup and Ball Shuffle', component: CupAndBallGame },
  ];

  const handleWordSubmit = (e) => {
    e.preventDefault();
    if (currentWord.trim() !== '') {
      setShowWord(true);
      setChestResult(null);
      setGameComplete(false);
      setHasReadWord(false);
    }
  };

  const handleWordRead = () => {
    setHasReadWord(true);
  };

  const handleChestClick = () => {
    const weightedOptions = [
      { value: 'game', weight: 60 },
      { value: 'chocolate', weight: 20 },
      { value: 'sticker', weight: 20 },
    ];

    const totalWeight = weightedOptions.reduce((sum, option) => sum + option.weight, 0);
    const random = Math.random() * totalWeight;

    let cumulative = 0;
    let result = weightedOptions[0].value;

    for (const option of weightedOptions) {
      cumulative += option.weight;
      if (random < cumulative) {
        result = option.value;
        break;
      }
    }

    setChestResult(result);

    if (result === 'game') {
      const randomGame = miniGames[Math.floor(Math.random() * miniGames.length)];
      setSelectedGame(randomGame);
      setShowGameIntro(true);
    }
  };

  const handleGameComplete = () => {
    setGameComplete(true);
    resetGame();
  };

  const handleRewardClaim = () => {
    resetGame();
  };

  const resetGame = () => {
    setShowWord(false);
    setCurrentWord('');
    setChestResult(null);
    setHasReadWord(false);
    setShowGameIntro(false);
    setSelectedGame(null);
    setGameComplete(false);
  };

  const fadeTransition = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.5 },
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center text-center px-4 sm:px-6 md:px-8">
      <AnimatePresence mode="wait">
        {!showWord && (
          <motion.div
            key="wordInput"
            {...fadeTransition}
            className="absolute inset-0 flex items-center justify-center"
          >
            <WordInput
              currentWord={currentWord}
              setCurrentWord={setCurrentWord}
              onSubmit={handleWordSubmit}
            />
          </motion.div>
        )}

        {showWord && (
          <>
            {!hasReadWord && (
              <motion.div
                key="wordDisplay"
                {...fadeTransition}
                className="absolute inset-0 flex items-center justify-center flex-col"
              >
                <WordDisplay word={currentWord} />
                <div className="absolute bottom-10 sm:bottom-16 md:bottom-20 w-full flex justify-center z-20">
                  <button
                    onClick={handleWordRead}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-[#FFB4B4]/30 text-white text-lg sm:text-xl font-semibold rounded-xl shadow-xl transition backdrop-blur-sm hover:bg-[#E14434]/40"
                  >
                    I’ve read the word!
                  </button>
                </div>
              </motion.div>
            )}

            {hasReadWord && !chestResult && (
              <motion.div key="chestSelection" {...fadeTransition}>
                <ChestSelection onChestClick={handleChestClick} />
              </motion.div>
            )}

            {chestResult && chestResult !== 'game' && (
              <motion.div
                key="reward"
                {...fadeTransition}
                className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-200 px-4"
              >
                <Confetti
                  width={window.innerWidth}
                  height={window.innerHeight}
                  numberOfPieces={350}
                  recycle={false}
                />
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="text-center"
                >
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-rose-600 drop-shadow-md mb-6">
                    🎉 You got a {chestResult === 'chocolate' ? '🍫 Chocolate' : '⭐ Sticker'}!
                  </h1>
                  <button
                    onClick={handleRewardClaim}
                    className="relative top-4 sm:top-6 px-4 sm:px-6 py-2 sm:py-3 bg-rose-500 hover:bg-rose-600 text-white text-base sm:text-lg rounded-xl shadow-lg transition"
                  >
                    Next Word
                  </button>
                </motion.div>
              </motion.div>
            )}

            {chestResult === 'game' && selectedGame && !gameComplete && (
              <>
                {showGameIntro ? (
                  <motion.div
                    key="gameIntro"
                    {...fadeTransition}
                    className="absolute inset-0 flex items-center justify-center z-30 px-4"
                  >
                    <GameIntro
                      onContinue={() => setShowGameIntro(false)}
                      gameTitle={selectedGame.title}
                    />
                  </motion.div>
                ) : (
                  <motion.div key="gameComponent" {...fadeTransition}>
                    <selectedGame.component onComplete={handleGameComplete} />
                  </motion.div>
                )}
              </>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
