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
  RefreshCw, Trophy, Lock, AlertTriangle, CheckCircle, Gift, Copy, Quote,
  Sparkles, Puzzle as PuzzleIcon, Crown
} from "lucide-react";

// --- THEME ASSETS ---
const parchmentBg = "url('/images/homepage/parchment-bg.png')";
const mandalaBg = "url('/images/homepage/mandala-bg.png')";

export default function Home() {
  const { homepage } = useSite();
  const isReady =
    Array.isArray(homepage?.blocks) && homepage.blocks.length > 0;
  return (
    <div className="bg-[#FAF7F2] min-h-screen font-['Lato'] text-[#5C4A2E] selection:bg-[#F3E5AB] selection:text-[#3E2723] pb-20 overflow-x-hidden">

      {/* Global Background Texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-100 z-0"
        style={{ backgroundImage: parchmentBg, backgroundSize: 'cover', backgroundAttachment: 'fixed' }}
      />

      {/* ✅ FIRST PAINT */}
      {!isReady && <HomeSkeleton />}

      {/* ✅ REAL CONTENT */}
      {isReady && (
        <div className="max-w-7xl 2xl:max-w-[1800px] mx-auto relative z-10">
          {homepage.blocks.map((b, i) => (
            <Block key={i} block={b} />
          ))}
        </div>
      )}
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

  // --- STATIC HERO BLOCK ---
  if (block.type === "hero") {
    return (
      <div className={containerClasses} style={containerStyle}>
        <section className="relative rounded-[2.5rem] overflow-hidden bg-[#3E2723] text-[#F3E5AB] shadow-[0_20px_50px_rgba(62,39,35,0.3)] group min-h-[400px] md:min-h-[500px] grid grid-cols-1 md:grid-cols-2 items-center border border-[#D4AF37]/30">
          {/* Texture Overlay */}
          <div className="absolute inset-0 z-0 opacity-10 mix-blend-overlay pointer-events-none" style={{ backgroundImage: mandalaBg, backgroundSize: '400px' }} />

          <div className="p-8 md:p-12 lg:p-16 z-10 relative">
            <div className="absolute top-0 left-0 w-32 h-32 bg-[#D4AF37] rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-40"></div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-['Playfair_Display'] font-bold mb-4 md:mb-6 leading-tight drop-shadow-md text-white">{block.title}</h2>
            <p className="text-[#D4AF37] text-lg md:text-xl mb-8 leading-relaxed max-w-lg font-light font-['Lato']">{block.subtitle}</p>
            {block.ctaText && (
              <Link to={block.ctaHref || "/catalog"} className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-[#C59D5F] to-[#B0894C] text-white rounded-full font-bold text-lg hover:from-[#D4AF37] hover:to-[#C59D5F] transition-all shadow-lg hover:shadow-[#D4AF37]/40 active:scale-95 group-hover:translate-x-1 duration-300 font-['Cinzel'] tracking-wide border border-[#F3E5AB]/30">
                {block.ctaText} <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>
          {block.image && (
            <div className="relative w-full h-64 md:h-full overflow-hidden">
              <img src={assetUrl(block.image)} alt="" className="absolute inset-0 w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#3E2723] to-transparent md:bg-gradient-to-l opacity-90"></div>
            </div>
          )}
        </section>
      </div>
    );
  }

  // --- HERO SLIDER ---
  if (block.type === "hero-slider") {
    return (
      <div className={containerClasses} style={containerStyle}>
        <HeroSlider slides={block.slides} />
      </div>
    );
  }

  // --- STANDARD SLIDER ---
  if (block.type === "slider") {
    return (
      <div className={containerClasses} style={containerStyle}>
        <HomepageSlider slides={block.slides} height={block.sliderHeight} />
      </div>
    );
  }

  // --- PUZZLE GAME (Royal Board) ---
  if (block.type === "puzzle") {
    const levels = block.levels || [
      { difficulty: "easy", image: block.image, gridSize: 3, label: "Level 1" },
      { difficulty: "medium", image: block.image, gridSize: 4, label: "Level 2" },
      { difficulty: "hard", image: block.image, gridSize: 5, maxMoves: 100, label: "Level 3" }
    ];

    return (
      <div className={containerClasses} style={containerStyle}>
        <div className="text-center mb-10">
          <div className="inline-block p-3 rounded-full bg-[#FFF9E6] border border-[#D4AF37]/30 mb-4 shadow-sm">
            <PuzzleIcon className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h2 className="text-3xl md:text-5xl font-['Cinzel'] font-bold text-[#3E2723] mb-3">
            {block.title}
          </h2>
          {block.subtitle && <p className="text-[#8A7A5E] text-lg max-w-2xl mx-auto">{block.subtitle}</p>}
        </div>
        <ProgressivePuzzleGame
          levels={levels}
          grandWinMessage={block.winMessage}
          rewardImage={block.rewardImage}
        />
      </div>
    );
  }

  // --- BANNER (Glassy) ---
  if (block.type === "banner") {
    const imageUrl = assetUrl(block.image);
    return (
      <div className={containerClasses} style={containerStyle}>
        <a href={block.ctaLink || "/"} className="block rounded-[2rem] overflow-hidden shadow-[0_15px_40px_rgba(62,39,35,0.15)] group relative isolate h-full w-full border border-[#D4AF37]/20">
          {/* Blurred BG */}
          <div
            className="absolute inset-0 -z-10 bg-cover bg-center blur-2xl scale-125 opacity-60 transition-all duration-500 group-hover:opacity-80"
            style={{ backgroundImage: `url(${imageUrl})` }}
            aria-hidden="true"
          ></div>

          {/* Main Image */}
          <img
            src={imageUrl}
            alt={block.alt || ""}
            className="w-full h-full object-contain relative z-10 transition-all duration-700 group-hover:scale-[1.02]"
          />

          {/* Shine */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-20 pointer-events-none" />
        </a>
      </div>
    );
  }

  // --- GRID SECTION ---
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
   PUZZLE GAME COMPONENT (Royal Theme)
--------------------------------------------------------------------------- */
function ProgressivePuzzleGame({ levels, grandWinMessage = "A Royal Victory!", rewardImage }) {
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
              <p className="mb-8 opacity-80 font-['Lato'] text-lg">Wisdom flows to those who persist.</p>
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

  const getHeight = (h) => {
    switch (h) {
      case 'small': return 'min-h-[350px] md:min-h-[400px]';
      case 'large': return 'min-h-[500px] md:min-h-[600px]';
      case 'medium':
      default: return 'min-h-[400px] md:min-h-[500px]';
    }
  };

  return (
    <div className={`relative w-full rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_rgba(62,39,35,0.3)] flex items-center group transition-all duration-300 ${getHeight(items[current].height)} border border-[#D4AF37]/30`}>
      {items.map((slide, idx) => (
        <div key={idx} className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${current === idx ? "opacity-100 z-10" : "opacity-0 z-0"}`} style={{ backgroundColor: slide.bgColor || '#3E2723' }}>
          {slide.layout === 'full' && slide.image && (
            <>
              <img src={assetUrl(slide.image)} alt={slide.title} className="absolute inset-0 w-full h-full object-cover object-center" />
              <div className="absolute inset-0 bg-black/40"></div>
            </>
          )}
          {slide.layout !== 'full' && (
            <>
              <div className="absolute inset-0 z-0 opacity-10 pointer-events-none mix-blend-overlay" style={{ backgroundImage: mandalaBg, backgroundSize: '400px' }} />
              {slide.image && (
                <div className="absolute inset-0 md:left-1/3 w-full md:w-2/3 h-full overflow-hidden">
                  <img src={assetUrl(slide.image)} alt={slide.title} className={`w-full h-full ${slide.objectFit === 'contain' ? 'object-contain p-8 md:p-12' : 'object-contain'} object-center opacity-40 md:opacity-100 transition-transform duration-700 ease-out group-hover:scale-105`} />
                  {slide.objectFit === 'cover' && <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${slide.bgColor || '#3E2723'} 5%, transparent 100%), linear-gradient(to top, ${slide.bgColor || '#3E2723'} 0%, transparent 50%)` }}></div>}
                </div>
              )}
            </>
          )}
          <div className="relative z-20 h-full px-8 md:px-16 flex items-center">
            <div className={`w-full md:w-1/2 pt-12 md:pt-0 ${slide.layout === 'full' ? 'md:mx-auto md:w-2/3 md:text-center text-center' : 'text-left'}`}>
              <h2 className="text-4xl md:text-6xl font-['Playfair_Display'] font-bold mb-6 tracking-tight leading-tight drop-shadow-md" style={{ color: slide.textColor || '#F3E5AB' }}>{slide.title}</h2>
              <p className="text-lg md:text-xl font-light mb-8 opacity-90 leading-relaxed font-['Lato']" style={{ color: slide.textColor || '#F3E5AB', maxWidth: '500px' }}>{slide.subtitle}</p>
              {slide.ctaText && (
                <Link to={slide.ctaLink || "/catalog"} className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-[#C59D5F] to-[#B0894C] text-white rounded-full font-bold text-lg hover:from-[#D4AF37] hover:to-[#C59D5F] transition-all shadow-lg active:scale-95 group-hover:translate-x-1 duration-300 font-['Cinzel'] border border-[#F3E5AB]/30">{slide.ctaText} <ArrowRight className="w-5 h-5" /></Link>
              )}
            </div>
          </div>
        </div>
      ))}
      {length > 1 && (
        <>
          <button onClick={prevSlide} className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-black/20 hover:bg-[#D4AF37] text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all z-30 border border-white/10 hover:border-[#D4AF37]"><ChevronLeft className="w-6 h-6" /></button>
          <button onClick={nextSlide} className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-black/20 hover:bg-[#D4AF37] text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all z-30 border border-white/10 hover:border-[#D4AF37]"><ChevronRight className="w-6 h-6" /></button>
          <div className="absolute bottom-8 left-10 md:left-20 flex gap-3 z-30">
            {items.map((_, idx) => <button key={idx} onClick={() => setCurrent(idx)} className={`h-1.5 rounded-full transition-all duration-500 ${current === idx ? "w-8 bg-[#D4AF37]" : "w-2 bg-white/30 hover:bg-white/60"}`} />)}
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
    <div className={`relative w-full rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(62,39,35,0.15)] group ${getHeightClass()} bg-[#FAF7F2] border border-[#D4AF37]/20`}>
      <div className="relative w-full h-full">
        {items.map((slide, idx) => (
          <div key={idx} className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${current === idx ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
            <div className="absolute inset-0 -z-10 bg-cover bg-center blur-3xl scale-125 opacity-50 transition-all duration-700" style={{ backgroundImage: `url(${slide.desktop})` }} aria-hidden="true"></div>
            <Link to={slide.link} className="block w-full h-full relative z-10">
              <picture className="w-full h-full block">
                <source media="(max-width: 767px)" srcSet={slide.mobile} />
                <source media="(min-width: 768px)" srcSet={slide.desktop} />
                <img src={slide.desktop} alt={slide.alt} className={`absolute inset-0 w-full h-full object-contain drop-shadow-xl`} />
              </picture>
            </Link>
          </div>
        ))}
      </div>
      {length > 1 && (
        <>
          <button onClick={prevSlide} className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-[#D4AF37] text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 hover:scale-110 z-20 border border-white/20"><ChevronLeft className="w-6 h-6" /></button>
          <button onClick={nextSlide} className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-[#D4AF37] text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 hover:scale-110 z-20 border border-white/20"><ChevronRight className="w-6 h-6" /></button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {items.map((_, idx) => <button key={idx} onClick={() => setCurrent(idx)} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${current === idx ? "bg-[#D4AF37] w-8 scale-110" : "bg-white/50 hover:bg-white/80"}`} />)}
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
  }, [q, sort, limit, JSON.stringify(categories)]);

  return (
    <section>
      {title && (
        <div className="flex items-center justify-between mb-8 md:mb-12 border-b border-[#D4AF37]/20 pb-4">
          <h3 className="text-3xl md:text-4xl font-['Cinzel'] font-bold text-[#3E2723] flex items-center gap-4">
            <span className="w-1.5 h-8 bg-[#D4AF37] rounded-full"></span>
            {title}
          </h3>
          <Link to="/catalog" className="text-[#D4AF37] hover:text-[#3E2723] font-bold text-sm flex items-center gap-1 transition-colors uppercase tracking-widest font-['Cinzel']">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
      {!items.length ? (
        <div className="rounded-[2rem] border border-[#D4AF37]/20 bg-white/50 p-12 text-center text-[#8A7A5E] italic font-['Cinzel']">No sacred treasures found.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8">
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
    <article className="group flex flex-col h-full bg-white rounded-[1.5rem] border border-[#D4AF37]/20 overflow-hidden hover:border-[#D4AF37] hover:shadow-[0_10px_30px_rgba(212,175,55,0.2)] transition-all duration-500 relative">
      <Link to={`/book/${book.slug}`} className="relative block w-full aspect-[3/4] bg-[#FAF7F2] overflow-hidden">
        {/* Subtle Mandala Texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: mandalaBg }}></div>
        <div className="w-full h-full p-6 flex items-center justify-center relative z-10">
          <img src={assetUrl(book.assets?.coverUrl)} alt={book.title} className="max-h-full max-w-full object-contain drop-shadow-md transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-1" loading="lazy" />
        </div>
        {off > 0 && <span className="absolute top-4 left-4 bg-[#3E2723] text-[#F3E5AB] text-[10px] font-bold px-2 py-1 rounded border border-[#D4AF37] shadow-sm z-20">-{off}%</span>}
      </Link>
      <div className="p-5 flex flex-col flex-grow text-center relative z-10">
        <Link to={`/book/${book.slug}`} className="font-['Cinzel'] font-bold text-[#3E2723] text-lg leading-tight line-clamp-2 mb-2 group-hover:text-[#D4AF37] transition-colors">{book.title}</Link>
        <div className="mt-auto pt-3 border-t border-[#D4AF37]/10 flex flex-col items-center gap-1">
          <span className="font-bold text-[#3E2723] text-xl font-['Playfair_Display']">₹{price}</span>
          {off > 0 && <span className="text-xs line-through text-[#8A7A5E] font-['Lato'] decoration-[#D4AF37]/50">₹{mrp}</span>}
        </div>
      </div>
    </article>
  );
}

function HomeSkeleton() {
  return (
    <div className="max-w-7xl 2xl:max-w-[1800px] mx-auto relative z-10 px-4 sm:px-6 lg:px-8">
      {/* Hero Skeleton */}
      <div className="pt-12 pb-12">
        <div className="rounded-[2.5rem] bg-[#3E2723]/10 h-[400px] md:h-[500px] animate-pulse" />
      </div>

      {/* Section Skeletons */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="py-12">
          <div className="h-8 w-64 bg-[#3E2723]/10 rounded mb-6 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((j) => (
              <div
                key={j}
                className="h-64 rounded-2xl bg-[#3E2723]/10 animate-pulse"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}