import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
import { motion, AnimatePresence } from 'framer-motion';

const animals = [
  { name: 'dog', sound: '/assets/dog.mp3', image: '/assets/dog.jpg' },
  { name: 'cat', sound: '/assets/cat.mp3', image: '/assets/cat.jpg' },
  { name: 'cow', sound: '/assets/cow.mp3', image: '/assets/cow.jpg' },
];

function AnimalSoundGame({ onComplete }) {
  const [questionAnimal, setQuestionAnimal] = useState(null);
  const [options, setOptions] = useState([]);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [width, height] = useWindowSize();

  useEffect(() => {
    generateNewQuestion();
  }, []);

  const generateNewQuestion = () => {
    const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
    const shuffledOptions = animals.sort(() => 0.5 - Math.random()).slice(0, 3);

    if (!shuffledOptions.includes(randomAnimal)) {
      shuffledOptions[Math.floor(Math.random() * 1)] = randomAnimal;
    }

    setQuestionAnimal(randomAnimal);
    setOptions(shuffledOptions);
  };

  const playSound = () => {
    const audio = new Audio(questionAnimal.sound);
    audio.play();
  };

  const handleAnswer = (name) => {
    if (name === questionAnimal.name) {
      setPopupMessage('Correct!');
      setPopupType('correct');
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setShowPopup(false);
        onComplete?.();
      }, 3000);
    } else {
      setPopupMessage('Try Again');
      setPopupType('wrong');
      setTimeout(() => setShowPopup(false), 1000);
    }
    setShowPopup(true);
  };

  if (!questionAnimal) return <p className="text-center text-black">Loading...</p>;

  return (
    <motion.div
      className="fixed inset-0 overflow-hidden flex flex-col items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${import.meta.env.BASE_URL}gameBackground.jpg)` }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
    >
      {showConfetti && <Confetti width={width} height={height} numberOfPieces={600} gravity={0.3} />}

      <motion.h2 className="text-2xl font-semibold mb-4 text-white drop-shadow">
        Which animal makes this sound?
      </motion.h2>
      <button onClick={playSound} className="bg-blue-500 text-white px-4 py-2 rounded shadow">
        🔊 Play Sound
      </button>

      <div className="flex justify-center gap-6 mt-6">
        {options.map((animal) => (
          <motion.img
            key={animal.name}
            src={animal.image}
            alt={animal.name}
            onClick={() => handleAnswer(animal.name)}
            className="w-32 h-32 object-cover cursor-pointer rounded border-2 border-transparent hover:border-blue-400 transition"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            whileTap={{ scale: 0.95 }}
          />
        ))}
      </div>

      <AnimatePresence>
        {showPopup && (
          <motion.div
            key="popup"
            className={`fixed inset-0 flex flex-col items-center justify-center z-50 ${
              popupType === 'correct'
                ? 'bg-gradient-to-br from-green-200 via-green-300 to-green-600'
                : 'bg-gradient-to-br from-red-200 via-red-300 to-red-600'
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4 }}
          >
            <motion.img
              src={popupType === 'correct' ? '/check.png' : '/xmark.png'}
              alt="Feedback Icon"
              className="w-40 h-40 mb-4 drop-shadow-2xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1.4 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            />
            <motion.p
              className="text-white text-4xl font-extrabold drop-shadow-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {popupMessage}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default AnimalSoundGame;
