import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';

// Helper function to generate a random color
const generateRandomColor = () => {
  const r = Math.floor(Math.random() * 200);
  const g = Math.floor(Math.random() * 200);
  const b = Math.floor(Math.random() * 200);
  return `rgb(${r},${g},${b})`;
};

// Helper function to slightly adjust a color for stroke
const adjustColorForStroke = (rgbColor) => {
  const channels = rgbColor.match(/\d+/g).map(Number);
  const r = Math.min(channels[0] + 30, 255);
  const g = Math.min(channels[1] + 30, 255);
  const b = Math.min(channels[2] + 30, 255);
  return `rgb(${r},${g},${b})`;
};

// Function to generate a random polygon SVG path
const generateRandomPolygon = (id) => {
  const sides = Math.floor(Math.random() * 6) + 3; // 3 to 8 sides (triangle to octagon)
  const radius = 40;
  const centerX = 50;
  const centerY = 50;
  let points = '';

  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI / 180) * (360 / sides) * i - Math.PI / 2; // Start from top
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points += `${x},${y} `;
  }

  const fillColor = generateRandomColor();
  const strokeColor = adjustColorForStroke(fillColor);

  return {
    id: `polygon-${id}-${sides}-${fillColor}`, // Unique ID for comparison
    name: `Polygon with ${sides} sides`, // Descriptive name (not used for matching)
    svg: `<polygon points="${points.trim()}" fill="${fillColor}" stroke="${strokeColor}" strokeWidth="3"/>`,
    fillColor: fillColor, // Store colors for potential future use
    strokeColor: strokeColor,
  };
};

// Helper function to shuffle an array
const shuffleArray = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
};

// Define total levels as a constant for easy editing
const TOTAL_LEVELS = 4; // You can change this value to set the number of game levels

