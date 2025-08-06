import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';

// --- Helper Functions and Constants ---

const TOTAL_CUPS = 3;
const SHUFFLE_COUNT = 3; 
const baseUrl = import.meta.env.BASE_URL || '/';

// Color palette for the cups. Each object defines a top and bottom gradient color.
const colorPalettes = [
  { top: '#3B82F6', bottom: '#2563EB' }, // Blue
  { top: '#EC4899', bottom: '#DB2777' }, // Pink
  { top: '#10B981', bottom: '#059669' }, // Green
  { top: '#8B5CF6', bottom: '#7C3AED' }, // Purple
  { top: '#F97316', bottom: '#EA580C' }, // Orange
];

// A simple function to create a delay using async/await
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Creates the initial state for the cups, placing the ball randomly
const createInitialCups = () => {
  const ballPosition = Math.floor(Math.random() * TOTAL_CUPS);
  return Array.from({ length: TOTAL_CUPS }, (_, i) => ({
    id: i + 1,
    order: i, // Represents the visual position (0, 1, 2)
    hasBall: i === ballPosition,
    isLifted: false,
    y: 0, // For vertical movement during shuffle
    zIndex: 0, // To ensure moving cups are on top
  }));
};


// --- SVG Components for Game Assets ---

// The CupIcon now accepts a 'color' prop to dynamically set its gradient.
const CupIcon = ({ isLifted, color, ...props }) => (
  <motion.div
    {...props}
    className="relative drop-shadow-lg cursor-pointer"
    initial={{ y: 0 }}
    animate={{ y: isLifted ? -60 : 0 }} // Lifts the cup up for reveal
    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
  >
    <svg width="250" height="200" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 110H100L110 50H10V50L20 110Z" fill="url(#paint0_linear_101_2)"/>
      <path d="M10 50H110V40C110 28.9543 101.046 20 90 20H30C18.9543 20 10 28.9543 10 40V50Z" fill={color.bottom}/>
      <circle cx="60" cy="20" r="15" fill={color.bottom}/>
      <defs>
        <linearGradient id="paint0_linear_101_2" x1="60" y1="20" x2="60" y2="110" gradientUnits="userSpaceOnUse">
          <stop stopColor={color.top}/>
          <stop offset="1" stopColor={color.bottom}/>
        </linearGradient>
      </defs>
    </svg>
  </motion.div>
);

const BallIcon = (props) => (
  <motion.div {...props} className="absolute bottom-[-10px] z-0">
     <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="url(#paint0_radial_101_3)"/>
        <defs>
            <radialGradient id="paint0_radial_101_3" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(65 35) rotate(90) scale(45)">
                <stop stopColor="#F87171"/>
                <stop offset="1" stopColor="#DC2626"/>
            </radialGradient>
        </defs>
    </svg>
  </motion.div>
);


// --- Main Game Component ---

const CupAndBallGame = ({ onComplete }) => {
  const [width, height] = useWindowSize();
  const [cups, setCups] = useState(createInitialCups);
  const [gamePhase, setGamePhase] = useState('start'); // 'start', 'covering', 'shuffling', 'choosing', 'revealed'
  const [message, setMessage] = useState('Follow the ball!');
  const [showConfetti, setShowConfetti] = useState(false);
  // State to hold the current color of the cups for this game round.
  const [cupColor, setCupColor] = useState(colorPalettes[0]);

  // Set a random color when the component first loads.
  useEffect(() => {
    setCupColor(colorPalettes[Math.floor(Math.random() * colorPalettes.length)]);
  }, []);

  // Resets the game to its initial state and picks a new random color.
  const resetGame = () => {
    setCupColor(colorPalettes[Math.floor(Math.random() * colorPalettes.length)]);
    setCups(createInitialCups());
    setGamePhase('start');
    setMessage('Follow the ball!');
    setShowConfetti(false);
  };

  // The main shuffle logic, with a visible arc motion
  const handleShuffle = async () => {
    setGamePhase('covering');
    setMessage('Watch carefully...');
    await sleep(1500);

    setGamePhase('shuffling');
    setMessage('Shuffling...');
    await sleep(500);

    let lastSwap = [-1, -1];

    for (let i = 0; i < SHUFFLE_COUNT; i++) {
      let pos1 = Math.floor(Math.random() * TOTAL_CUPS);
      let pos2 = Math.floor(Math.random() * TOTAL_CUPS);

      while (pos1 === pos2 || (pos1 === lastSwap[0] && pos2 === lastSwap[1]) || (pos1 === lastSwap[1] && pos2 === lastSwap[0])) {
        pos1 = Math.floor(Math.random() * TOTAL_CUPS);
        pos2 = Math.floor(Math.random() * TOTAL_CUPS);
      }
      lastSwap = [pos1, pos2];

      // Step 1: Lift the two cups that will be swapped
      setCups(prev => prev.map(c => (c.order === pos1 || c.order === pos2) ? { ...c, zIndex: 1, y: -70 } : c ));
      await sleep(1000);

      // Step 2: Swap their order property, triggering the layout animation
      setCups(prev => {
        const cup1 = prev.find(c => c.order === pos1);
        const cup2 = prev.find(c => c.order === pos2);
        return prev.map(c => {
          if (c.id === cup1.id) return { ...c, order: pos2 };
          if (c.id === cup2.id) return { ...c, order: pos1 };
          return c;
        });
      });
      await sleep(1000); // Wait for horizontal swap to complete

      // Step 3: Lower the cups back to their positions
      setCups(prev => prev.map(c => ({ ...c, zIndex: 0, y: 0 })));
      await sleep(1000);
    }

    setGamePhase('choosing');
    setMessage('Where is the ball?');
  };

  // Handles the user's choice
  const handleCupClick = (clickedCup) => {
    if (gamePhase !== 'choosing') return;

    setGamePhase('revealed');
    
    // Create a new state where the clicked cup is lifted
    setCups(cups.map(cup => ({...cup, isLifted: cup.id === clickedCup.id })));

    if (clickedCup.hasBall) {
      setMessage('You found it! 🎉');
      setShowConfetti(true);
      setTimeout(() => {
        onComplete();
      }, 4000);
    } else {
      setMessage('Not this one... Try Again!');
      // After a short delay, also lift the correct cup to show the user
      setTimeout(() => {
         setCups(prevCups => prevCups.map(cup => ({...cup, isLifted: cup.isLifted || cup.hasBall })));
      }, 700);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-cover bg-center flex flex-col items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ backgroundImage: `url(${baseUrl}gameBackground.jpg)` }}
    >
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}

      <h1 className="text-4xl sm:text-5xl font-extrabold text-black drop-shadow-lg mb-8 text-center">
        {message}
      </h1>
      
      <div className="relative flex justify-center items-center h-64 w-full max-w-2xl mt-25">
        {cups.map((cup) => (
          <motion.div
            key={cup.id}
            className="absolute"
            layout // This prop is essential for animating layout changes
            transition={{ type: 'spring', stiffness: 300, damping: 40 }}
            animate={{
              // Increased multiplier for more space between cups
              x: (cup.order - 1) * 350, 
              y: cup.y, // Vertical position for the arc motion
              zIndex: cup.zIndex, // Layering for moving cups
            }}
            onClick={() => handleCupClick(cup)}
          >
            <div className="relative flex flex-col items-center">
              <CupIcon
                isLifted={
                  (gamePhase === 'start' && cup.hasBall) || 
                  (gamePhase === 'revealed' && cup.isLifted)
                }
                color={cupColor} // Pass the current color state to the icon
              />
              {(gamePhase === 'start' || gamePhase === 'revealed') && cup.hasBall && (
                <BallIcon />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 h-16">
        <AnimatePresence mode="wait">
          {gamePhase === 'start' && (
            <motion.button
              key="start-btn"
              onClick={handleShuffle}
              className="px-8 py-4 bg-yellow-400 text-amber-800 font-bold text-xl rounded-xl shadow-lg hover:bg-yellow-500 transition-transform transform hover:scale-105"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              Start Shuffling
            </motion.button>
          )}

          {gamePhase === 'revealed' && !showConfetti && (
             <motion.button
              key="play-again-btn"
              onClick={resetGame}
              className="px-8 py-4 bg-white text-sky-800 font-bold text-xl rounded-xl shadow-lg hover:bg-gray-100 transition-transform transform hover:scale-105"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              Play Again
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CupAndBallGame;
