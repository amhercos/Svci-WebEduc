import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';

// --- Constants and Configuration ---
const GAME_WIDTH = 600;
const GAME_HEIGHT = 700;
const BASKET_WIDTH = 160;
const ITEM_SIZE = 60;
const ITEM_SPAWN_RATE = 1100;
const ITEM_FALL_SPEED = 4;
const GAME_DURATION = 30;
const CATCH_TOLERANCE = 30; // Extra pixels for the "absorbing" effect
const baseUrl = import.meta.env.BASE_URL || '/';
const CATCH_WORDS = ["Nice!", "Great!", "Awesome!", "Sweet!", "Wow!"];

// --- SVG File Placeholders ---
const itemFiles = [
    'grape-svgrepo-com.svg',
    'corn-svgrepo-com.svg',
    'cherry-svgrepo-com.svg',
    'blueberries-fruit-svgrepo-com.svg',
    'apple-food-and-restaurant-svgrepo-com.svg',
    'eggplant-aubergine-svgrepo-com.svg',
    'banana-svgrepo-com.svg',
    'avocado-svgrepo-com.svg'
];

// --- Audio Files ---
const WIN_SOUNDS = [
    'win.mp3',
    'win2.mp3',
    'win3.mp3',
    'win4.mp3',
];

// --- Main Game Component ---
const CatchTheItemsGame = ({ onComplete }) => {
    const [items, setItems] = useState([]);
    const [basketX, setBasketX] = useState(0);
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState('playing');
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [catchEffects, setCatchEffects] = useState([]);
    const gameAreaRef = useRef(null);
    const bgAudioRef = useRef(null);
    const winAudioRef = useRef(null);
    const catchAudioRef = useRef(null);
    const { width, height } = useWindowSize();

    useEffect(() => {
        if (width > 0) setBasketX(GAME_WIDTH / 2 - BASKET_WIDTH / 2);
    }, [width]);

    // Game Timer
    useEffect(() => {
        if (gameState !== 'playing' || timeLeft <= 0) {
            if (timeLeft <= 0) setGameState('finished');
            return;
        }
        const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft, gameState]);

    // Audio control for background music and win sound
    useEffect(() => {
        if (bgAudioRef.current) {
            if (gameState === 'playing') {
                bgAudioRef.current.play().catch(e => console.error("Background audio playback failed:", e));
            } else {
                bgAudioRef.current.pause();
                bgAudioRef.current.currentTime = 0;
            }
        }

        if (winAudioRef.current && gameState === 'finished') {
            const randomWinSound = WIN_SOUNDS[Math.floor(Math.random() * WIN_SOUNDS.length)];
            winAudioRef.current.src = `${baseUrl}${randomWinSound}`;
            winAudioRef.current.play().catch(e => console.error("Win audio playback failed:", e));
        }
    }, [gameState]);

    const handleCatch = useCallback((itemToCatch) => {
        setItems(prev => {
            const currentItem = prev.find(i => i.id === itemToCatch.id);
            if (!currentItem || currentItem.caught) return prev;

            setScore(s => s + 1);
            
            // Play catch sound
            if (catchAudioRef.current) {
                catchAudioRef.current.currentTime = 0; // Rewind to start for quick successive plays
                catchAudioRef.current.play().catch(e => console.error("Catch audio playback failed:", e));
            }

            const basketCenter = basketX + BASKET_WIDTH / 2;
            const randomWord = CATCH_WORDS[Math.floor(Math.random() * CATCH_WORDS.length)];
            setCatchEffects(prevEffects => [...prevEffects, { id: Date.now(), x: basketCenter, word: randomWord }]);

            return prev.map(item => item.id === itemToCatch.id ? { ...item, caught: true } : item);
        });
    }, [basketX]);

    // Game Loop for falling and catching - using requestAnimationFrame
    useEffect(() => {
        if (gameState !== 'playing') return;

        let animationFrameId;
        const gameLoop = () => {
            setItems(prevItems => {
                const updatedItems = prevItems.map(item => ({
                    ...item,
                    y: item.y + ITEM_FALL_SPEED,
                }));

                for (const item of updatedItems) {
                    if (item.caught) continue;

                    const basketTop = GAME_HEIGHT - 120;
                    const basketLeft = basketX;
                    const basketRight = basketX + BASKET_WIDTH;
                    const itemCenter = item.x + ITEM_SIZE / 2;
                    const itemBottom = item.y + ITEM_SIZE;

                    if (itemBottom > (basketTop - CATCH_TOLERANCE) && itemCenter > basketLeft && itemCenter < basketRight) {
                        handleCatch(item);
                    }
                }
                return updatedItems.filter(item => item.y < GAME_HEIGHT);
            });
            animationFrameId = requestAnimationFrame(gameLoop);
        };

        animationFrameId = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(animationFrameId);
    }, [gameState, basketX, handleCatch]);

    // Spawn new items
    useEffect(() => {
        if (gameState !== 'playing' || width === 0) return;

        const spawnInterval = setInterval(() => {
            const newItem = {
                id: Date.now() + Math.random(),
                fileName: itemFiles[Math.floor(Math.random() * itemFiles.length)],
                x: Math.random() * (GAME_WIDTH - ITEM_SIZE),
                y: -ITEM_SIZE,
                rotate: Math.random() * 90 - 45,
                caught: false,
            };
            setItems(prev => [...prev, newItem]);
        }, ITEM_SPAWN_RATE);

        return () => clearInterval(spawnInterval);
    }, [gameState, width]);

    // Handle basket movement
    const handlePointerMove = (clientX) => {
        if (!gameAreaRef.current) return;
        const rect = gameAreaRef.current.getBoundingClientRect();
        const newX = clientX - rect.left - BASKET_WIDTH / 2;
        setBasketX(Math.max(0, Math.min(newX, GAME_WIDTH - BASKET_WIDTH)));
    };

    if (width === 0 || height === 0) {
        return <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${baseUrl}gameBackground.jpg)` }} />;
    }

    return (
        <div
            className="fixed inset-0 bg-cover bg-center flex flex-col items-center justify-center font-sans p-4 overflow-hidden"
            style={{ backgroundImage: `url(${baseUrl}gameBackground.jpg)` }}
        >
            <audio ref={bgAudioRef} src={`${baseUrl}gamebg.mp3`} loop={true} preload="auto" />
            <audio ref={winAudioRef} preload="auto" />
            <audio ref={catchAudioRef} src={`${baseUrl}cupwoosh.mp3`} preload="auto" />

            <AnimatePresence>
                {gameState === 'finished' && (
                    <motion.div
                        className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />
                        <motion.div
                            className="text-center flex flex-col items-center p-8 bg-white rounded-3xl shadow-2xl transform scale-105"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
                        >
                            <h2 className="font-bubblegum text-6xl text-purple-600 mb-4 drop-shadow-md">🥳 You're a Superstar!</h2>
                            <p className="font-bubblegum text-4xl text-gray-700 mb-8 drop-shadow-sm">You caught <span className="text-pink-500 font-extrabold text-5xl">{score}</span> items!</p>

                            <button
                                onClick={onComplete}
                                className="px-10 py-5 bg-pink-500 text-white font-bold text-2xl rounded-full shadow-lg hover:bg-pink-600 transition-transform transform hover:scale-110"
                            >
                                Continue
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div
                ref={gameAreaRef}
                className="relative bg-black/20 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/30"
                style={{ width: GAME_WIDTH, height: GAME_HEIGHT, cursor: gameState === 'playing' ? 'none' : 'default' }}
                onMouseMove={(e) => handlePointerMove(e.clientX)}
                onTouchMove={(e) => handlePointerMove(e.touches[0].clientX)}
            >
                <div className="absolute top-4 right-4">
                    <div className="relative w-24 h-24">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle className="text-white/20" strokeWidth="8" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                            <motion.circle
                                className="text-yellow-400"
                                strokeWidth="8"
                                strokeDasharray={2 * Math.PI * 45}
                                strokeDashoffset={0}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="45"
                                cx="50"
                                cy="50"
                                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                                animate={{ strokeDashoffset: (2 * Math.PI * 45) * (1 - timeLeft / GAME_DURATION) }}
                                transition={{ duration: 1, ease: "linear" }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-white text-3xl font-bold drop-shadow-md">{timeLeft}</div>
                    </div>
                </div>

                <div className="absolute w-full h-full">
                    <AnimatePresence>
                        {items.map(item => (
                            <motion.div
                                key={item.id}
                                className="absolute top-0 z-10"
                                initial={{ x: item.x, y: item.y, rotate: item.rotate }}
                                animate={{
                                    y: item.caught ? GAME_HEIGHT - 80 : item.y,
                                    x: item.caught ? basketX + BASKET_WIDTH / 2 - ITEM_SIZE / 2 : item.x,
                                    scale: item.caught ? 0 : 1,
                                    opacity: item.caught ? 0 : 1
                                }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                style={{ width: ITEM_SIZE, height: ITEM_SIZE }}
                            >
                                <img src={`${baseUrl}${item.fileName}`} alt={item.fileName} className="w-full h-full" style={{ filter: 'drop-shadow(3px 5px 3px rgba(0,0,0,0.4))' }}/>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <AnimatePresence>
                    {catchEffects.map(effect => (
                        <motion.div
                            key={effect.id}
                            className="absolute bottom-24 z-20 text-3xl font-bold text-white"
                            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
                            initial={{ x: effect.x, y: 0, scale: 0.5, opacity: 1 }}
                            animate={{ y: -100, scale: 1.2, opacity: 0 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            onAnimationComplete={() => setCatchEffects(prev => prev.filter(e => e.id !== effect.id))}
                        >
                            {effect.word}
                        </motion.div>
                    ))}
                </AnimatePresence>

                <motion.div
                    className="absolute bottom-5 z-20"
                    animate={{ x: basketX }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    style={{ width: BASKET_WIDTH, height: 100 }}
                >
                    <img src={`${baseUrl}basket-svgrepo-com.svg`} alt="Basket" className="w-full h-full" style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.4))' }} />
                </motion.div>
            </div>
        </div>
    );
};

export default CatchTheItemsGame;