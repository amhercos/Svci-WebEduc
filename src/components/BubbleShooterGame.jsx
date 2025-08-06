import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';

// --- Constants and Configuration ---
const GRID_ROWS = 13;
const GRID_COLS = 11;
const BUBBLE_DIAMETER = 45;
const BUBBLE_RADIUS = BUBBLE_DIAMETER / 2;
const COLORS = ['#D32F2F', '#1976D2', '#388E3C', '#FBC02D', '#7B1FA2']; // Dark Red, Blue, Green, Yellow, Purple
const ROW_HEIGHT = BUBBLE_DIAMETER * 0.866; // Overlap rows for hexagonal packing
const baseUrl = import.meta.env.BASE_URL || '/';
const POWERUP_TYPES = { BOMB: 'bomb' };

// --- Helper Functions ---

/**
 * Generates an initial grid with guaranteed clusters of 3+ bubbles.
 */
const createInitialGrid = () => {
    const grid = Array.from({ length: GRID_ROWS }, (_, r) => Array(GRID_COLS - (r % 2)).fill(null));

    const getNeighbors = (r, c) => {
        const neighbors = [];
        const isOddRow = r % 2;
        const neighborDiffs = [
            { dr: -1, dc: isOddRow ? 0 : -1 }, { dr: -1, dc: isOddRow ? 1 : 0 },
            { dr: 0, dc: -1 }, { dr: 0, dc: 1 },
            { dr: 1, dc: isOddRow ? 0 : -1 }, { dr: 1, dc: isOddRow ? 1 : 0 },
        ];
        neighborDiffs.forEach(({ dr, dc }) => {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < 5 && nc >= 0 && nc < GRID_COLS - (nr % 2)) {
                neighbors.push({ row: nr, col: nc });
            }
        });
        return neighbors;
    };

    // Create several clusters to fill the board, ensuring no single bubbles
    const numClusters = 12; 
    for (let i = 0; i < numClusters; i++) {
        let seedR, seedC, attempts = 0;
        do {
            seedR = Math.floor(Math.random() * 5);
            seedC = Math.floor(Math.random() * (GRID_COLS - (seedR % 2)));
            attempts++;
        } while (grid[seedR][seedC] && attempts < 100);

        if (grid[seedR][seedC]) continue;

        const clusterColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        const clusterSize = 3 + Math.floor(Math.random() * 3); // 3 to 5
        const queue = [{ row: seedR, col: seedC }];
        const visited = new Set([`${seedR},${seedC}`]);
        let currentClusterSize = 0;

        while (queue.length > 0 && currentClusterSize < clusterSize) {
            const { row, col } = queue.shift();
            if (!grid[row][col]) {
                grid[row][col] = { id: `r${row}c${col}_${i}`, color: clusterColor, row, col };
                currentClusterSize++;
                getNeighbors(row, col).forEach(n => {
                    if (!visited.has(`${n.row},${n.col}`)) {
                        visited.add(`${n.row},${n.col}`);
                        if (Math.random() > 0.3) queue.push(n);
                    }
                });
            }
        }
    }
    // Fill any remaining empty spots to ensure a full board
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < GRID_COLS - (r % 2); c++) {
            if (!grid[r][c]) {
                grid[r][c] = { id: `r${r}c${c}_fill`, color: COLORS[Math.floor(Math.random() * COLORS.length)], row: r, col: c };
            }
        }
    }
    return grid;
};


/**
 * A more modern, glossy SVG for the bubbles.
 */
const Bubble = ({ color, type }) => {
    if (type === POWERUP_TYPES.BOMB) {
        return (
            <svg width={BUBBLE_DIAMETER} height={BUBBLE_DIAMETER} viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="50" fill="#333" />
                <text x="50" y="68" fontSize="50" textAnchor="middle" fill="white">💣</text>
            </svg>
        );
    }
    return (
      <svg width={BUBBLE_DIAMETER} height={BUBBLE_DIAMETER} viewBox="0 0 100 100">
        <defs>
          <radialGradient id={`grad-${color.replace('#','')}`} cx="0.35" cy="0.35" r="0.65">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill={`url(#grad-${color.replace('#','')})`} />
      </svg>
    );
};

/**
 * Renders the placeholder grid in the background.
 */
