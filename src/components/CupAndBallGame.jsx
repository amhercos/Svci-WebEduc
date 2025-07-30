import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";

const baseUrl = import.meta.env.BASE_URL;
const cupImg = `${baseUrl}cup.png`;
const ballImg = `${baseUrl}ball.png`;

const CupAndBallGame = ({ onComplete }) => {
  const [positions, setPositions] = useState(["left", "center", "right"]);
  const [ballPosition, setBallPosition] = useState("center");
  const [selectedCup, setSelectedCup] = useState(null);
  const [round, setRound] = useState(1);
  const [showAllCups, setShowAllCups] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [shuffling, setShuffling] = useState(false);

  const maxRounds = 3;

  const positionMap = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  const shufflePositions = () => {
    const newPositions = [...positions];
    for (let i = newPositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newPositions[i], newPositions[j]] = [newPositions[j], newPositions[i]];
    }
    return newPositions;
  };

  const startShuffle = () => {
    setShuffling(true);
    let iterations = 5 + round * 2;
    let delay = 150 - round * 20;

    const shuffle = (count) => {
      if (count <= 0) {
        setShuffling(false);
        return;
      }
      setPositions(shufflePositions());
      setTimeout(() => shuffle(count - 1), delay);
    };

    shuffle(iterations);
  };

  const handleCupClick = (position) => {
    if (shuffling || selectedCup !== null) return;

    setSelectedCup(position);
    setShowAllCups(true);

    const isCorrect = position === ballPosition;
    setFeedback(isCorrect ? "correct" : "incorrect");

    if (isCorrect) {
      if (round === maxRounds) {
        setShowConfetti(true);
        setTimeout(() => {
          setGameFinished(true);
          onComplete();
        }, 3000);
      } else {
        setTimeout(() => {
          setFeedback(null);
          setSelectedCup(null);
          setShowAllCups(false);
          setRound((prev) => prev + 1);
          const newBallPosition = ["left", "center", "right"][
            Math.floor(Math.random() * 3)
          ];
          setBallPosition(newBallPosition);
          startShuffle();
        }, 2000);
      }
    } else {
      // retry same round
      setTimeout(() => {
        setFeedback(null);
        setSelectedCup(null);
        setShowAllCups(false);
        startShuffle();
      }, 2000);
    }
  };

  useEffect(() => {
    startShuffle();
  }, []);

  const renderCup = (positionKey) => {
    const isSelected = selectedCup === positionKey;
    const hasBall = ballPosition === positionKey;

    return (
      <div
        key={positionKey}
        className={`flex flex-col items-center ${
          positionMap[positionKey]
        } w-1/3 transition-transform duration-500`}
      >
        <div
          className="cursor-pointer relative"
          onClick={() => handleCupClick(positionKey)}
        >
          <motion.img
            src={cupImg}
            alt="Cup"
            initial={{ y: 0 }}
            animate={{
              y:
                showAllCups && hasBall
                  ? -50
                  : showAllCups && !hasBall
                  ? -30
                  : 0,
            }}
            transition={{ duration: 0.3 }}
            className="w-24 md:w-32"
          />
          {showAllCups && hasBall && (
            <img
              src={ballImg}
              alt="Ball"
              className="absolute top-full left-1/2 -translate-x-1/2 w-10 md:w-12 mt-2"
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-yellow-300 flex items-center justify-center relative">
      {showConfetti && <Confetti width={windowWidth} height={windowHeight} />}

      <div className="text-center absolute top-6 left-1/2 transform -translate-x-1/2">
        <h2 className="text-2xl md:text-3xl font-bold text-orange-700">
          Round {round} of {maxRounds}
        </h2>
      </div>

      <div className="flex justify-between items-end w-full max-w-3xl px-8">
        {positions.map((position) => renderCup(position))}
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className={`absolute bottom-32 text-2xl md:text-3xl font-bold px-6 py-4 rounded-xl ${
              feedback === "correct"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {feedback === "correct" ? "Correct! 🎉" : "Wrong Cup! Try Again 🔁"}
          </motion.div>
        )}
      </AnimatePresence>

      {gameFinished && (
        <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center text-center p-4 z-30">
          <h2 className="text-4xl font-bold text-green-700 mb-4">
            Great job! 🎉
          </h2>
          <p className="text-lg text-gray-700">
            You finished all 3 rounds of the Cup and Ball game!
          </p>
          <button
            onClick={onComplete}
            className="mt-6 px-6 py-3 bg-green-500 text-white font-semibold rounded-xl shadow-lg hover:bg-green-600 transition"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};

export default CupAndBallGame;
