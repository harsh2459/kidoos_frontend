// src/pages/Home.jsx
import { useEffect, useState, useRef } from "react";
import { useSite } from "../contexts/SiteConfig";
import { api } from "../api/client";
import ProductCard from "../components/ProductCard";
import { Link, useNavigate } from "react-router-dom";
import { assetUrl } from "../api/asset";
import '../styles/style-button.css';
import ScrollToTopButton from "../components/ScrollToTopButton";
import {
  ArrowRight, ChevronLeft, ChevronRight,
  RefreshCw, Trophy, Lock, AlertTriangle, CheckCircle, Gift, Copy, Quote
} from "lucide-react";
import confetti from "canvas-confetti";

export default function Home() {
  const { homepage } = useSite();

  return (
    <div className="bg-[#F4F7F5] min-h-screen font-sans text-[#2C3E38] selection:bg-[#D4E2D4] selection:text-[#1A3C34] pb-20">
      <div className="max-w-7xl 2xl:max-w-[1800px] mx-auto">
        {(homepage.blocks || []).map((b, i) => <Block key={i} block={b} />)}
      </div>
      <ScrollToTopButton />
    </div>
  );
}

/* ----------------------------- Blocks Renderer ---------------------------- */
function Block({ block }) {
  const spacing = block.spacing || {
    paddingTop: "normal",
    paddingBottom: "normal",
    paddingX: "normal",
    backgroundColor: ""
  };

  const getSpacingClasses = () => {
    const classes = [];
    if (spacing.paddingTop === "none") classes.push("pt-0");
    else if (spacing.paddingTop === "small") classes.push("pt-4 md:pt-6");
    else if (spacing.paddingTop === "normal") classes.push("pt-8 md:pt-12");
    else if (spacing.paddingTop === "large") classes.push("pt-12 md:pt-20");

    if (spacing.paddingBottom === "none") classes.push("pb-0");
    else if (spacing.paddingBottom === "small") classes.push("pb-4 md:pb-6");
    else if (spacing.paddingBottom === "normal") classes.push("pb-8 md:pb-12");
    else if (spacing.paddingBottom === "large") classes.push("pb-12 md:pb-20");

    if (spacing.paddingX === "none") classes.push("px-0");
    else if (spacing.paddingX === "small") classes.push("px-2 sm:px-4");
    else if (spacing.paddingX === "normal") classes.push("px-4 sm:px-6 lg:px-8");
    else if (spacing.paddingX === "large") classes.push("px-8 sm:px-12 lg:px-16");

    return classes.join(" ");
  };

  const containerClasses = getSpacingClasses();
  const containerStyle = spacing.backgroundColor ? { backgroundColor: spacing.backgroundColor } : {};

  if (block.type === "hero") {
    return (
      <div className={containerClasses} style={containerStyle}>
        <section className="relative rounded-3xl overflow-hidden bg-[#1A3C34] text-white shadow-xl group min-h-[400px] md:min-h-[500px] grid grid-cols-1 md:grid-cols-2 items-center">
          <div className="p-8 md:p-12 lg:p-16 z-10 relative">
            <div className="absolute top-0 left-0 w-32 h-32 bg-[#4A7C59]/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4 md:mb-6 leading-tight drop-shadow-sm">{block.title}</h2>
            <p className="text-[#8BA699] text-lg md:text-xl mb-8 leading-relaxed max-w-lg font-light">{block.subtitle}</p>
            {block.ctaText && (
              <Link to={block.ctaHref || "/catalog"} className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#1A3C34] rounded-xl font-bold text-lg hover:bg-[#E8F0EB] transition-all shadow-lg hover:shadow-xl active:scale-95 group-hover:translate-x-1 duration-300">
                {block.ctaText} <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>
          {block.image && (
            <div className="relative w-full h-64 md:h-full overflow-hidden">
              <img src={assetUrl(block.image)} alt="" className="absolute inset-0 w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A3C34]/80 to-transparent md:bg-gradient-to-l"></div>
            </div>
          )}
        </section>
      </div>
    );
  }

  // Hero Slider Block
  if (block.type === "hero-slider") {
    return (
      <div className={containerClasses} style={containerStyle}>
        <HeroSlider slides={block.slides} />
      </div>
    );
  }

  // Standard Image Slider
  if (block.type === "slider") {
    return (
      <div className={containerClasses} style={containerStyle}>
        <HomepageSlider slides={block.slides} height={block.sliderHeight} />
      </div>
    );
  }

  // Progressive Puzzle Game Block
  if (block.type === "puzzle") {
    const levels = block.levels || [
      { difficulty: "easy", image: block.image, gridSize: 3, label: "Level 1" },
      { difficulty: "medium", image: block.image, gridSize: 4, label: "Level 2" },
      { difficulty: "hard", image: block.image, gridSize: 5, maxMoves: 100, label: "Level 3" }
    ];

    return (
      <div className={containerClasses} style={containerStyle}>
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#1A3C34] flex items-center justify-center gap-3">
            <PuzzleIcon className="w-8 h-8 text-[#4A7C59]" />
            {block.title}
          </h2>
          {block.subtitle && <p className="text-[#5C756D] mt-3 text-lg">{block.subtitle}</p>}
        </div>
        <ProgressivePuzzleGame
          levels={levels}
          grandWinMessage={block.winMessage}
          rewardImage={block.rewardImage}
        />
      </div>
    );
  }

  // ✅ UPDATED: Banner Block with Blurred Background Effect
  if (block.type === "banner") {
    const imageUrl = assetUrl(block.image);
    return (
      <div className={containerClasses} style={containerStyle}>
        {/* Added 'isolate' to manage z-index stack properly */}
        <a href={block.ctaLink || "/"} className="block rounded-theme overflow-hidden shadow-theme group relative isolate h-full w-full">

          {/* 1. The Blurred Background Layer */}
          <div
            className="absolute inset-0 -z-10 bg-cover bg-center blur-2xl scale-125 opacity-70 transition-all duration-500 group-hover:opacity-80"
            style={{ backgroundImage: `url(${imageUrl})` }}
            aria-hidden="true"
          ></div>

          {/* 2. The Main Image (Object Contain) */}
          <img
            src={imageUrl}
            alt={block.alt || ""}
            className="w-full h-full object-contain relative z-10 transition-all duration-500 group-hover:scale-[1.02]"
          />

          {/* Hover Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-20" />
        </a>
      </div>
    );
  }

  if (block.type === "grid") {
    return (
      <div className={containerClasses} style={containerStyle}>
        <GridSection title={block.title} query={block.query} />
      </div>
    );
  }

  if (block.type === "html") {
    return (
      <div style={containerStyle} dangerouslySetInnerHTML={{ __html: block.html }} />
    );
  }

  return null;
}

/* --------------------------------------------------------------------------
   PROGRESSIVE PUZZLE GAME COMPONENT
--------------------------------------------------------------------------- */
function ProgressivePuzzleGame({ levels, grandWinMessage = "Champion!", rewardImage }) {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);

  // Game State
  const [tiles, setTiles] = useState([]);
  const [emptyIndex, setEmptyIndex] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const navigate = useNavigate();

  // Helper to get current level config safely
  const currentConfig = levels[currentLevelIdx] || levels[0] || {};
  const gridSize = currentConfig.gridSize || 3;
  const maxMoves = currentConfig.maxMoves || null;

  // Start/Restart Level
  useEffect(() => {
    startLevel();
    // eslint-disable-next-line
  }, [currentLevelIdx, currentConfig.image]);

  const startLevel = () => {
    if (!currentConfig.image) return;

    const totalTiles = gridSize * gridSize;
    let newTiles = Array.from({ length: totalTiles }, (_, i) => i);
    let emptyIdx = totalTiles - 1;

    // Shuffle
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

      // Check Move Limit (Hard Mode)
      if (maxMoves && newMoves > maxMoves) {
        setGameOver(true);
        return;
      }

      // Check Win
      const isSorted = newTiles.every((val, i) => val === i);
      if (isSorted) {
        handleWin();
      }
    }
  };

  const handleWin = () => {
    setIsLevelComplete(true);

    // Confetti based on level intensity
    const particleCount = currentLevelIdx === 0 ? 50 : currentLevelIdx === 1 ? 100 : 300;
    confetti({ particleCount, spread: 70, origin: { y: 0.6 } });

    // If it was the last level
    if (currentLevelIdx >= levels.length - 1) {
      localStorage.setItem('puzzle_reward_claimed', 'true');
      setTimeout(() => setIsGameComplete(true), 1200);
    }
  };

  const nextLevel = () => {
    if (currentLevelIdx < levels.length - 1) {
      setCurrentLevelIdx(prev => prev + 1);
    }
  };

  if (!currentConfig.image) return <div className="p-8 text-center bg-gray-100 rounded-xl text-gray-500">Please configure puzzle images in Admin.</div>;

  return (
    <div className="max-w-4xl mx-auto grid md:grid-cols-[1fr_300px] gap-8 items-start">

      {/* LEFT: Game Board */}
      <div className="flex flex-col items-center w-full">
        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-6 w-full max-w-[500px]">
          {levels.map((_, idx) => (
            <div key={idx} className={`h-2 flex-1 rounded-full transition-all duration-500 ${idx < currentLevelIdx ? 'bg-[#4A7C59]' :
                idx === currentLevelIdx ? 'bg-[#F4A261]' : 'bg-gray-200'
              }`} />
          ))}
        </div>

        <div className="relative bg-[#1A3C34] p-3 rounded-2xl shadow-xl w-full max-w-[500px] aspect-square select-none">
          {/* Grid */}
          <div
            className="grid w-full h-full gap-1 bg-[#1A3C34]"
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
                  className={`relative w-full h-full rounded overflow-hidden transition-all duration-200 
                      ${isEmpty && !isLevelComplete ? 'bg-[#1A3C34]/50 opacity-0' : 'cursor-pointer hover:brightness-110 shadow-sm'}
                      ${isLevelComplete ? 'opacity-100' : ''}
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
                  {/* Numbers helper for Easy Mode */}
                  {gridSize === 3 && !isLevelComplete && !isEmpty && (
                    <span className="absolute bottom-1 right-1 text-[10px] bg-black/40 text-white px-1.5 rounded-full font-bold shadow-sm">{tileNumber + 1}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* OVERLAY: Level Complete */}
          {isLevelComplete && !isGameComplete && (
            <div className="absolute inset-0 z-10 bg-black/70 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center text-white animate-in fade-in p-6 text-center">
              <Trophy className="w-16 h-16 text-yellow-400 mb-4 animate-bounce" />
              <h3 className="text-2xl font-bold mb-2">Level Complete!</h3>
              <p className="mb-6 opacity-90">Great job! Ready for the next challenge?</p>
              <button onClick={nextLevel} className="mt-2 bg-[#4A7C59] hover:bg-[#5C756D] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-transform active:scale-95">
                Next Level <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* OVERLAY: Grand Winner (Reward Unlocked) */}
          {isGameComplete && (
            <div className="absolute inset-0 z-20 bg-white rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-300">
              <div className="w-full max-w-sm mx-auto flex flex-col items-center">
                {/* Reward Image */}
                {rewardImage && (
                  <img
                    src={assetUrl(rewardImage)}
                    alt="Reward"
                    className="w-32 h-auto mx-auto mb-4 drop-shadow-lg animate-bounce"
                  />
                )}

                <h2 className="text-2xl font-bold mb-1 text-[#1A3C34] font-serif">{grandWinMessage}</h2>

                {/* Discount Badge */}
                <div className="bg-[#E8F0EB] text-[#1A3C34] p-5 rounded-xl mt-4 mb-6 border-2 border-[#4A7C59] w-full">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Gift className="w-5 h-5 text-[#4A7C59]" />
                    <span className="font-bold text-lg uppercase tracking-wide">Discount Unlocked</span>
                  </div>
                  <p className="text-sm">You get <span className="font-bold text-xl text-red-600">20% OFF</span> on any book!</p>
                  <p className="text-xs text-[#5C756D] mt-1">Applied automatically at checkout.</p>
                </div>

                <button
                  onClick={() => navigate('/catalog')}
                  className="bg-[#1A3C34] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#2F523F] shadow-lg active:scale-95 w-full flex items-center justify-center gap-2"
                >
                  Shop Now <ArrowRight className="w-4 h-4" />
                </button>

                <button onClick={() => window.location.reload()} className="mt-4 text-[#8BA699] hover:text-[#1A3C34] text-xs font-bold underline transition-colors">
                  Play Again
                </button>
              </div>
            </div>
          )}

          {/* OVERLAY: Game Over (Moves Exceeded) */}
          {gameOver && (
            <div className="absolute inset-0 z-10 bg-red-900/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center text-white animate-in fade-in p-6 text-center">
              <AlertTriangle className="w-16 h-16 text-red-200 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Out of Moves!</h3>
              <p className="mb-6 opacity-90">You exceeded the {maxMoves} move limit for this hard level.</p>
              <button onClick={startLevel} className="bg-white text-red-900 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 shadow-lg active:scale-95 transition-transform">
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Stats & Instructions Sidebar */}
      <div className="bg-white p-6 rounded-2xl border border-[#E3E8E5] shadow-sm h-full w-full">
        <h3 className="font-serif font-bold text-xl text-[#1A3C34] mb-6 border-b pb-4">Game Stats</h3>

        <div className="space-y-6">
          {/* Level Indicator */}
          <div>
            <span className="text-xs uppercase font-bold text-[#8BA699] block mb-1">Current Difficulty</span>
            <div className="flex items-center gap-2 text-lg font-bold text-[#1A3C34]">
              {currentConfig.difficulty === 'easy' && <span className="text-green-600 flex items-center gap-1">Easy (3x3)</span>}
              {currentConfig.difficulty === 'medium' && <span className="text-yellow-600 flex items-center gap-1">Medium (4x4)</span>}
              {currentConfig.difficulty === 'hard' && <span className="text-red-600 flex items-center gap-1">Hard (5x5)</span>}
            </div>
          </div>

          {/* Move Counter */}
          <div>
            <span className="text-xs uppercase font-bold text-[#8BA699] block mb-1">Moves Taken</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${maxMoves && moves > maxMoves * 0.8 ? 'text-red-500' : 'text-[#1A3C34]'}`}>
                {moves}
              </span>
              {maxMoves && (
                <span className="text-sm text-gray-400 font-medium">/ {maxMoves} Limit</span>
              )}
            </div>
            {maxMoves && (
              <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${moves > maxMoves * 0.9 ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min(100, (moves / maxMoves) * 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Level List */}
          <div className="bg-[#FAFBF9] p-4 rounded-xl border border-[#E3E8E5]">
            <h4 className="font-bold text-xs text-[#8BA699] uppercase mb-3 tracking-wider">Progression</h4>
            <ul className="space-y-3">
              {levels.map((lvl, idx) => (
                <li key={idx} className={`flex items-center justify-between text-sm ${idx === currentLevelIdx ? 'font-bold text-[#1A3C34]' : 'text-gray-400'}`}>
                  <span className="flex items-center gap-2">
                    {idx < currentLevelIdx ? <CheckCircle className="w-4 h-4 text-green-500" /> :
                      idx === currentLevelIdx ? <span className="w-4 h-4 bg-[#F4A261] rounded-full animate-pulse shadow-sm"></span> :
                        <Lock className="w-3 h-3" />}
                    {lvl.label || `Level ${idx + 1}`}
                  </span>
                  {idx === 2 && lvl.maxMoves && (
                    <span className="text-[10px] bg-red-50 text-red-600 border border-red-100 px-1.5 py-0.5 rounded font-medium">
                      Limit: {lvl.maxMoves}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={startLevel}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#DCE4E0] text-[#5C756D] font-bold hover:bg-[#F4F7F5] transition-colors active:bg-[#E8F0EB]"
          >
            <RefreshCw className="w-4 h-4" /> Restart Level
          </button>
        </div>
      </div>
    </div>
  );
}

// Simple Icon component
function PuzzleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19.439 7.85c0 .249.047.492.14.72l2.38 5.76c.22.53.03 1.14-.45 1.45l-1.63 1.05a1.2 1.2 0 0 1-1.39-.06l-.57-.42a.55.55 0 0 0-.66 0l-2.07 1.55a1.2 1.2 0 0 1-1.42.02l-1.36-.96a.55.55 0 0 0-.63 0l-1.12.82a1.2 1.2 0 0 1-1.41 0l-1.12-.82a.55.55 0 0 0-.63 0l-1.36.96a1.2 1.2 0 0 1-1.42-.02L2.05 16.3a.55.55 0 0 0-.66 0l-.57.42a1.2 1.2 0 0 1-1.39.06l-1.63-1.05c-.48-.31-.67-.92-.45-1.45l2.38-5.76a1.99 1.99 0 0 0 .14-.72 4 4 0 0 1 4-4h.24a4 4 0 0 1 3.53 2.22l.23.46c.19.38.58.62 1 .62s.81-.24 1-.62l.23-.46A4 4 0 0 1 13.76 3.85h.24a4 4 0 0 1 4 4z" />
    </svg>
  )
}

/* ------------------------- HERO SLIDER COMPONENT ------------------------- */
function HeroSlider({ slides }) {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef(null);

  const items = Array.isArray(slides) ? slides : [];
  const length = items.length;

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (length > 1) {
      timeoutRef.current = setTimeout(() => setCurrent((prev) => (prev === length - 1 ? 0 : prev + 1)), 6000);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [current, length]);

  const nextSlide = () => setCurrent(current === length - 1 ? 0 : current + 1);
  const prevSlide = () => setCurrent(current === 0 ? length - 1 : current - 1);

  if (!length) return null;

  // Helper to determine height class per slide
  const getHeight = (h) => {
    switch (h) {
      case 'small': return 'min-h-[350px] md:min-h-[400px]';
      case 'large': return 'min-h-[500px] md:min-h-[600px]';
      case 'medium':
      default: return 'min-h-[400px] md:min-h-[500px]';
    }
  };

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden shadow-xl flex items-center group transition-all duration-300 ${getHeight(items[current].height)}`}>

      {items.map((slide, idx) => {
        const isFull = slide.layout === 'full';
        const fit = slide.objectFit || 'cover';
        const bgColor = slide.bgColor || '#1A3C34';
        const textColor = slide.textColor || '#ffffff';

        return (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${current === idx ? "opacity-100 z-10" : "opacity-0 z-0"}`}
            style={{ backgroundColor: bgColor }}
          >
            {/* === TYPE 1: FULL BANNER === */}
            {isFull && slide.image && (
              <>
                <img src={assetUrl(slide.image)} alt={slide.title} className="absolute inset-0 w-full h-full object-contain" />
                <div className="absolute inset-0 bg-black/40"></div>
              </>
            )}

            {/* === TYPE 2: SPLIT LAYOUT === */}
            {!isFull && (
              <>
                {/* Optional Pattern Background */}
                <div className="absolute inset-0 z-0 opacity-10 pointer-events-none mix-blend-overlay" style={{ backgroundImage: "url('/public/assets/pattern.png')", backgroundSize: '200px' }} />
                {/* Decorative Blur */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                {slide.image && (
                  <div className="absolute inset-0 md:left-1/3 w-full md:w-2/3 h-full overflow-hidden">
                    <img
                      src={assetUrl(slide.image)}
                      alt={slide.title}
                      className={`w-full h-full ${fit === 'contain' ? 'object-contain p-8 md:p-12' : 'object-contain'} object-center opacity-40 md:opacity-100 transition-transform duration-700 ease-out group-hover:scale-105`}
                    />
                    {/* Gradient blend */}
                    {fit === 'cover' && (
                      <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${bgColor} 5%, transparent 100%), linear-gradient(to top, ${bgColor} 0%, transparent 50%)` }}></div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* TEXT CONTENT */}
            <div className="relative z-20 h-full px-8 md:px-16 flex items-center">
              <div className={`w-full md:w-1/2 pt-12 md:pt-0 ${isFull ? 'md:mx-auto md:w-2/3 md:text-center text-center' : 'text-left'}`}>
                <h2
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 tracking-tight leading-tight drop-shadow-md"
                  style={{ color: textColor }}
                >
                  {slide.title}
                </h2>
                <p
                  className={`text-lg md:text-xl font-light mb-8 opacity-90 leading-relaxed ${isFull ? 'mx-auto' : ''}`}
                  style={{ color: textColor, maxWidth: '500px' }}
                >
                  {slide.subtitle}
                </p>

                {slide.ctaText && (
                  <Link
                    to={slide.ctaLink || "/catalog"}
                    className={`inline-flex items-center gap-2 px-8 py-4 bg-white text-[#1A3C34] rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-lg active:scale-95 group-hover:translate-x-1 duration-300 ${isFull ? 'mx-auto' : ''}`}
                  >
                    {slide.ctaText} <ArrowRight className="w-5 h-5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {/* Controls */}
      {length > 1 && (
        <>
          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all z-30 border border-white/10 hover:scale-110"><ChevronLeft className="w-6 h-6" /></button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all z-30 border border-white/10 hover:scale-110"><ChevronRight className="w-6 h-6" /></button>
          <div className="absolute bottom-8 left-8 md:left-16 flex gap-3 z-30">
            {items.map((_, idx) => (
              <button key={idx} onClick={() => setCurrent(idx)} className={`h-1.5 rounded-full transition-all duration-500 ${current === idx ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------- Standard Image Slider Component ------------------------- */
function HomepageSlider({ slides, height = "medium" }) {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef(null);

  const items = (Array.isArray(slides) ? slides : []).map(s => ({
    desktop: assetUrl(s.desktopImage || s.image),
    mobile: assetUrl(s.mobileImage || s.desktopImage || s.image),
    link: s.link || "#",
    alt: s.alt || "Slider Image",
    fit: s.objectFit || "cover"
  }));

  const length = items.length;

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCurrent((prev) => (prev === length - 1 ? 0 : prev + 1)), 5000);
    return () => clearTimeout(timeoutRef.current);
  }, [current, length]);

  const nextSlide = () => setCurrent(current === length - 1 ? 0 : current + 1);
  const prevSlide = () => setCurrent(current === 0 ? length - 1 : current - 1);

  if (!length) return null;

  const getHeightClass = () => {
    switch (height) {
      case "small": return "h-[300px] md:h-[400px]";
      case "large": return "h-[500px] md:h-[700px]";
      case "medium":
      default: return "h-[400px] md:h-[500px]";
    }
  };

  return (
    // ✅ REMOVED bg-gray-900 here so the blurred background shows instead
    <div className={`relative w-full rounded-3xl overflow-hidden shadow-xl group ${getHeightClass()} bg-[#F4F7F5]`}>
      <div className="relative w-full h-full">
        {items.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${current === idx ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          >
            {/* ✅ ADDED Blurred Background Layer specifically for this slide */}
            <div
              className="absolute inset-0 -z-10 bg-cover bg-center blur-2xl scale-125 opacity-60 transition-all duration-700"
              style={{ backgroundImage: `url(${slide.desktop})` }}
              aria-hidden="true"
            ></div>

            <Link to={slide.link} className="block w-full h-full relative z-10">
              <picture className="w-full h-full block">
                <source media="(max-width: 767px)" srcSet={slide.mobile} />
                <source media="(min-width: 768px)" srcSet={slide.desktop} />
                {/* Ensure object-contain is used */}
                <img src={slide.desktop} alt={slide.alt} className={`absolute inset-0 w-full h-full object-contain`} />
              </picture>
            </Link>
          </div>
        ))}
      </div>
      {length > 1 && (
        <>
          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/20 hover:bg-white text-white hover:text-[#1A3C34] rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 hover:scale-110 z-20"><ChevronLeft className="w-6 h-6" /></button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/20 hover:bg-white text-white hover:text-[#1A3C34] rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 hover:scale-110 z-20"><ChevronRight className="w-6 h-6" /></button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {items.map((_, idx) => (
              <button key={idx} onClick={() => setCurrent(idx)} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${current === idx ? "bg-white w-8" : "bg-white/50 hover:bg-white/80"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------- Grid Section & Cards ------------------------- */
function GridSection({ title, query }) {
  const [items, setItems] = useState([]);
  const layout = query?.layout || "classic";
  const limit = Number(query?.limit || 12);
  const q = query?.q || "";
  const sort = query?.sort || "new";

  const categories = (query?.category || "").split(",").map(s => s.trim()).filter(Boolean).map(s => s.toLowerCase());

  useEffect(() => {
    (async () => {
      const params = { q, sort, limit };
      if (categories.length) params.categories = categories;

      const { data } = await api.get("/books", { params });
      let list = Array.isArray(data.items) ? data.items : [];

      if (categories.length) {
        list = list.filter(b => {
          const bookCats = (b?.categories || []).map(c => String(c).toLowerCase().trim());
          return categories.some(c => bookCats.includes(c));
        });
      }
      setItems(list.slice(0, limit));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, sort, limit, JSON.stringify(categories)]);

  return (
    <section>
      {title && (
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#1A3C34] flex items-center gap-3"><span className="w-2 h-8 bg-[#4A7C59] rounded-full"></span>{title}</h3>
          <Link to="/catalog" className="text-[#4A7C59] hover:text-[#1A3C34] font-medium text-sm flex items-center gap-1 transition-colors">View All <ArrowRight className="w-4 h-4" /></Link>
        </div>
      )}
      {!items.length ? (
        <div className="rounded-2xl border border-[#E3E8E5] bg-white p-8 text-center text-[#8BA699] italic">No items found in this collection.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
          {items.map((b) => layout === "classic" ? (<div key={b._id || b.id} className="h-full"><ProductCard book={b} /></div>) : (<SimpleShowcaseCard key={b._id || b.id} book={b} />))}
        </div>
      )}
    </section>
  );
}

function SimpleShowcaseCard({ book }) {
  const mrp = Number(book.mrp) || 0;
  const price = Number(book.price) || 0;
  const off = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <article className="group flex flex-col h-full bg-white rounded-2xl border border-[#E3E8E5] overflow-hidden hover:border-[#4A7C59] hover:shadow-lg transition-all duration-300">
      <Link to={`/book/${book.slug}`} className="relative block w-full aspect-[3/4] bg-[#F4F7F5] overflow-hidden">
        <div className="w-full h-full p-4 flex items-center justify-center">
          <img src={assetUrl(book.assets?.coverUrl)} alt={book.title} className="max-h-full max-w-full object-contain drop-shadow-sm transition-transform duration-500 ease-out group-hover:scale-110" loading="lazy" />
        </div>
        {off > 0 && <span className="absolute top-3 left-3 bg-[#E8F0EB] text-[#1A3C34] text-[10px] font-bold px-2 py-1 rounded border border-[#DCE4E0]">-{off}%</span>}
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <Link to={`/book/${book.slug}`} className="font-serif font-bold text-[#1A3C34] text-base leading-tight line-clamp-2 mb-1 group-hover:text-[#4A7C59] transition-colors">{book.title}</Link>
        <div className="mt-auto pt-3 flex items-center gap-2">
          <span className="font-bold text-[#1A3C34] text-lg">₹{price}</span>
          {off > 0 && <span className="text-xs line-through text-[#8BA699]">₹{mrp}</span>}
        </div>
      </div>
    </article>
  );
}