const GridPlaceholders = () => {
    const placeholders = [];
    for (let r = 0; r < GRID_ROWS; r++) {
        const colsInRow = GRID_COLS - (r % 2);
        for (let c = 0; c < colsInRow; c++) {
            const x = c * BUBBLE_DIAMETER + (r % 2 ? BUBBLE_RADIUS : 0);
            const y = r * ROW_HEIGHT;
            placeholders.push(
                <circle 
                    key={`p-${r}-${c}`} 
                    cx={x + BUBBLE_RADIUS} 
                    cy={y + BUBBLE_RADIUS} 
                    r={BUBBLE_RADIUS - 4} 
                    fill="rgba(0, 0, 0, 0.2)" 
                />
            );
        }
    }
    return <svg className="absolute top-0 left-0 w-full h-full z-0">{placeholders}</svg>;
};

// --- Main Game Component ---

const BubbleShooterGame = ({ onComplete }) => {
  const [grid, setGrid] = useState(createInitialGrid);
  const [currentBubble, setCurrentBubble] = useState(null);
  const [nextBubble, setNextBubble] = useState(null);
  const [gameState, setGameState] = useState('playing');
  const [aimLine, setAimLine] = useState(null);
  const [explosions, setExplosions] = useState([]);
  const gameBoardRef = useRef(null);
  const isInitialized = useRef(false);
  const isProcessing = useRef(false);
  const { width, height } = useWindowSize();

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const getNeighbors = useCallback((row, col) => {
    const neighbors = [];
    const isOddRow = row % 2;
    const neighborDiffs = [
      { dr: -1, dc: isOddRow ? 0 : -1 }, { dr: -1, dc: isOddRow ? 1 : 0 },
      { dr: 0, dc: -1 }, { dr: 0, dc: 1 },
      { dr: 1, dc: isOddRow ? 0 : -1 }, { dr: 1, dc: isOddRow ? 1 : 0 },
    ];
    neighborDiffs.forEach(({ dr, dc }) => {
      const nr = row + dr, nc = col + dc;
      if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS - (nr % 2)) {
        neighbors.push({ row: nr, col: nc });
      }
    });
    return neighbors;
  }, []);

  const generateBubble = useCallback(() => {
    if (Math.random() < 0.15) { // 15% chance to get a bomb
        return { color: null, type: POWERUP_TYPES.BOMB };
    }
    const allBubbles = grid.flat().filter(Boolean);
    if (allBubbles.length === 0) {
        return { color: COLORS[Math.floor(Math.random() * COLORS.length)] };
    }

    const existingColors = new Set(allBubbles.filter(b => b.type !== POWERUP_TYPES.BOMB && b.color).map(b => b.color));
    let availableColors = existingColors.size > 0 ? Array.from(existingColors) : COLORS;
    
    return { color: availableColors[Math.floor(Math.random() * availableColors.length)] };
  }, [grid]);

  useEffect(() => {
    if (gameState === 'playing' && !isInitialized.current) {
      setCurrentBubble(generateBubble());
      setNextBubble(generateBubble());
      isInitialized.current = true;
    }
  }, [gameState, generateBubble]);

  const setupNextShot = useCallback(() => {
    setCurrentBubble(nextBubble);
    setNextBubble(generateBubble());
  }, [nextBubble, generateBubble]);

  const handleAim = (e) => {
    if (!gameBoardRef.current || gameState !== 'playing' || isProcessing.current) return;
    const boardRect = gameBoardRef.current.getBoundingClientRect();
    const shooterX = boardRect.width / 2;
    const shooterY = boardRect.height - BUBBLE_RADIUS;
    const clickX = e.clientX - boardRect.left;
    const clickY = e.clientY - boardRect.top;

    if (clickY > shooterY) {
      setAimLine(null);
      return;
    }

    const angle = Math.atan2(clickY - shooterY, clickX - shooterX);
    let x1 = shooterX, y1 = shooterY;
    let x2 = x1 + Math.cos(angle) * 1000, y2 = y1 + Math.sin(angle) * 1000;

    if (x2 < 0 || x2 > boardRect.width) {
      const wallX = x2 < 0 ? 0 : boardRect.width;
      y2 = y1 + (y2 - y1) * (wallX - x1) / (x2 - x1);
      x2 = wallX;
    }
    setAimLine({ x1, y1, x2, y2 });
  };

  const handleShoot = (e) => {
    if (!currentBubble || gameState !== 'playing' || !gameBoardRef.current || isProcessing.current) return;
    isProcessing.current = true;
    setAimLine(null);
    const boardRect = gameBoardRef.current.getBoundingClientRect();
    const shooterX = boardRect.width / 2;
    const shooterY = boardRect.height - BUBBLE_RADIUS;
    const clickX = e.clientX - boardRect.left;
    const clickY = e.clientY - boardRect.top;

    if (clickY > shooterY) {
        isProcessing.current = false;
        return;
    }

    const angle = Math.atan2(clickY - shooterY, clickX - shooterX);
    const speed = 25;
    let vx = Math.cos(angle) * speed, vy = Math.sin(angle) * speed;

    const flyingBubble = { ...currentBubble, x: shooterX - BUBBLE_RADIUS, y: shooterY - BUBBLE_DIAMETER };
    setCurrentBubble(null);

    const tempEl = document.createElement('div');
    tempEl.style.position = 'absolute';
    tempEl.style.zIndex = '10';
    tempEl.style.left = `${flyingBubble.x}px`;
    tempEl.style.top = `${flyingBubble.y}px`;
    const bubbleSVG = flyingBubble.type === POWERUP_TYPES.BOMB 
        ? `<svg width="${BUBBLE_DIAMETER}" height="${BUBBLE_DIAMETER}" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#333" /><text x="50" y="68" font-size="50" text-anchor="middle" fill="white">💣</text></svg>`
        : `<svg width="${BUBBLE_DIAMETER}" height="${BUBBLE_DIAMETER}" viewBox="0 0 100 100"><defs><radialGradient id="grad-temp" cx="0.35" cy="0.35" r="0.65"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/><stop offset="100%" stop-color="${flyingBubble.color}" stop-opacity="1"/></radialGradient></defs><circle cx="50" cy="50" r="50" fill="url(#grad-temp)"/></svg>`;
    tempEl.innerHTML = bubbleSVG;
    gameBoardRef.current.appendChild(tempEl);

    const animate = () => {
      flyingBubble.x += vx;
      flyingBubble.y += vy;
      if (flyingBubble.x <= 0 || flyingBubble.x >= boardRect.width - BUBBLE_DIAMETER) vx *= -1;
      tempEl.style.left = `${flyingBubble.x}px`;
      tempEl.style.top = `${flyingBubble.y}px`;
      if (flyingBubble.y <= 0 || checkCollision(flyingBubble)) {
        if(gameBoardRef.current.contains(tempEl)) gameBoardRef.current.removeChild(tempEl);
        placeBubble(flyingBubble);
        return;
      }
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  };

  const checkCollision = (flyingBubble) => {
    for (const row of grid) {
      for (const staticBubble of row) {
        if (staticBubble) {
          const staticX = staticBubble.col * BUBBLE_DIAMETER + (staticBubble.row % 2 ? BUBBLE_RADIUS : 0);
          const staticY = staticBubble.row * ROW_HEIGHT;
          const dx = (flyingBubble.x + BUBBLE_RADIUS) - (staticX + BUBBLE_RADIUS);
          const dy = (flyingBubble.y + BUBBLE_RADIUS) - (staticY + BUBBLE_RADIUS);
          if (Math.sqrt(dx * dx + dy * dy) < BUBBLE_DIAMETER) return true;
        }
      }
    }
    return false;
  };

  const placeBubble = async (landedBubble) => {
    let closestRow = -1, closestCol = -1;
    let minDist = Infinity;
    for (let r = 0; r < GRID_ROWS; r++) {
      const colsInRow = GRID_COLS - (r % 2);
      for (let c = 0; c < colsInRow; c++) {
        if (!grid[r][c]) {
          const slotX = c * BUBBLE_DIAMETER + (r % 2 ? BUBBLE_RADIUS : 0);
          const slotY = r * ROW_HEIGHT;
          const dist = Math.sqrt(Math.pow(landedBubble.x - slotX, 2) + Math.pow(landedBubble.y - slotY, 2));
          if (dist < minDist) {
            minDist = dist;
            closestRow = r;
            closestCol = c;
          }
        }
      }
    }
    if (closestRow !== -1) {
      let tempGrid = grid.map(row => [...row]);
      
      if (landedBubble.type === POWERUP_TYPES.BOMB) {
          await handlePowerup(tempGrid, closestRow, closestCol, POWERUP_TYPES.BOMB);
          return;
      }

      tempGrid[closestRow][closestCol] = { id: `r${closestRow}c${closestCol}-${Date.now()}`, color: landedBubble.color, row: closestRow, col: closestCol, type: landedBubble.type };

      const neighbors = getNeighbors(closestRow, closestCol);
      neighbors.forEach(({row, col}) => {
          if (tempGrid[row]?.[col]) tempGrid[row][col] = {...tempGrid[row][col], isJiggling: true};
      });
      setGrid(tempGrid);
      await sleep(150);
      
      tempGrid = tempGrid.map(row => row.map(b => b ? {...b, isJiggling: false} : null));
      await checkForMatches(tempGrid, closestRow, closestCol);

    } else {
      setupNextShot();
      isProcessing.current = false;
    }
  };

  const handlePowerup = async (currentGrid, row, col, type) => {
      if (type === POWERUP_TYPES.BOMB) {
          const x = col * BUBBLE_DIAMETER + (row % 2 ? BUBBLE_RADIUS : 0);
          const y = row * ROW_HEIGHT;
          setExplosions(prev => [...prev, { id: Date.now(), x, y }]);

          let toPop = [];
          const bombCenter = { x: x + BUBBLE_RADIUS, y: y + BUBBLE_RADIUS };
          const blastRadius = BUBBLE_DIAMETER * 2.2; // Increased radius

          currentGrid.forEach(r => r.forEach(bubble => {
              if (bubble) {
                  const bubbleX = bubble.col * BUBBLE_DIAMETER + (bubble.row % 2 ? BUBBLE_RADIUS : 0) + BUBBLE_RADIUS;
                  const bubbleY = bubble.row * ROW_HEIGHT + BUBBLE_RADIUS;
                  const distance = Math.sqrt(Math.pow(bombCenter.x - bubbleX, 2) + Math.pow(bombCenter.y - bubbleY, 2));
                  if (distance < blastRadius) toPop.push(bubble);
              }
          }));
          
          let popGrid = currentGrid.map(r => r.map(b => b ? {...b} : null));
          for (const bubble of toPop) {
              if(popGrid[bubble.row]?.[bubble.col]) popGrid[bubble.row][bubble.col].isPopping = true;
          }
          setGrid(popGrid);
          await sleep(300);
          await handlePostPop(popGrid);
      }
  };

  const handlePostPop = useCallback(async (gridAfterPop) => {
      let gridAfterGravity = gridAfterPop.map(row => row.map(b => (b?.isPopping ? null : b)));
      
      const connected = new Set();
      const searchQueue = [];

      if (gridAfterGravity[0]) {
          for (let c = 0; c < gridAfterGravity[0].length; c++) {
              if (gridAfterGravity[0][c]) {
                  searchQueue.push({ row: 0, col: c });
                  connected.add(gridAfterGravity[0][c].id);
              }
          }
      }

      let head = 0;
      while (head < searchQueue.length) {
          const { row, col } = searchQueue[head++];
          getNeighbors(row, col).forEach(n => {
              const neighborBubble = gridAfterGravity[n.row]?.[n.col];
              if (neighborBubble && !connected.has(neighborBubble.id)) {
                  connected.add(neighborBubble.id);
                  searchQueue.push(n);
              }
          });
      }

      let fallGrid = gridAfterGravity.map(row => row.map(b => (b && !connected.has(b.id) ? { ...b, isFalling: true } : b)));
      setGrid(fallGrid);
      await sleep(500);

      const finalGrid = fallGrid.map(row => row.map(b => (b?.isFalling ? null : b)));
      setGrid(finalGrid);
      
      if (finalGrid.every(row => row.every(b => b === null))) {
        setGameState('won');
      } else {
        setupNextShot();
      }
      isProcessing.current = false;
  }, [getNeighbors, setupNextShot]);

  const checkForMatches = useCallback(async (currentGrid, startRow, startCol) => {
    const startBubble = currentGrid[startRow]?.[startCol];
    if (!startBubble || startBubble.type) {
        setupNextShot();
        isProcessing.current = false;
        return;
    };

    const matches = [], queue = [{row: startRow, col: startCol}], visited = new Set([`${startRow},${startCol}`]);
    while (queue.length > 0) {
      const {row, col} = queue.shift();
      matches.push(currentGrid[row][col]);
      getNeighbors(row, col).forEach(n => {
        if (!visited.has(`${n.row},${n.col}`) && currentGrid[n.row]?.[n.col]?.color === startBubble.color) {
          visited.add(`${n.row},${n.col}`);
          queue.push(n);
        }
      });
    }

    if (matches.length >= 3) {
      let popGrid = currentGrid.map(r => r.map(b => b ? {...b} : null));
      for (let i = 0; i < matches.length; i++) {
          const {row, col} = matches[i];
          if(popGrid[row][col]) popGrid[row][col].isPopping = true;
          setGrid(popGrid.map(r => [...r]));
          await sleep(50);
      }
      await sleep(200);
      await handlePostPop(popGrid);
    } else {
      setGrid(currentGrid);
      setupNextShot();
      isProcessing.current = false;
    }
  }, [getNeighbors, setupNextShot, handlePostPop]);

  return (
    <div
      className="fixed inset-0 bg-cover bg-center flex flex-col items-center justify-center font-sans"
      style={{ backgroundImage: `url(${baseUrl}gameBackground.jpg)` }}
      onMouseMove={handleAim}
      onClick={handleShoot}
    >
      <AnimatePresence>
        {gameState === 'won' && (
          <motion.div 
            className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
          >
            <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
            >
                <h2 className="text-6xl font-bold text-gray-800 mb-4 drop-shadow-lg">You Win! 🎉</h2>
                <button 
                    onClick={onComplete} 
                    className="px-8 py-4 bg-yellow-400 text-amber-800 font-bold text-xl rounded-xl shadow-lg hover:bg-yellow-500 transition-transform transform hover:scale-105"
                >
                  Continue
                </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={gameBoardRef} className="relative" style={{ width: GRID_COLS * BUBBLE_DIAMETER, height: (GRID_ROWS - 1) * ROW_HEIGHT + BUBBLE_DIAMETER, cursor: 'pointer' }}>
        <GridPlaceholders />
        <AnimatePresence>
          {grid.flat().filter(Boolean).map((bubble) => {
            const x = bubble.col * BUBBLE_DIAMETER + (bubble.row % 2 ? BUBBLE_RADIUS : 0);
            const y = bubble.row * ROW_HEIGHT;
            const jiggleAnimation = { x: [x, x - 2, x + 2, x - 1, x + 1, x], y: [y, y + 1, y - 1, y, y + 1, y], transition: { duration: 0.2 } };
            return (
              <motion.div key={bubble.id} className="absolute z-10" initial={{ scale: 0, x, y }} animate={{ scale: bubble.isPopping ? [1, 1.2, 0] : 1, x: bubble.isJiggling ? jiggleAnimation.x : x, y: bubble.isFalling ? y + 800 : (bubble.isJiggling ? jiggleAnimation.y : y) }} exit={{ scale: 0 }} transition={{ scale: { duration: 0.2 }, y: { duration: 0.5, ease: 'easeIn' }, ...(bubble.isJiggling && {x: jiggleAnimation.transition, y: jiggleAnimation.transition}) }}>
                <Bubble color={bubble.color} type={bubble.type} />
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {explosions.map(exp => (
            <motion.div
                key={exp.id}
                className="absolute z-20 rounded-full bg-yellow-400/80"
                initial={{ x: exp.x, y: exp.y, scale: 0, opacity: 1 }}
                animate={{ scale: 1, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{ width: BUBBLE_DIAMETER * 4, height: BUBBLE_DIAMETER * 4, transformOrigin: 'center' }}
                onAnimationComplete={() => setExplosions(prev => prev.filter(e => e.id !== exp.id))}
            />
        ))}

        {aimLine && <svg className="absolute top-0 left-0 w-full h-full overflow-visible z-10 pointer-events-none"><line x1={aimLine.x1} y1={aimLine.y1} x2={aimLine.x2} y2={aimLine.y2} stroke="rgba(255, 255, 255, 0.7)" strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round"/></svg>}

        <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 bg-gray-400 rounded-full opacity-30"></div>
                <div className="absolute inset-1 bg-gray-500 rounded-full opacity-40"></div>
                <div className="absolute inset-2 bg-gray-600 rounded-full"></div>
                <div className="absolute inset-0 rounded-full bg-white/40 blur-lg animate-pulse"></div>
            </div>
            {currentBubble && <div className="absolute" style={{ bottom: 25, width: BUBBLE_DIAMETER, height: BUBBLE_DIAMETER }}><Bubble color={currentBubble.color} type={currentBubble.type} /></div>}
        </div>
        
        {nextBubble && (
            <div className="absolute pointer-events-none" style={{ bottom: -10, left: `calc(50% + 40px)` }}>
                <div style={{ width: BUBBLE_DIAMETER * 0.7, height: BUBBLE_DIAMETER * 0.7 }}>
                   <Bubble color={nextBubble.color} type={nextBubble.type} />
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default BubbleShooterGame;
