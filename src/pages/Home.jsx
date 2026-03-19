// src/pages/Home.jsx
import { useEffect, useState, useRef, lazy, Suspense, useCallback } from "react";
import { useInView } from "../hooks/useInView";
import { useSite } from "../contexts/SiteConfig";
import { api } from "../api/client";
import ProductCard from "../components/ProductCard";
import { Link, useNavigate } from "react-router-dom";
import { assetUrl } from "../api/asset";
import '../styles/style-button.css';
import ScrollToTopButton from "../components/ScrollToTopButton";
import SEO from "../components/SEO";
import {
  ArrowRight, ChevronLeft, ChevronRight,
  RefreshCw, Trophy, Lock, AlertTriangle, CheckCircle, Gift, Copy, Quote,
  Sparkles, Puzzle as PuzzleIcon, Crown
} from "lucide-react";

// --- THEME ASSETS ---
const parchmentBg = "url('/images-webp/homepage/parchment-bg.webp')";
const mandalaBg = "url('/images-webp/homepage/mandala-bg.webp')";


export default function Home() {
  const { homepage } = useSite();
  const isReady =
    Array.isArray(homepage?.blocks) && homepage.blocks.length > 0;
  return (
    <div className="bg-[#FAF7F2] min-h-screen text-[#5C4A2E] selection:bg-[#F3E5AB] selection:text-[#3E2723] pb-20 overflow-x-hidden" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      <SEO
        title="Kiddos Intellect - Premium Children's Books | Educational Learning Materials"
        description="Discover hand-picked children's books and educational materials. Healthy Minds Grow Beyond Screens. Shop premium learning resources for curious young minds in India."
        image="/images/homepage/hero-banner.jpg"
        type="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Kiddos Intellect",
          "description": "Premium children's books and educational materials provider",
          "url": typeof window !== 'undefined' ? window.location.origin : '',
          "logo": typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : ''
        }}
      />

      {/* Global Background Texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-100 z-0"
        style={{ backgroundImage: parchmentBg, backgroundSize: 'cover' }}
      />

      {/* ✅ FIRST PAINT — static hero shows instantly before API loads */}
      {!isReady && (
        <div className="max-w-7xl 2xl:max-w-[1800px] mx-auto relative z-10 px-4 sm:px-6 lg:px-8">
          {/* Hero image — fixed height matches dynamic hero so no layout shift */}
          <div className="pt-8 md:pt-12 pb-8 md:pb-12">
            <picture>
              <source media="(max-width: 767px)" srcSet="/images/homepageslider-mobile.webp" />
              <img
                src="/images/homepageslider.jpg"
                alt="Kiddos Intellect"
                loading="eager"
                fetchpriority="high"
                decoding="sync"
                width="1200"
                height="500"
                className="w-full rounded-[2.5rem] object-cover h-[400px] md:h-[500px] shadow-[0_20px_60px_rgba(62,39,35,0.3)]"
              />
            </picture>
          </div>

          {/* Skeleton sections below — preserve total page height to prevent CLS */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="py-12">
              <div className="h-8 w-64 bg-[#3E2723]/10 rounded mb-6 animate-pulse" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-64 rounded-2xl bg-[#3E2723]/10 animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

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
  // Must be at top level — used only when block.type === "puzzle"
  const handlePuzzleWin = useCallback(async () => {
    try {
      await api.post("/customer/puzzle/claim");
    } catch (_) {
      // Silently fail — localStorage fallback still works for UI display
    }
  }, []);

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
            <p className="text-[#D4AF37] text-lg md:text-xl mb-8 leading-relaxed max-w-lg font-light font-['Inter']">{block.subtitle}</p>
            {block.ctaText && (
              <Link to={block.ctaHref || "/catalog"} className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-[#C59D5F] to-[#B0894C] text-white rounded-full font-bold text-lg hover:from-[#D4AF37] hover:to-[#C59D5F] transition-all shadow-lg hover:shadow-[#D4AF37]/40 active:scale-95 group-hover:translate-x-1 duration-300 font-['Cinzel'] tracking-wide border border-[#F3E5AB]/30">
                {block.ctaText} <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>
          {block.image && (
            <div className="relative w-full h-64 md:h-full overflow-hidden">
              <img src={assetUrl(block.image, "hero")} alt="" loading="eager" fetchpriority="high" decoding="async" className="absolute inset-0 w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-105" />
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
    // Override bottom spacing to minimal — dots are now inside the image
    const sliderClasses = containerClasses.replace(/pb-\S+/g, "pb-2 md:pb-3");
    return (
      <div className={sliderClasses} style={containerStyle}>
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
        <Suspense fallback={
          <div className="max-w-5xl mx-auto h-[500px] rounded-[1.5rem] bg-[#3E2723]/10 animate-pulse" />
        }>
          <ProgressivePuzzleGame
            levels={levels}
            grandWinMessage={block.winMessage}
            rewardImage={block.rewardImage}
            onWin={handlePuzzleWin}
          />
        </Suspense>
      </div>
    );
  }

  // --- BANNER (Glassy) ---
  if (block.type === "banner") {
    const imageUrl = assetUrl(block.image, "hero");
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
            loading="lazy"
            decoding="async"
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

  if (block.type === "category-browser") {
    return (
      <div className={containerClasses} style={containerStyle}>
        <CategoryBrowser block={block} />
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
   PUZZLE GAME COMPONENT â€" lazy-loaded so its JS is not in the initial bundle
--------------------------------------------------------------------------- */
const ProgressivePuzzleGame = lazy(() => import("../components/ProgressivePuzzleGame"));


/* ------------------------- HERO SLIDER COMPONENT ------------------------- */
// ... (HeroSlider remains unchanged) ...
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

  // Lock to first slide height — prevents layout shift (CLS) on slide advance
  const containerHeight = getHeight(items[0].height);

  return (
    <div className={`relative w-full rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_rgba(62,39,35,0.3)] flex items-center group transition-all duration-300 ${containerHeight} border border-[#D4AF37]/30`}>
      {items.map((slide, idx) => (
        <div key={idx} className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${current === idx ? "opacity-100 z-10" : "opacity-0 z-0"}`} style={{ backgroundColor: slide.bgColor || '#3E2723' }}>
          {slide.layout === 'full' && slide.image && (
            <>
              <img src={assetUrl(slide.image, "hero")} alt={slide.title} loading={idx === 0 ? "eager" : "lazy"} fetchpriority={idx === 0 ? "high" : "auto"} decoding="async" className="absolute inset-0 w-full h-full object-cover object-center" />
              <div className="absolute inset-0 bg-black/40"></div>
            </>
          )}
          {slide.layout !== 'full' && (
            <>
              <div className="absolute inset-0 z-0 opacity-10 pointer-events-none mix-blend-overlay" style={{ backgroundImage: mandalaBg, backgroundSize: '400px' }} />
              {slide.image && (
                <div className="absolute inset-0 md:left-1/3 w-full md:w-2/3 h-full overflow-hidden">
                  <img src={assetUrl(slide.image, "hero")} alt={slide.title} loading={idx === 0 ? "eager" : "lazy"} fetchpriority={idx === 0 ? "high" : "auto"} decoding="async" className={`w-full h-full ${slide.objectFit === 'contain' ? 'object-contain p-8 md:p-12' : 'object-contain'} object-center opacity-40 md:opacity-100 transition-transform duration-700 ease-out group-hover:scale-105`} />
                  {slide.objectFit === 'cover' && <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${slide.bgColor || '#3E2723'} 5%, transparent 100%), linear-gradient(to top, ${slide.bgColor || '#3E2723'} 0%, transparent 50%)` }}></div>}
                </div>
              )}
            </>
          )}
          <div className="relative z-20 h-full px-8 md:px-16 flex items-center">
            <div className={`w-full md:w-1/2 pt-12 md:pt-0 ${slide.layout === 'full' ? 'md:mx-auto md:w-2/3 md:text-center text-center' : 'text-left'}`}>
              <h2 className="text-4xl md:text-6xl font-['Playfair_Display'] font-bold mb-6 tracking-tight leading-tight drop-shadow-md" style={{ color: slide.textColor || '#F3E5AB' }}>{slide.title}</h2>
              <p className="text-lg md:text-xl font-light mb-8 opacity-90 leading-relaxed font-['Inter']" style={{ color: slide.textColor || '#F3E5AB', maxWidth: '500px' }}>{slide.subtitle}</p>
              {slide.ctaText && (
                <Link to={slide.ctaLink || "/catalog"} className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-[#C59D5F] to-[#B0894C] text-white rounded-full font-bold text-lg hover:from-[#D4AF37] hover:to-[#C59D5F] transition-all shadow-lg active:scale-95 group-hover:translate-x-1 duration-300 font-['Cinzel'] border border-[#F3E5AB]/30">{slide.ctaText} <ArrowRight className="w-5 h-5" /></Link>
              )}
            </div>
          </div>
        </div>
      ))}
      {length > 1 && (
        <>
          <button onMouseDown={e => e.preventDefault()} onClick={prevSlide} className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-black/20 hover:bg-[#D4AF37] text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all z-30 border border-white/10 hover:border-[#D4AF37]"><ChevronLeft className="w-6 h-6" /></button>
          <button onMouseDown={e => e.preventDefault()} onClick={nextSlide} className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-black/20 hover:bg-[#D4AF37] text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all z-30 border border-white/10 hover:border-[#D4AF37]"><ChevronRight className="w-6 h-6" /></button>
          <div className="absolute bottom-8 left-10 md:left-20 flex gap-3 z-30">
            {items.map((_, idx) => <button key={idx} onMouseDown={e => e.preventDefault()} onClick={() => setCurrent(idx)} className={`h-1.5 rounded-full transition-all duration-500 ${current === idx ? "w-8 bg-[#D4AF37]" : "w-2 bg-white/40 hover:bg-white/60"}`} />)}
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------- Standard Image Slider — Cinematic Fade ------------------------- */
function HomepageSlider({ slides }) {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef(null);

  const items = (Array.isArray(slides) ? slides : []).map(s => ({
    desktop: assetUrl(s.desktopImage || s.image, "hero"),
    mobile: assetUrl(s.mobileImage || s.desktopImage || s.image, "thumb"),
    link: s.link || "#",
    alt: s.alt || "Slider Image",
  }));
  const length = items.length;

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCurrent(c => (c + 1) % length), 4800);
    return () => clearTimeout(timeoutRef.current);
  }, [current, length]);

  const go = (dir) => setCurrent(c => ((c + dir) + length) % length);

  if (!length) return null;

  return (
    <div className="relative w-full group/slider">

      {/* ── Slide images ── */}
      <div className="relative rounded-2xl overflow-hidden ring-1 ring-[#D4AF37]/25 shadow-[0_20px_60px_rgba(62,39,35,0.25)]">

        {/* Hidden sizer — locks height, prevents CLS */}
        <picture className="block w-full opacity-0 pointer-events-none select-none" aria-hidden="true">
          <source media="(max-width: 767px)" srcSet={items[0].mobile} />
          <source media="(min-width: 768px)" srcSet={items[0].desktop} />
          <img
            src={items[0].desktop}
            alt=""
            loading="eager"
            decoding="async"
            className="block w-full"
            draggable={false}
          />
        </picture>

        {items.map((slide, idx) => (
          <div
            key={idx}
            className="transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={idx !== current ? {
              position: 'absolute', inset: 0,
              opacity: 0, transform: 'scale(0.98)',
              pointerEvents: 'none',
            } : {
              position: 'absolute', inset: 0,
              opacity: 1, transform: 'scale(1)',
            }}
          >
            <Link to={slide.link} className="block w-full h-full">
              <picture className="block w-full h-full">
                <source media="(max-width: 767px)" srcSet={slide.mobile} />
                <source media="(min-width: 768px)" srcSet={slide.desktop} />
                <img
                  src={slide.desktop}
                  alt={slide.alt}
                  loading={idx === 0 ? "eager" : "lazy"}
                  fetchpriority={idx === 0 ? "high" : "auto"}
                  decoding="async"
                  className="w-full h-full object-contain md:object-cover block select-none"
                  draggable={false}
                />
              </picture>
            </Link>
          </div>
        ))}

        {/* ── Arrows — inside, hidden until hover ── */}
        {length > 1 && (
          <>
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => go(-1)}
              className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20
                w-11 h-11 rounded-full
                bg-black/30 hover:bg-[#D4AF37]
                border border-white/20 hover:border-[#D4AF37]
                backdrop-blur-md text-white
                flex items-center justify-center
                transition-all duration-300
                opacity-0 group-hover/slider:opacity-100
                -translate-x-2 group-hover/slider:translate-x-0
                active:scale-90"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => go(1)}
              className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20
                w-11 h-11 rounded-full
                bg-black/30 hover:bg-[#D4AF37]
                border border-white/20 hover:border-[#D4AF37]
                backdrop-blur-md text-white
                flex items-center justify-center
                transition-all duration-300
                opacity-0 group-hover/slider:opacity-100
                translate-x-2 group-hover/slider:translate-x-0
                active:scale-90"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots — inside the image as overlay, zero extra space */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-sm">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => setCurrent(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`rounded-full transition-all duration-500 ease-out ${
                    current === idx
                      ? 'w-6 h-1.5 bg-[#D4AF37] shadow-[0_0_6px_rgba(212,175,55,0.8)]'
                      : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ========================= CATEGORY BROWSER ========================= */
function CategoryBrowser({ block = {} }) {
  const {
    title = "Browse by Category",
    defaultCategory = "",
    limit = 16,
    sort = "new",
    onlyCategories = "",
  } = block;

  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState(defaultCategory || "__all__");
  const [books, setBooks] = useState([]);
  const [catsLoading, setCatsLoading] = useState(true);
  const [booksLoading, setBooksLoading] = useState(false);
  const [fade, setFade] = useState(true);
  const scrollRef = useRef(null);
  const pillsRef = useRef(null);

  const { ref: sectionRef, inView } = useInView({ rootMargin: "200px" });

  // Fetch categories once when section enters viewport
  useEffect(() => {
    if (!inView) return;
    setCatsLoading(true);
    api.get("/books/categories")
      .then(res => {
        const raw = res.data;
        let list = [];
        if (Array.isArray(raw)) list = raw;
        else if (Array.isArray(raw?.categories)) list = raw.categories;
        else if (Array.isArray(raw?.items)) list = raw.items;

        // Filter to only specified categories if admin configured it
        if (onlyCategories) {
          const allowed = onlyCategories.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
          list = list.filter(c => {
            const name = (typeof c === "string" ? c : c?.name || c?.slug || "").toLowerCase();
            return allowed.includes(name);
          });
        }
        setCategories(list);
      })
      .catch(() => setCategories([]))
      .finally(() => setCatsLoading(false));
  }, [inView, onlyCategories]);

  // Fetch books when active category changes
  useEffect(() => {
    if (!inView) return;
    setBooksLoading(true);
    setFade(false);
    const params = { limit, sort };
    if (active !== "__all__") params.category = active;
    api.get("/books", { params })
      .then(res => {
        const list = Array.isArray(res.data?.items) ? res.data.items : [];
        setBooks(list);
        setTimeout(() => setFade(true), 60);
      })
      .catch(() => setBooks([]))
      .finally(() => setBooksLoading(false));
  }, [active, inView]);

  const selectCategory = (key) => {
    setActive(key);
    if (pillsRef.current) {
      const btn = pillsRef.current.querySelector(`[data-cat="${key}"]`);
      if (btn) btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  };

  const getCatName = (cat) => (typeof cat === "string" ? cat : cat?.name || cat?._id || "");

  return (
    <section
      ref={sectionRef}
      className="px-4 sm:px-6 lg:px-8 py-10 md:py-14"
    >

      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-[#D4AF37]/20 pb-4">
        <h2 className="text-3xl md:text-4xl font-['Cinzel'] font-bold text-[#3E2723] flex items-center gap-4">
          <span className="w-1.5 h-8 bg-[#D4AF37] rounded-full inline-block" />
          {title}
        </h2>
        <Link to="/catalog" className="text-[#D4AF37] hover:text-[#3E2723] font-bold text-sm flex items-center gap-1 transition-colors uppercase tracking-widest font-['Cinzel']">
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Category Pills */}
      {catsLoading ? (
        <div className="flex gap-3 mb-8">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-10 w-28 rounded-full bg-[#3E2723]/10 animate-pulse flex-shrink-0" />
          ))}
        </div>
      ) : (
        <div
          ref={pillsRef}
          className="flex gap-3 overflow-x-auto pb-3 mb-8 no-scrollbar"
        >
          {/* ALL pill */}
          <button
            data-cat="__all__"
            onClick={() => selectCategory("__all__")}
            className={`flex-shrink-0 px-6 py-2.5 rounded-full text-sm font-bold font-['Cinzel'] border transition-all duration-300 ${
              active === "__all__"
                ? "bg-[#3E2723] text-[#F3E5AB] border-[#3E2723] shadow-[0_4px_14px_rgba(62,39,35,0.3)]"
                : "bg-white/70 text-[#3E2723]/70 border-[#D4AF37]/30 hover:border-[#D4AF37] hover:bg-[#FFF9E6] hover:text-[#3E2723]"
            }`}
          >
            All Books
          </button>

          {categories.map((cat) => {
            const name = getCatName(cat);
            if (!name) return null;
            return (
              <button
                key={name}
                data-cat={name}
                onClick={() => selectCategory(name)}
                className={`flex-shrink-0 px-6 py-2.5 rounded-full text-sm font-bold font-['Cinzel'] border transition-all duration-300 whitespace-nowrap ${
                  active === name
                    ? "bg-[#3E2723] text-[#F3E5AB] border-[#3E2723] shadow-[0_4px_14px_rgba(62,39,35,0.3)]"
                    : "bg-white/70 text-[#3E2723]/70 border-[#D4AF37]/30 hover:border-[#D4AF37] hover:bg-[#FFF9E6] hover:text-[#3E2723]"
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      )}

      {/* Books */}
      <div
        className="transition-opacity duration-400"
        style={{ opacity: fade && !booksLoading ? 1 : 0 }}
      >
        {booksLoading ? (
          <div className="flex gap-6 overflow-hidden pb-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-[280px] flex-shrink-0 h-[380px] rounded-[1.5rem] bg-[#3E2723]/10 animate-pulse" />
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="rounded-[2rem] border border-[#D4AF37]/20 bg-white/50 p-12 text-center text-[#8A7A5E] italic font-['Cinzel']">
            No books found in this category.
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6 -mx-4 px-4 scroll-smooth no-scrollbar"
          >
            {books.map(b => (
              <div
                key={b._id || b.id}
                className="w-[260px] md:w-[290px] flex-shrink-0 snap-start"
              >
                <ProductCard book={b} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------- Grid Section & Cards ------------------------- */
// âœ… FIXED: Converted from Multi-Row Grid to Single Line Slider
function GridSection({ title, query }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const layout = query?.layout || "classic";
  const limit = Number(query?.limit || 12);
  const q = query?.q || "";
  const sort = query?.sort || "new";

  const scrollRef = useRef(null);
  const scrollInterval = useRef(null); // Ref for the auto-scroll timer

  // Only fetch when this section scrolls near the viewport
  const { ref: sectionRef, inView } = useInView({ rootMargin: "200px" });

  const categories = (query?.category || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  useEffect(() => {
    if (!inView) return; // wait until section is near viewport

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const params = { q, sort, limit };
        if (categories.length) {
          params.category = categories.join(",");
        }

        const { data } = await api.get("/books", { params });
        if (!cancelled) {
          let list = Array.isArray(data.items) ? data.items : [];
          setItems(list.slice(0, limit));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [inView, q, sort, limit, JSON.stringify(categories)]);

  // --- AUTO SCROLL LOGIC ---
  const startAutoScroll = () => {
    stopAutoScroll(); // clear any existing
    scrollInterval.current = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // If we reached the end, reset to start, otherwise scroll right
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
        }
      }
    }, 3000); // Scrolls every 3 seconds
  };

  const stopAutoScroll = () => {
    if (scrollInterval.current) clearInterval(scrollInterval.current);
  };

  // Start auto-scroll when items are loaded
  useEffect(() => {
    if (items.length > 0) {
      startAutoScroll();
    }
    return () => stopAutoScroll(); // Cleanup on unmount
  }, [items]);

  // Manual Scroll Handler
  const scroll = (direction) => {
    stopAutoScroll(); // Pause auto-scroll when user interacts
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === "left" ? -300 : 300;
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
    // Restart auto-scroll after interaction (optional, or leave it off)
    setTimeout(startAutoScroll, 5000);
  };

  return (
    <section
      ref={sectionRef}
      className="relative group/slider"
      onMouseEnter={stopAutoScroll}
      onMouseLeave={startAutoScroll}
    >
      {/* Show skeleton until data is fetched */}
      {(loading || (!inView && items.length === 0)) && <GridSectionSkeleton />}

      {/* Render actual content once loaded */}
      {!loading && inView && (
        <>
          {title && (
            <div className="flex items-center justify-between mb-6 md:mb-8 border-b border-[#D4AF37]/20 pb-4">
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
            <>
              {/* Navigation Buttons */}
              <button
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 z-20 w-12 h-12 -translate-x-4 bg-white/90 backdrop-blur-sm border border-[#D4AF37]/30 rounded-full flex items-center justify-center text-[#3E2723] shadow-lg opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-[#D4AF37] hover:text-white hover:scale-110 disabled:opacity-0"
                aria-label="Scroll Left"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 z-20 w-12 h-12 translate-x-4 bg-white/90 backdrop-blur-sm border border-[#D4AF37]/30 rounded-full flex items-center justify-center text-[#3E2723] shadow-lg opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-[#D4AF37] hover:text-white hover:scale-110 disabled:opacity-0"
                aria-label="Scroll Right"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Slider Container */}
              <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 -mx-4 px-4 scroll-smooth no-scrollbar"
              >
                {items.map((b) => (
                  <div
                    key={b._id || b.id}
                    className="w-[280px] md:w-[320px] flex-shrink-0 snap-start h-full"
                  >
                    <div className="h-full">
                      {layout === "classic" ? <ProductCard book={b} /> : <SimpleShowcaseCard book={b} />}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
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
          <img src={assetUrl(book.assets?.coverUrl, "thumb")} alt={book.title} className="max-h-full max-w-full object-contain drop-shadow-md transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-1" loading="lazy" decoding="async" />
        </div>
        {off > 0 && <span className="absolute top-4 left-4 bg-[#3E2723] text-[#F3E5AB] text-[10px] font-bold px-2 py-1 rounded border border-[#D4AF37] shadow-sm z-20">-{off}%</span>}
      </Link>
      <div className="p-5 flex flex-col flex-grow text-center relative z-10">
        <Link to={`/book/${book.slug}`} className="font-['Cinzel'] font-bold text-[#3E2723] text-lg leading-tight line-clamp-2 mb-2 group-hover:text-[#D4AF37] transition-colors">{book.title}</Link>
        <div className="mt-auto pt-3 border-t border-[#D4AF37]/10 flex flex-col items-center gap-1">
          <span className="font-bold text-[#3E2723] text-xl font-['Playfair_Display']">â‚¹{price}</span>
          {off > 0 && <span className="text-xs line-through text-[#8A7A5E] font-['Inter'] decoration-[#D4AF37]/50">â‚¹{mrp}</span>}
        </div>
      </div>
    </article>
  );
}

function GridSectionSkeleton() {
  return (
    <section className="relative">
      <div className="flex items-center justify-between mb-6 md:mb-8 border-b border-[#D4AF37]/20 pb-4">
        <div className="h-8 w-56 bg-[#3E2723]/10 rounded animate-pulse" />
        <div className="h-4 w-20 bg-[#3E2723]/10 rounded animate-pulse" />
      </div>
      <div className="flex gap-6 overflow-hidden pb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-[280px] md:w-[320px] flex-shrink-0 h-[380px] rounded-[1.5rem] bg-[#3E2723]/10 animate-pulse" />
        ))}
      </div>
    </section>
  );
}


