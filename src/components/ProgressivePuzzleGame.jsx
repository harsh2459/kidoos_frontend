// src/components/ProgressivePuzzleGame.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assetUrl } from "../api/asset";
import {
  RefreshCw, Trophy, Lock, AlertTriangle, CheckCircle,
  Gift, ArrowRight, Crown
} from "lucide-react";

const mandalaBg = "url('/images-webp/homepage/mandala-bg.webp')";

export default function ProgressivePuzzleGame({ levels, grandWinMessage = "A Royal Victory!", rewardImage }) {
  // ... [Puzzle Logic Unchanged] ...
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);

  const [tiles, setTiles] = useState([]);
  const [emptyIndex, setEmptyIndex] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const navigate = useNavigate();

  const currentConfig = levels[currentLevelIdx] || levels[0] || {};
  const gridSize = currentConfig.gridSize || 3;
  const maxMoves = currentConfig.maxMoves || null;

  useEffect(() => {
    startLevel();
  }, [currentLevelIdx, currentConfig.image]);

  const startLevel = () => {
    if (!currentConfig.image) return;
    const totalTiles = gridSize * gridSize;
    let newTiles = Array.from({ length: totalTiles }, (_, i) => i);
    let emptyIdx = totalTiles - 1;
    let previousIdx = -1;
    const shuffleCount = gridSize === 3 ? 30 : gridSize === 4 ? 80 : 150;

    for (let i = 0; i < shuffleCount; i++) {
      const neighbors = getNeighbors(emptyIdx, gridSize);
      const validNeighbors = neighbors.filter(n => n !== previousIdx);
      if (validNeighbors.length > 0) {
        const randomNeighbor = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
        [newTiles[emptyIdx], newTiles[randomNeighbor]] = [newTiles[randomNeighbor], newTiles[emptyIdx]];
        previousIdx = emptyIdx;
        emptyIdx = randomNeighbor;
      }
    }
    setTiles(newTiles);
    setEmptyIndex(emptyIdx);
    setMoves(0);
    setIsLevelComplete(false);
    setGameOver(false);
  };

  const getNeighbors = (idx, size) => {
    const neighbors = [];
    const row = Math.floor(idx / size);
    const col = idx % size;
    if (row > 0) neighbors.push(idx - size);
    if (row < size - 1) neighbors.push(idx + size);
    if (col > 0) neighbors.push(idx - 1);
    if (col < size - 1) neighbors.push(idx + 1);
    return neighbors;
  };

  const handleTileClick = (index) => {
    if (isLevelComplete || gameOver) return;
    const neighbors = getNeighbors(emptyIndex, gridSize);
    if (neighbors.includes(index)) {
      const newTiles = [...tiles];
      [newTiles[emptyIndex], newTiles[index]] = [newTiles[index], newTiles[emptyIndex]];
      setTiles(newTiles);
      setEmptyIndex(index);
      const newMoves = moves + 1;
      setMoves(newMoves);
      if (maxMoves && newMoves > maxMoves) { setGameOver(true); return; }
      const isSorted = newTiles.every((val, i) => val === i);
      if (isSorted) handleWin();
    }
  };

  const handleWin = async () => {
    setIsLevelComplete(true);

    const { default: confetti } = await import("canvas-confetti");

    const particleCount =
      currentLevelIdx === 0 ? 50 : currentLevelIdx === 1 ? 100 : 300;

    confetti({
      particleCount,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#D4AF37", "#F3E5AB", "#3E2723"],
    });

    if (currentLevelIdx >= levels.length - 1) {
      localStorage.setItem("puzzle_reward_claimed", "true");
      setTimeout(() => setIsGameComplete(true), 1200);
    }
  };

  const nextLevel = () => { if (currentLevelIdx < levels.length - 1) setCurrentLevelIdx(prev => prev + 1); };

  if (!currentConfig.image) return <div className="p-8 text-center bg-[#FAF7F2] rounded-xl text-[#8A7A5E] font-['Cinzel']">Image Missing</div>;

  return (
    <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_300px] gap-8 items-start">

      {/* LEFT: Game Board */}
      <div className="flex flex-col items-center w-full">
        {/* Level Steps */}
        <div className="flex items-center gap-3 mb-8 w-full max-w-[500px]">
          {levels.map((_, idx) => (
            <div key={idx} className={`h-2 flex-1 rounded-full transition-all duration-500 shadow-sm ${idx < currentLevelIdx ? 'bg-[#3E2723]' : idx === currentLevelIdx ? 'bg-[#D4AF37]' : 'bg-[#E3E8E5]'}`} />
          ))}
        </div>

        {/* Board Frame */}
        <div className="relative bg-[#2C1810] p-4 rounded-[1.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.4)] w-full max-w-[500px] aspect-square select-none border-4 border-[#3E2723] ring-1 ring-[#D4AF37]/50">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: mandalaBg }}></div>

          <div
            className="grid w-full h-full gap-1.5 bg-[#2C1810] relative z-10"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              gridTemplateRows: `repeat(${gridSize}, 1fr)`
            }}
          >
            {tiles.map((tileNumber, index) => {
              const isEmpty = tileNumber === (gridSize * gridSize) - 1;
              const row = Math.floor(tileNumber / gridSize);
              const col = tileNumber % gridSize;
              const percentX = col * (100 / (gridSize - 1));
              const percentY = row * (100 / (gridSize - 1));

              return (
                <div
                  key={index}
                  onClick={() => handleTileClick(index)}
                  className={`relative w-full h-full rounded-lg overflow-hidden transition-all duration-200 border border-[#D4AF37]/20
                        ${isEmpty && !isLevelComplete ? 'bg-[#3E2723]/50 opacity-0' : 'cursor-pointer hover:brightness-110 shadow-lg'}
                        ${isLevelComplete ? 'opacity-100 border-none' : ''}
                      `}
                >
                  {!isEmpty && (
                    <div
                      className="w-full h-full bg-cover"
                      style={{
                        backgroundImage: `url(${assetUrl(currentConfig.image)})`,
                        backgroundPosition: `${percentX}% ${percentY}%`,
                        backgroundSize: `${gridSize * 100}%`
                      }}
                    />
                  )}
                  {/* Tile Numbers */}
                  {gridSize === 3 && !isLevelComplete && !isEmpty && (
                    <span className="absolute bottom-1 right-1 text-[10px] bg-[#2C1810]/80 text-[#F3E5AB] px-1.5 rounded-md font-bold font-['Cinzel'] border border-[#D4AF37]/30">{tileNumber + 1}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* OVERLAY: Level Complete */}
          {isLevelComplete && !isGameComplete && (
            <div className="absolute inset-0 z-20 bg-[#2C1810]/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center text-white animate-in fade-in p-6 text-center border border-[#D4AF37]/30">
              <div className="w-20 h-20 bg-[#D4AF37] rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(212,175,55,0.4)] animate-bounce">
                <Trophy className="w-10 h-10 text-[#2C1810]" />
              </div>
              <h3 className="text-3xl font-bold mb-2 font-['Cinzel'] text-[#F3E5AB]">Level Conquered!</h3>
              <p className="mb-8 opacity-80 font-['Inter'] text-lg">Wisdom flows to those who persist.</p>
              <button onClick={nextLevel} className="bg-gradient-to-r from-[#C59D5F] to-[#B0894C] text-white px-10 py-3 rounded-full font-bold flex items-center gap-3 shadow-xl hover:shadow-2xl transition-transform active:scale-95 font-['Cinzel'] tracking-wide">
                Next Challenge <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* OVERLAY: Grand Winner */}
          {isGameComplete && (
            <div className="absolute inset-0 z-30 bg-[#FAF7F2] rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-500">
              <div className="w-full max-w-sm mx-auto flex flex-col items-center">
                {rewardImage && (
                  <img src={assetUrl(rewardImage)} alt="Reward" className="w-40 h-auto mx-auto mb-6 drop-shadow-2xl animate-float" />
                )}
                <h2 className="text-3xl font-bold mb-2 text-[#3E2723] font-['Cinzel']">{grandWinMessage}</h2>

                <div className="bg-[#3E2723] text-[#F3E5AB] p-6 rounded-2xl mt-4 mb-8 border border-[#D4AF37] w-full shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: mandalaBg }}></div>
                  <div className="flex items-center justify-center gap-3 mb-2 relative z-10">
                    <Gift className="w-6 h-6 text-[#D4AF37]" />
                    <span className="font-bold text-xl uppercase tracking-widest font-['Cinzel']">Reward Unlocked</span>
                  </div>
                  <p className="text-sm relative z-10">A royal decree grants you <span className="font-bold text-2xl text-[#D4AF37] block mt-1">20% OFF</span> on any treasure!</p>
                </div>

                <button onClick={() => navigate('/catalog')} className="bg-gradient-to-r from-[#C59D5F] to-[#B0894C] text-white font-bold px-10 py-4 rounded-full shadow-[0_10px_30px_rgba(176,137,76,0.3)] hover:shadow-xl active:scale-95 w-full flex items-center justify-center gap-3 font-['Cinzel'] tracking-widest text-lg">
                  Claim Reward <ArrowRight className="w-5 h-5" />
                </button>
                <button onClick={() => window.location.reload()} className="mt-6 text-[#8A7A5E] hover:text-[#3E2723] text-xs font-bold underline transition-colors uppercase tracking-wider">Play Again</button>
              </div>
            </div>
          )}

          {/* OVERLAY: Game Over */}
          {gameOver && (
            <div className="absolute inset-0 z-20 bg-[#3E2723]/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center text-white animate-in fade-in p-6 text-center">
              <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
              <h3 className="text-2xl font-bold mb-2 font-['Cinzel']">Out of Moves</h3>
              <p className="mb-6 opacity-80">Even kings must sometimes retreat to try again.</p>
              <button onClick={startLevel} className="bg-white text-[#3E2723] px-8 py-3 rounded-full font-bold hover:bg-[#F3E5AB] shadow-lg active:scale-95 transition-transform font-['Cinzel']">Retry Level</button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Stats Sidebar (Royal Ledger) */}
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-[2rem] border border-[#D4AF37]/20 shadow-sm h-full w-full flex flex-col justify-center">
        <h3 className="font-['Cinzel'] font-bold text-2xl text-[#3E2723] mb-8 border-b border-[#D4AF37]/20 pb-4 flex items-center gap-2">
          <Crown className="w-6 h-6 text-[#D4AF37]" /> Your Progress
        </h3>

        <div className="space-y-8">
          <div>
            <span className="text-xs uppercase font-bold text-[#8A7A5E] block mb-2 tracking-widest">Current Trial</span>
            <div className="flex items-center gap-3 text-lg font-bold text-[#3E2723] font-['Playfair_Display']">
              {currentConfig.difficulty === 'easy' && <span className="text-[#4A7C59] flex items-center gap-2">Novice (3x3)</span>}
              {currentConfig.difficulty === 'medium' && <span className="text-[#B45309] flex items-center gap-2">Warrior (4x4)</span>}
              {currentConfig.difficulty === 'hard' && <span className="text-[#B91C1C] flex items-center gap-2">Legend (5x5)</span>}
            </div>
          </div>

          <div>
            <span className="text-xs uppercase font-bold text-[#8A7A5E] block mb-2 tracking-widest">Moves Made</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold font-['Playfair_Display'] ${maxMoves && moves > maxMoves * 0.8 ? 'text-red-500' : 'text-[#3E2723]'}`}>{moves}</span>
              {maxMoves && <span className="text-sm text-[#8A7A5E] font-medium">/ {maxMoves} Allowed</span>}
            </div>
            {maxMoves && (
              <div className="w-full h-2 bg-[#E3E8E5] rounded-full mt-3 overflow-hidden">
                <div className={`h-full transition-all duration-300 ${moves > maxMoves * 0.9 ? 'bg-red-500' : 'bg-[#D4AF37]'}`} style={{ width: `${Math.min(100, (moves / maxMoves) * 100)}%` }} />
              </div>
            )}
          </div>

          <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#D4AF37]/20">
            <h4 className="font-bold text-xs text-[#8A7A5E] uppercase mb-4 tracking-widest font-['Cinzel']">Journey Map</h4>
            <ul className="space-y-4">
              {levels.map((lvl, idx) => (
                <li key={idx} className={`flex items-center justify-between text-sm ${idx === currentLevelIdx ? 'font-bold text-[#3E2723]' : 'text-[#8A7A5E]'}`}>
                  <span className="flex items-center gap-3">
                    {idx < currentLevelIdx ? <CheckCircle className="w-5 h-5 text-[#4A7C59]" /> :
                      idx === currentLevelIdx ? <span className="w-5 h-5 bg-[#D4AF37] rounded-full animate-pulse shadow-[0_0_10px_#D4AF37]"></span> :
                        <Lock className="w-4 h-4 opacity-50" />}
                    {lvl.label || `Level ${idx + 1}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <button onClick={startLevel} className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-[#D4AF37]/30 text-[#3E2723] font-bold hover:bg-[#D4AF37] hover:text-white transition-all font-['Cinzel'] tracking-wide">
            <RefreshCw className="w-4 h-4" /> Restart
          </button>
        </div>
      </div>
    </div>
  );
}