// Main App component for the game
function App({ onComplete }) {
  const baseUrl = import.meta.env.BASE_URL;
  const [width, height] = useWindowSize();

  const [targetShape, setTargetShape] = useState(null);
  const [shapeChoices, setShapeChoices] = useState([]);
  const [feedback, setFeedback] = useState(null); // 'correct', 'incorrect', or null
  // Removed score state: const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Function to advance to the next round or complete the game
  const advanceRound = useCallback(() => {
    setFeedback(null); // Clear feedback for the new round
    setRound(prevRound => {
      const nextRound = prevRound + 1;
      if (nextRound > TOTAL_LEVELS) {
        setGameComplete(true); // Trigger game completion
        return prevRound; // Don't increment beyond TOTAL_LEVELS
      }

      // Generate a new random target shape
      const newTargetShape = generateRandomPolygon(nextRound);
      setTargetShape(newTargetShape);

      // Create a set of choices including the target shape and some random others
      let choices = [newTargetShape];
      let uniqueIds = new Set([newTargetShape.id]);

      while (choices.length < 4) { // Ensure 4 choices (including the target)
        const randomShape = generateRandomPolygon(Math.random()); // Use random ID for choices
        if (!uniqueIds.has(randomShape.id)) { // Check for uniqueness based on ID
          choices.push(randomShape);
          uniqueIds.add(randomShape.id);
        }
      }
      setShapeChoices(shuffleArray(choices));
      return nextRound;
    });
  }, []);

  // Effect to start the very first round when the component mounts
  useEffect(() => {
    advanceRound();
  }, [advanceRound]);

  // Effect to trigger confetti and onComplete when game is complete
  useEffect(() => {
    if (gameComplete) {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        onComplete?.(); // Call onComplete prop if provided
      }, 6000); // Confetti duration
    }
  }, [gameComplete, onComplete]);

  // Handler for when a shape choice is clicked
  const handleShapeClick = (clickedShape) => {
    if (gameComplete || feedback !== null) return; // Prevent clicks if game is complete or feedback is showing

    if (clickedShape.id === targetShape.id) { // Compare by unique ID for generated shapes
      setFeedback('correct');
      // Removed score increment: setScore(prevScore => prevScore + 1);
      setTimeout(() => {
        advanceRound(); // Advance to next round
      }, 1000);
    } else {
      setFeedback('incorrect');
      // No automatic advance, allow user to retry
      setTimeout(() => {
        setFeedback(null); // Clear feedback to allow another try
      }, 1000);
    }
  };

  // The restartGame function is no longer called from the completion screen
  // It's kept here in case you want to manually trigger a restart from elsewhere
  const restartGame = () => {
    // Removed score reset: setScore(0);
    setRound(0); // Reset round to 0
    setGameComplete(false); // Reset game completion status
    setFeedback(null);
    setShowConfetti(false);
    advanceRound(); // Start a new game
  };

  return (
    <motion.div
      className="fixed inset-0 overflow-hidden flex flex-col items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${baseUrl}gameBackground.jpg)` }}
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

      <h1 className="text-5xl font-extrabold text-black drop-shadow-lg mb-8">
        Shape Match Challenge! 🎨
      </h1>

      {!gameComplete ? (
        <>
          

          <div className="mb-12">
            <p className="text-3xl text-gray-800 mb-6 font-bold">
              Find the shape that matches this:
            </p>
            {targetShape && (
              <motion.div
                key={targetShape.id} // Key for animation on shape change
                className="w-48 h-48 rounded-full mx-auto shadow-2xl border-4 border-gray-400 flex items-center justify-center transform transition-transform duration-300 hover:scale-105 bg-white/70 backdrop-blur-sm"
                dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 100 100" class="w-36 h-36">${targetShape.svg}</svg>` }}
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              ></motion.div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-12 max-w-full"> {/* Changed to flex for horizontal layout */}
            {shapeChoices.map((shape, index) => (
              <motion.button
                key={shape.id} // Use shape.id as key
                className={`w-32 h-32 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-75 flex items-center justify-center bg-white/80 backdrop-blur-sm
                  ${feedback === 'correct' && shape.id === targetShape.id ? 'ring-green-500 ring-8' : ''}
                  ${feedback === 'incorrect' && shape.id !== targetShape.id ? 'ring-red-500 ring-8' : ''}
                  ${feedback === 'incorrect' && shape.id === targetShape.id ? 'ring-yellow-500 ring-8 animate-pulse' : ''}
                `}
                onClick={() => handleShapeClick(shape)}
                disabled={feedback !== null}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4, type: 'spring', stiffness: 150 }}
              >
                <svg viewBox="0 0 100 100" className="w-24 h-24" dangerouslySetInnerHTML={{ __html: shape.svg }}></svg> {/* Adjusted SVG size */}
              </motion.button>
            ))}
          </div>

          {/* Feedback Modal */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                key="feedback-modal"
                className={`fixed inset-0 flex items-center justify-center z-50 ${
                  feedback === 'correct'
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
                    feedback === 'correct'
                      ? `${baseUrl}check.png`
                      : `${baseUrl}xmark.png`
                  }
                  alt="Feedback Icon"
                  className="w-48 h-48 mb-6 drop-shadow-2xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1.4 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                />
                <p className="absolute bottom-20 text-white text-4xl font-extrabold drop-shadow-md">
                  {feedback === 'correct' ? 'Fantastic!' : 'Oops! Try Again!'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <motion.div
          key="congratulations-screen"
          className="text-center bg-white/70 backdrop-blur-md p-10 rounded-3xl shadow-2xl border-4 border-yellow-300"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <h2 className="text-5xl font-extrabold text-purple-700 mb-6 drop-shadow-lg">
            🌟 Congratulations! 🌟
          </h2>
          <p className="text-3xl text-gray-800 mb-8">
            You matched all the shapes! {/* Removed score message */}
          </p>
          {/* Removed the "Play Again" button here */}
        </motion.div>
      )}
    </motion.div>
  );
}

export default App;
