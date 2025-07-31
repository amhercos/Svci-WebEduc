import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';

const baseUrl = import.meta.env.BASE_URL || '/';

const animalData = [
  { name: 'cat', image: 'animals/cat.png' },
  { name: 'dog', image: 'animals/dog.png' },
  { name: 'mouse', image: 'animals/mouse.png' },
  { name: 'lion', image: 'animals/lion.png' },
  { name: 'elephant', image: 'animals/elephant.png' },
  { name: 'monkey', image: 'animals/monkey.png' },
  { name: 'cow', image: 'animals/cow.png' },
  { name: 'rabbit', image: 'animals/rabbit.png' },
  { name: 'bear', image: 'animals/bear.png' },
  { name: 'panda', image: 'animals/panda.png' }
];

const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

const generateLevels = (count) => {
  const usedAnimals = shuffleArray(animalData).slice(0, count);
  return usedAnimals.map((animal) => {
    const others = animalData.filter((a) => a.name !== animal.name);
    const wrongOptions = shuffleArray(others).slice(0, 2).map((a) => a.name);
    const allOptions = shuffleArray([animal.name, ...wrongOptions]);
    return {
      image: animal.image,
      correctAnswer: animal.name,
      options: allOptions
    };
  });
};

const AnimalGuessingGame = ({ onComplete }) => {
  const [width, height] = useWindowSize();

  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(null);

  useEffect(() => {
    const loadVoices = () => {
      const allVoices = speechSynthesis.getVoices();
      const bestVoice = allVoices.find(
        (v) =>
          v.lang.toLowerCase().includes('en-us') &&
          v.name.toLowerCase().includes('female')
      ) || allVoices.find(v => v.lang.toLowerCase().includes('en-us'));

      setSelectedVoice(bestVoice);

      if (!levels.length) {
        setLevels(generateLevels(3));
      }
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const speak = (text) => {
    if (speechSynthesis.speaking) speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    speechSynthesis.speak(utterance);
  };

  const handleOptionClick = (option) => {
    setSelected(option);
    const correct = option === levels[currentLevel].correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(correct ? 'Correct!' : 'Oops!');

    setTimeout(() => {
      speechSynthesis.cancel();
      setShowFeedback(null);
      setSelected(null);
      if (correct) {
        if (currentLevel + 1 < levels.length) {
          setCurrentLevel((prev) => prev + 1);
        } else {
          setShowConfetti(true);
          setTimeout(() => {
            onComplete();
          }, 4000);
        }
      }
    }, 1500);
  };

  if (!levels.length) return <div className="text-white">Loading...</div>;
  const current = levels[currentLevel];

  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-pink-300 via-blue-300 to-yellow-200 bg-cover bg-center flex flex-col items-center justify-center text-white px-4 py-8 space-y-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-4">
        What animal is this?
      </h1>

      <img
        src={`${baseUrl}${current.image}`}
        alt="Animal"
        className="w-[500px] h-[500px] object-contain mb-6 drop-shadow-xl"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        {current.options.map((option, index) => (
          <div key={index} className="relative flex flex-col items-center">
            <button
              onClick={() => handleOptionClick(option)}
              className={`px-6 py-4 rounded-xl font-bold text-xl shadow-md transition-transform duration-200 w-full
                ${
                  selected === option
                    ? isCorrect
                      ? 'bg-green-400 scale-105'
                      : 'bg-red-400 scale-105'
                    : 'bg-white text-black hover:bg-blue-100 hover:scale-105'
                }`}
              disabled={!!showFeedback}
            >
              {option}
            </button>
            <button
              onClick={() => speak(option)}
              className="absolute top-[-10px] right-[-10px] bg-yellow-300 hover:bg-yellow-500 text-black rounded-full p-2 shadow-md text-sm"
              aria-label={`Speak ${option}`}
            >
              🔊
            </button>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showFeedback && (
          <motion.div
            key="feedback"
            className={`fixed inset-0 flex items-center justify-center z-50 ${
              isCorrect
                ? 'bg-gradient-to-br from-green-200 via-green-300 to-green-700'
                : 'bg-gradient-to-br from-red-200 via-red-300 to-red-700'
            }`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <motion.img
              src={
                isCorrect
                  ? `${baseUrl}check.png`
                  : `${baseUrl}xmark.png`
              }
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

      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={2000}
          recycle={false}
        />
      )}
    </motion.div>
  );
};

export default AnimalGuessingGame;
