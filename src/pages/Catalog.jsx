// src/pages/Catalog.jsx
import { useEffect, useState, useRef } from "react";
import { api } from "../api/client";
import { CategoriesAPI } from "../api/categories";
import { assetUrl } from "../api/asset";
import ScrollToTopButton from "../components/ScrollToTopButton";
import ProductCard from "../components/ProductCard";
import {
  Loader2, SearchX, ChevronLeft, ChevronRight,
  Filter, X, Check, ChevronDown, ChevronUp, Search, Minus
} from "lucide-react";
import WaveText from "../components/WaveText";

// ... (FilterSection component remains the same) ...
const FilterSection = ({ title, children, onClear, hasActiveFilters }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="border-b border-[#E3E8E5] py-5 last:border-0">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 font-serif font-bold text-[#1A3C34] text-lg hover:text-[#4A7C59] transition-colors">
          {title}
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {hasActiveFilters && (
          <button onClick={(e) => { e.stopPropagation(); onClear(); }} className="text-[10px] font-bold text-red-500 uppercase tracking-wider hover:underline">Clear</button>
        )}
      </div>
      {isOpen && <div className="animate-in slide-in-from-top-2 duration-200">{children}</div>}
    </div>
  );
};

export default function Catalog() {
  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);

  // Catalog Slider State
  const [catalogSlides, setCatalogSlides] = useState([]);

  // Filters & Search
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("new");
  const [selectedCats, setSelectedCats] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  // Local UI State
  const [catSearch, setCatSearch] = useState("");

  // Sidebar Data
  const [categories, setCategories] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const totalPages = Math.ceil(total / limit);
  const topRef = useRef(null);

  // --- 1. LOAD DATA ---
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    try {
      // Fetch Categories
      const catsRes = await CategoriesAPI.list();
      setCategories(catsRes?.data?.items || []);

      // Fetch Settings for Slider
      const settingsRes = await api.get("/settings/public");
      if (settingsRes.data?.ok && settingsRes.data?.catalog?.slider) {
        setCatalogSlides(settingsRes.data.catalog.slider);
      }
    } catch (err) {
      console.error("Failed to load initial data", err);
    }
  }

  // --- 2. LOAD BOOKS ---
  async function loadBooks() {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        sort,
        visibility: "public",
        q: q.trim(),
      };

      if (selectedCats.length > 0) params.category = selectedCats.join(",");
      if (priceRange.min) params.minPrice = priceRange.min;
      if (priceRange.max) params.maxPrice = priceRange.max;

      const { data } = await api.get("/books", { params });

      setBooks(Array.isArray(data.items) ? data.items : []);
      setTotal(Number(data.total || 0));
    } catch (error) {
      console.error("Failed to load books", error);
    } finally {
      setLoading(false);
    }
  }

  // Trigger load on filter changes
  useEffect(() => {
    const t = setTimeout(loadBooks, q ? 400 : 0);
    return () => clearTimeout(t);
  }, [page, sort, selectedCats, q]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [q, sort, selectedCats]);

  // --- HANDLERS ---
  const toggleCategory = (slug) => {
    setSelectedCats(prev => prev.includes(slug) ? prev.filter(c => c !== slug) : [...prev, slug]);
  };
  const applyPriceFilter = (e) => { if (e) e.preventDefault(); setPage(1); loadBooks(); };
  const setPricePreset = (min, max) => { setPriceRange({ min: min, max: max }); setTimeout(() => { setPage(1); loadBooks(); }, 50); };
  const clearFilters = () => { setQ(""); setSelectedCats([]); setPriceRange({ min: "", max: "" }); setSort("new"); setPage(1); };
  const goToPage = (newPage) => { if (newPage >= 1 && newPage <= totalPages) { setPage(newPage); topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } };

  // --- SIDEBAR CONTENT ---
  const SidebarContent = () => {
    const visibleCategories = categories.filter(c => c.name.toLowerCase().includes(catSearch.toLowerCase()));
    return (
      <div className="pr-2">
        <FilterSection title="Categories" onClear={() => setSelectedCats([])} hasActiveFilters={selectedCats.length > 0}>
          {categories.length > 5 && (
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8BA699]" />
              <input value={catSearch} onChange={(e) => setCatSearch(e.target.value)} placeholder="Find category..." className="w-full bg-[#F4F7F5] border border-[#E3E8E5] rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-[#1A3C34] transition-colors" />
            </div>
          )}
          <div className="space-y-1 max-h-[250px] overflow-y-auto custom-scrollbar pr-1">
            {visibleCategories.map((cat) => {
              const isChecked = selectedCats.includes(cat.slug);
              return (
                <label key={cat._id} className={`flex items-center cursor-pointer p-2 rounded-lg transition-all select-none group ${isChecked ? "bg-[#E8F0EB]" : "hover:bg-[#F4F7F5]"}`}>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 transition-all shrink-0 ${isChecked ? "bg-[#1A3C34] border-[#1A3C34]" : "bg-white border-[#8BA699] group-hover:border-[#1A3C34]"}`}>
                    {isChecked && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={isChecked} onChange={() => toggleCategory(cat.slug)} />
                  <span className={`text-sm font-medium flex-1 truncate ${isChecked ? "text-[#1A3C34]" : "text-[#5C756D]"}`}>{cat.name}</span>
                  {cat.count > 0 && <span className="text-[10px] font-bold text-[#8BA699] bg-white px-1.5 py-0.5 rounded border border-[#E3E8E5]">{cat.count}</span>}
                </label>
              );
            })}
          </div>
        </FilterSection>
        <FilterSection title="Price Range" onClear={() => { setPriceRange({ min: "", max: "" }); setTimeout(loadBooks, 50); }} hasActiveFilters={priceRange.min || priceRange.max}>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8BA699] text-xs font-bold">₹</span>
                <input type="number" placeholder="Min" min="0" className="w-full pl-6 pr-2 py-2.5 bg-white border border-[#E3E8E5] rounded-xl text-sm font-bold text-[#1A3C34] focus:outline-none focus:border-[#1A3C34] transition-all" value={priceRange.min} onChange={e => setPriceRange({ ...priceRange, min: e.target.value })} />
              </div>
              <Minus className="w-4 h-4 text-[#8BA699]" />
              <div className="relative flex-1 group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8BA699] text-xs font-bold">₹</span>
                <input type="number" placeholder="Max" min="0" className="w-full pl-6 pr-2 py-2.5 bg-white border border-[#E3E8E5] rounded-xl text-sm font-bold text-[#1A3C34] focus:outline-none focus:border-[#1A3C34] transition-all" value={priceRange.max} onChange={e => setPriceRange({ ...priceRange, max: e.target.value })} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[{ label: "Under ₹250", min: 0, max: 250 }, { label: "₹250 - ₹500", min: 250, max: 500 }, { label: "₹500 - ₹1000", min: 500, max: 1000 }, { label: "Above ₹1000", min: 1000, max: "" }].map((p, idx) => (
                <button key={idx} onClick={() => setPricePreset(p.min, p.max)} className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${(Number(priceRange.min) === p.min && Number(priceRange.max) === (p.max || 0)) ? "bg-[#1A3C34] text-white border-[#1A3C34]" : "bg-white text-[#5C756D] border-[#E3E8E5] hover:border-[#1A3C34] hover:text-[#1A3C34]"}`}>{p.label}</button>
              ))}
            </div>
            <button onClick={(e) => applyPriceFilter(e)} className="w-full py-3 bg-[#1A3C34] text-white font-bold text-sm rounded-xl shadow-md hover:bg-[#2F523F] transition-all flex items-center justify-center gap-2">Apply Filter</button>
          </div>
        </FilterSection>
      </div>
    );
  };

  return (
    <div className="bg-[#F4F7F5] min-h-screen font-sans text-[#2C3E38] pb-20">

      {/* HERO HEADER (Dynamic Slider or Default Green) */}
      <div ref={topRef}>
        {catalogSlides && catalogSlides.length > 0 ? (
          // DYNAMIC SLIDER
          <CatalogHeroSlider slides={catalogSlides} totalBooks={total} />
        ) : (
          // STATIC FALLBACK (Original Green Banner)
          <div className="relative w-full pt-20 md:pt-28 pb-12 px-6 border-b border-[#E3E8E5] bg-[#1A3C34]">
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay" style={{ backgroundImage: "url('/public/assets/pattern.png')", backgroundSize: '200px' }} />
            <div className="relative z-10 max-w-7xl 2xl:max-w-[1800px] mx-auto">
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2 tracking-tight">Our Collection</h1>
              <p className="text-[#8BA699] text-lg font-light">Discover {total} unique books curated for young minds.</p>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* MOBILE TOOLBAR */}
        <div className="lg:hidden mb-6 flex gap-3 sticky top-20 z-30">
          <div className="relative flex-1">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search books..." className="w-full pl-4 pr-10 py-3 bg-white/90 backdrop-blur-md border border-[#E3E8E5] rounded-xl text-[#1A3C34] shadow-sm focus:outline-none focus:border-[#1A3C34]" />
            {q && <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8BA699]"><X className="w-4 h-4" /></button>}
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="px-4 bg-white/90 backdrop-blur-md border border-[#E3E8E5] rounded-xl text-[#1A3C34] shadow-sm flex items-center justify-center relative active:scale-95 transition-transform">
            <Filter className="w-5 h-5" />
            {(selectedCats.length > 0 || priceRange.min || priceRange.max) && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* DESKTOP SIDEBAR */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-6">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8BA699] group-focus-within:text-[#1A3C34] transition-colors" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by title, author..." className="w-full pl-11 pr-4 py-3 bg-white border border-[#E3E8E5] rounded-xl text-[#1A3C34] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/10 focus:border-[#1A3C34] transition-all" />
              {q && <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8BA699] hover:text-[#1A3C34]"><X className="w-4 h-4" /></button>}
            </div>
            <div className="bg-white px-6 py-4 rounded-2xl border border-[#E3E8E5] shadow-sm">
              <div className="flex items-center justify-between mb-2 pb-4 border-b border-[#E3E8E5]">
                <div className="flex items-center gap-2 text-[#1A3C34] font-bold"><Filter className="w-4 h-4" /><span>Filters</span></div>
                {(selectedCats.length > 0 || priceRange.min || priceRange.max || q) && <button onClick={clearFilters} className="text-xs font-bold text-red-500 hover:underline">RESET ALL</button>}
              </div>
              <SidebarContent />
            </div>
          </aside>

          {/* MAIN GRID */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="text-sm text-[#5C756D]">
                Showing <span className="font-bold text-[#1A3C34]">{books.length}</span> of {total} results
                {(selectedCats.length > 0 || priceRange.min || priceRange.max) && <span className="ml-2 text-xs bg-[#E8F0EB] text-[#1A3C34] px-2 py-1 rounded-md border border-[#DCE4E0] font-bold">Filters Active</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#5C756D] hidden sm:block">Sort:</span>
                <div className="relative">
                  <select value={sort} onChange={e => setSort(e.target.value)} className="appearance-none bg-white border border-[#E3E8E5] text-[#1A3C34] text-sm font-bold py-2.5 pl-4 pr-10 rounded-xl cursor-pointer focus:outline-none focus:border-[#1A3C34] shadow-sm hover:border-[#1A3C34] transition-colors">
                    <option value="new">Newest Arrivals</option>
                    <option value="priceAsc">Price: Low to High</option>
                    <option value="priceDesc">Price: High to Low</option>
                    <option value="a-z">Name: A to Z</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A3C34] pointer-events-none" />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 text-[#5C756D]">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#1A3C34]" />
                <p className="font-medium animate-pulse">Updating library...</p>
              </div>
            ) : books.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {books.map(b => (<ProductCard key={b._id} book={b} />))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-[#E3E8E5] border-dashed">
                <div className="w-20 h-20 bg-[#F4F7F5] rounded-full flex items-center justify-center mb-4"><SearchX className="w-10 h-10 text-[#8BA699]" /></div>
                <h3 className="text-xl font-bold text-[#1A3C34] mb-2">No matches found</h3>
                <p className="text-[#5C756D] max-w-xs mx-auto mb-6">We couldn't find any books matching your specific filters.</p>
                <button onClick={clearFilters} className="px-8 py-3 bg-[#1A3C34] text-white rounded-xl font-bold text-sm shadow-lg hover:bg-[#2F523F] hover:shadow-xl active:scale-95 transition-all">Clear All Filters</button>
              </div>
            )}
            {!loading && totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-4">
                <button onClick={() => goToPage(page - 1)} disabled={page === 1} className="p-3 rounded-xl border border-[#E3E8E5] bg-white text-[#1A3C34] hover:bg-[#E8F0EB] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"><ChevronLeft className="w-5 h-5" /></button>
                <span className="font-bold text-[#1A3C34] text-sm bg-white px-4 py-2 rounded-xl border border-[#E3E8E5] shadow-sm">Page {page} of {totalPages}</span>
                <button onClick={() => goToPage(page + 1)} disabled={page === totalPages} className="p-3 rounded-xl border border-[#E3E8E5] bg-white text-[#1A3C34] hover:bg-[#E8F0EB] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"><ChevronRight className="w-5 h-5" /></button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-[85%] max-w-[320px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-5 border-b border-[#E3E8E5] flex items-center justify-between bg-[#FAFBF9]">
              <h2 className="font-bold text-[#1A3C34] text-lg flex items-center gap-2"><Filter className="w-5 h-5" /> Filter & Sort</h2>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-[#E8F0EB] rounded-full text-[#1A3C34] hover:bg-[#DCE4E0] transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6"><SidebarContent /></div>
            <div className="p-5 border-t border-[#E3E8E5] bg-white">
              <button onClick={() => setIsSidebarOpen(false)} className="w-full py-3.5 bg-[#1A3C34] text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all">Show {total} Results</button>
            </div>
          </div>
        </div>
      )}
      <ScrollToTopButton />
    </div>
  );
}

// ✅ FIXED SLIDER COMPONENT FOR CATALOG
function CatalogHeroSlider({ slides, totalBooks }) {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (slides.length > 1) {
      timeoutRef.current = setTimeout(() => setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1)), 6000);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [current, slides.length]);

  const nextSlide = () => setCurrent(current === slides.length - 1 ? 0 : current + 1);
  const prevSlide = () => setCurrent(current === 0 ? slides.length - 1 : current - 1);

  if (!slides || slides.length === 0) return null;

  // Helper to determine height class
  const getHeight = (h) => {
    switch (h) {
      case 'small': return 'min-h-[300px]';
      case 'large': return 'min-h-[600px]';
      case 'medium':
      default: return 'min-h-[450px]';
    }
  };

  return (
    <div className={`relative w-full pt-20 md:pt-0 overflow-hidden bg-[#1A3C34] flex items-center group transition-all duration-300 ${getHeight(slides[current].height)}`}>

      {slides.map((slide, idx) => {
        const isFull = slide.layout === 'full';
        const fit = slide.objectFit || 'cover';

        return (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${current === idx ? "opacity-100 z-10" : "opacity-0 z-0"}`}
            style={{ backgroundColor: slide.bgColor || '#1A3C34' }}
          >
            {/* === TYPE 1: FULL BANNER (Background Image) === */}
            {isFull && slide.image && (
              <>
                <img
                  src={assetUrl(slide.image)}
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/40"></div>
              </>
            )}

            {/* === TYPE 2: SPLIT LAYOUT === */}
            {!isFull && (
              <>
                <div className="absolute inset-0 z-0 opacity-10 pointer-events-none mix-blend-overlay" style={{ backgroundImage: "url('/public/assets/pattern.png')", backgroundSize: '200px' }} />

                {slide.image && (
                  <div className="absolute inset-0 md:left-1/3 w-full md:w-2/3 h-full">
                    <img
                      src={assetUrl(slide.image)}
                      alt={slide.title}
                      className={`w-full h-full ${fit === 'contain' ? 'object-contain p-8' : 'object-cover'} object-center opacity-40 md:opacity-100`}
                    />
                    {fit === 'cover' && (
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(to right, ${slide.bgColor || '#1A3C34'} 5%, transparent 100%), linear-gradient(to top, ${slide.bgColor || '#1A3C34'} 0%, transparent 50%)`
                        }}
                      ></div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* TEXT CONTENT */}
            <div className="relative z-20 max-w-7xl 2xl:max-w-[1800px] mx-auto h-full px-6 md:px-12 flex items-center">
              <div className={`w-full md:w-1/2 pt-12 md:pt-0 ${isFull ? 'md:mx-auto md:w-2/3 md:text-center text-center' : 'text-left'}`}>
                <h1
                  className="text-4xl md:text-6xl font-serif font-bold mb-6 tracking-tight leading-tight drop-shadow-md"
                  style={{ color: slide.textColor || '#ffffff' }}
                >
                  {slide.title}
                </h1>
                <p
                  className={`text-lg md:text-xl font-light mb-8 opacity-90 leading-relaxed ${isFull ? 'mx-auto' : ''}`}
                  style={{ color: slide.textColor || '#ffffff', maxWidth: '600px' }}
                >
                  {slide.subtitle}
                </p>

                {slide.ctaText && (
                  <a
                    href={slide.ctaLink || "/catalog"}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#1A3C34] rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-lg active:scale-95"
                  >
                    <WaveText text={slide.ctaText} hoverColor="#304F48" /> <ChevronRight className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation */}
      {slides.length > 1 && (
        <>
          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all z-30 border border-white/10"><ChevronLeft className="w-6 h-6" /></button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all z-30 border border-white/10"><ChevronRight className="w-6 h-6" /></button>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
            {slides.map((_, idx) => (
              <button key={idx} onClick={() => setCurrent(idx)} className={`h-1.5 rounded-full transition-all duration-500 ${current === idx ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}