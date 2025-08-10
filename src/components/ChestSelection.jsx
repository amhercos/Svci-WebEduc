import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import './ChestSelection.css';

// Define the sound effect path for opening the treasure chest
const TREASURE_OPEN_SOUND = 'treasureopen.m4a'; // Ensure you have this file in your public folder

function ChestSelection({ onChestClick }) {
  const base = import.meta.env.BASE_URL;
  const [showShine, setShowShine] = useState(false); // State to control the shine visibility

  // Function to play the treasure open sound
  const playTreasureOpenSound = useCallback(() => {
    const audio = new Audio(`${base}${TREASURE_OPEN_SOUND}`);
    audio.type = 'audio/mp4'; // Specify MIME type for M4A
    audio.play().catch(error => console.error("Error playing treasure open sound:", error));
  }, [base]);

  const handleClick = () => {
    playTreasureOpenSound(); // Play the treasure open sound immediately
    setShowShine(true); // Show the shine effect

    // Delay calling onChestClick and hiding the shine for 3 seconds (to match animation duration)
    setTimeout(() => {
      setShowShine(false); // Hide the shine
      onChestClick(); // Call the original onChestClick prop
    }, 3000); // Changed from 2000ms to 3000ms to match CSS animation duration
  };

  return (
    <div
      className="absolute inset-0 bg-cover bg-center flex flex-col items-center justify-center text-white"
      style={{ backgroundImage: `url('${base}chestSelection.jpg')` }}
    >
      <div className="flex justify-center gap-10">
        {[1, 2, 3].map((num) => (
          <div
            key={num}
            onClick={handleClick} // Use the new handleClick function
            className="relative group cursor-pointer transition-transform hover:scale-110"
          >
            {/* Existing pulse effect - this is a static effect on the chest itself */}
            <div className="absolute inset-0 rounded-full animate-pulse bg-yellow-400 opacity-1 blur-xl z-0 group-hover:opacity-40 transition duration-500"></div>
            
            <img
              src={`${base}Chest.svg`}
              alt={`Treasure Chest ${num}`}
              className="relative z-10 w-90 drop-shadow-2xl"
            />
          </div>
        ))}
      </div>

      {/* Full-screen Yellow Shine Overlay */}
      <AnimatePresence>
        {showShine && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 chest-shine-overlay" // Apply the CSS class for the shine animation
            initial={{ opacity: 0 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* The actual shine animation is handled by the 'chest-shine-overlay' CSS class */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ChestSelection;
