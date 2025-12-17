// src/pages/Home.jsx
import { useEffect, useState, useRef } from "react";
import { useSite } from "../contexts/SiteConfig";
import { api } from "../api/client";
import ProductCard from "../components/ProductCard";
import { Link } from "react-router-dom";
import { assetUrl } from "../api/asset";
import '../styles/style-button.css';
import ScrollToTopButton from "../components/ScrollToTopButton";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
// Removed unused WaveText import if not available, or keep it if you have it
// import WaveText from "../components/WaveText"; 

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

/* ----------------------------- Blocks ---------------------------- */
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
              <img src={assetUrl(block.image)} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A3C34]/80 to-transparent md:bg-gradient-to-l"></div>
            </div>
          )}
        </section>
      </div>
    );
  }

  // ✅ Hero Slider Block
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

  if (block.type === "banner") {
    return (
      <div className={containerClasses} style={containerStyle}>
        <a href={block.ctaLink || "/"} className="block rounded-theme overflow-hidden shadow-theme group relative">
          <img src={assetUrl(block.image)} alt={block.alt || ""} className="w-full object-cover transition-all duration-500 group-hover:brightness-110 group-hover:saturate-150" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
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

/* ------------------------- HERO SLIDER COMPONENT (FIXED) ------------------------- */
function HeroSlider({ slides }) {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef(null);
  
  const items = Array.isArray(slides) ? slides : [];
  const length = items.length;

  useEffect(() => {
    if(timeoutRef.current) clearTimeout(timeoutRef.current);
    if(length > 1) {
        timeoutRef.current = setTimeout(() => setCurrent((prev) => (prev === length - 1 ? 0 : prev + 1)), 6000);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [current, length]);

  const nextSlide = () => setCurrent(current === length - 1 ? 0 : current + 1);
  const prevSlide = () => setCurrent(current === 0 ? length - 1 : current - 1);

  if (!length) return null;

  // Helper to determine height class per slide
  const getHeight = (h) => {
      switch(h) {
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
                        <img src={assetUrl(slide.image)} alt={slide.title} className="absolute inset-0 w-full h-full object-cover object-center" />
                        <div className="absolute inset-0 bg-black/40"></div>
                    </>
                )}

                {/* === TYPE 2: SPLIT LAYOUT (FIXED) === */}
                {!isFull && (
                    <>
                         {/* Optional Pattern Background */}
                         <div className="absolute inset-0 z-0 opacity-10 pointer-events-none mix-blend-overlay" style={{ backgroundImage: "url('/public/assets/pattern.png')", backgroundSize: '200px' }} />
                         {/* Decorative Blur */}
                         <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                         {slide.image && (
                            // ✅ FIXED: Added overflow-hidden to prevent zoom spillover
                            <div className="absolute inset-0 md:left-1/3 w-full md:w-2/3 h-full overflow-hidden">
                                <img 
                                    src={assetUrl(slide.image)} 
                                    alt={slide.title} 
                                    className={`w-full h-full ${fit === 'contain' ? 'object-contain p-8 md:p-12' : 'object-cover'} object-center opacity-40 md:opacity-100 transition-transform duration-700 ease-out group-hover:scale-105`}
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
        )})}

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
    if(timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCurrent((prev) => (prev === length - 1 ? 0 : prev + 1)), 5000);
    return () => clearTimeout(timeoutRef.current);
  }, [current, length]);

  const nextSlide = () => setCurrent(current === length - 1 ? 0 : current + 1);
  const prevSlide = () => setCurrent(current === 0 ? length - 1 : current - 1);

  if (!length) return null;

  const getHeightClass = () => {
    switch(height) {
        case "small": return "h-[300px] md:h-[400px]";
        case "large": return "h-[500px] md:h-[700px]";
        case "medium": 
        default: return "h-[400px] md:h-[500px]";
    }
  };

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden shadow-xl group ${getHeightClass()} bg-gray-900`}>
      <div className="relative w-full h-full">
        {items.map((slide, idx) => (
          <div 
            key={idx} 
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${current === idx ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          >
            <Link to={slide.link} className="block w-full h-full relative">
               <picture className="w-full h-full block">
                  <source media="(max-width: 767px)" srcSet={slide.mobile} />
                  <source media="(min-width: 768px)" srcSet={slide.desktop} />
                  <img src={slide.desktop} alt={slide.alt} className={`absolute inset-0 w-full h-full ${slide.fit === 'contain' ? 'object-contain bg-white' : 'object-cover'}`} />
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

// ... (Rest of GridSection and SimpleShowcaseCard - unchanged)
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