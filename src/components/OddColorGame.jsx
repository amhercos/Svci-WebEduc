import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';

const TOTAL_LEVELS = 3;
const INITIAL_TIMER = 20;

const generateRandomColor = () => {
  const randomChannel = () => Math.floor(Math.random() * 200);
  return `rgb(${randomChannel()}, ${randomChannel()}, ${randomChannel()})`;
};

const generateOddColor = (baseColor) => {
  const channels = baseColor.match(/\d+/g).map(Number);
  const index = Math.floor(Math.random() * 3);
  channels[index] = Math.min(channels[index] + 40, 255);
  return `rgb(${channels.join(',')})`;
};

const generateLevel = () => {
  const baseColor = generateRandomColor();
  const oddColor = generateOddColor(baseColor);
  const oddIndex = Math.floor(Math.random() * 5);
  const colors = Array(5).fill(baseColor);
  colors[oddIndex] = oddColor;
  return { colors, oddIndex };
};

const OddColorGame = ({ onComplete }) => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [levels, setLevels] = useState([]);
  const [optionDisabled, setOptionDisabled] = useState(false);
  const [showFeedback, setShowFeedback] = useState(null);
  const [timer, setTimer] = useState(INITIAL_TIMER);
  const [gameFinished, setGameFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [width, height] = useWindowSize();
  const intervalRef = useRef(null);

  useEffect(() => {
    const newLevels = Array.from({ length: TOTAL_LEVELS }, generateLevel);
    setLevels(newLevels);
  }, []);

  useEffect(() => {
    if (!levels.length || gameFinished) return;
    startTimer();
    return () => clearInterval(intervalRef.current);
  }, [currentLevel, levels.length, gameFinished]);

  const startTimer = () => {
    setTimer(INITIAL_TIMER);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          clearInterval(intervalRef.current);
          handleTimeout();
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeout = () => {
    setOptionDisabled(true);
    setShowFeedback('⏰ Time’s up!');
    advanceToNextLevel();
  };

  const handleChoice = (index) => {
    if (optionDisabled) return;
    clearInterval(intervalRef.current);
    setOptionDisabled(true);

    const isCorrect = index === levels[currentLevel].oddIndex;
    setShowFeedback(isCorrect ? 'Correct!' : 'Try Again');

    setTimeout(() => {
      setShowFeedback(null);
      if (isCorrect) {
        advanceToNextLevel();
      } else {
        setOptionDisabled(false);
        startTimer();
      }
    }, 1000);
  };

  const advanceToNextLevel = () => {
    setTimeout(() => {
      setShowFeedback(null);
      const nextLevel = currentLevel + 1;
      if (nextLevel < levels.length) {
        setCurrentLevel(nextLevel);
        setOptionDisabled(false);
      } else {
        triggerGameFinishedCelebration();
      }
    }, 1000);
  };

  const triggerGameFinishedCelebration = () => {
    setGameFinished(true);
    setShowConfetti(true);

    setTimeout(() => {
      setShowConfetti(false);
      onComplete?.();
    }, 6000);
  };

  if (levels.length === 0) return <div>Loading...</div>;
  const currentColors = levels[currentLevel].colors;

  return (
    <motion.div
      className="fixed inset-0 overflow-hidden flex flex-col items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/gameBackground.jpg')" }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
    >
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={2000}
          gravity={0.3}
          recycle={false}
        />
      )}

      <motion.h2 className="text-3xl font-bold mb-6 text-center text-black drop-shadow">
        Find the odd color
      </motion.h2>

      <motion.div
        key={currentLevel}
        className="flex flex-wrap justify-center items-center gap-4 w-full mb-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {currentColors.map((color, index) => (
          <motion.button
            key={index}
            className="rounded-xl w-[80px] h-[80px] sm:w-[140px] sm:h-[240px] flex items-end justify-center p-1 shadow-lg transition-transform text-white text-xl font-bold"
            style={{ backgroundColor: color }}
            onClick={() => handleChoice(index)}
            disabled={optionDisabled}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            {index + 1}
          </motion.button>
        ))}
      </motion.div>

      <p className="text-lg font-semibold text-black drop-shadow mb-2">
        Time left: {timer}s
      </p>

      <AnimatePresence>
        {showFeedback && (
          <motion.div
            key="feedback"
            className={`fixed inset-0 flex items-center justify-center z-50 ${
              showFeedback.includes('Correct')
                ? 'bg-gradient-to-br from-green-200 via-green-300 to-green-700'
                : 'bg-gradient-to-br from-red-200 via-red-300 to-red-700'
            }`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <motion.img
              src={showFeedback.includes('Correct') ? '/check.png' : '/xmark.png'}
              alt="Feedback Icon"
              className="w-40 h-40 mb-4 drop-shadow-2xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1.4 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            />
            <p className="absolute bottom-20 text-white text-3xl font-extrabold drop-shadow-md">
              {showFeedback}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OddColorGame;
