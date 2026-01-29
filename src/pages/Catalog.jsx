import { useEffect, useState, useRef } from "react";
import { api } from "../api/client";
import { CategoriesAPI } from "../api/categories";
import { assetUrl } from "../api/asset";
import ScrollToTopButton from "../components/ScrollToTopButton";
import ProductCard from "../components/ProductCard";
import {
  Loader2, SearchX, ChevronLeft, ChevronRight,
  Filter, X, Check, ChevronDown, ChevronUp, Search, Minus, BookOpen
} from "lucide-react";
import WaveText from "../components/WaveText";

// --- THEME ASSETS ---
const mandalaBg = "url('/images/homepage/mandala-bg.png')";
const parchmentBg = "url('/images/homepage/parchment-bg.png')";

// --- FILTER SECTION COMPONENT ---
const FilterSection = ({ title, children, onClear, hasActiveFilters }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="border-b border-[#D4AF37]/20 py-6 last:border-0">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-3 font-['Cinzel'] font-bold text-[#3E2723] text-lg hover:text-[#D4AF37] transition-colors">
          {title}
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {hasActiveFilters && (
          <button onClick={(e) => { e.stopPropagation(); onClear(); }} className="text-[10px] font-bold text-[#B0894C] uppercase tracking-wider hover:text-[#3E2723] border-b border-[#B0894C] hover:border-[#3E2723] transition-all">
            Clear
          </button>
        )}
      </div>
      {isOpen && <div className="animate-in slide-in-from-top-2 duration-300">{children}</div>}
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
  const [sort, setSort] = useState("oldest"); // Default to oldest
  const [selectedCats, setSelectedCats] = useState([]);
  
  // Price filter state
  const [priceRange, setPriceRange] = useState({ min: "", max: "" }); 
  const [tempPriceRange, setTempPriceRange] = useState({ min: "", max: "" });

  // Local UI State
  const [catSearch, setCatSearch] = useState("");

  // Sidebar Data
  const [categories, setCategories] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const minPriceRef = useRef(null);
  const maxPriceRef = useRef(null);
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
      const catsRes = await CategoriesAPI.list();
      setCategories(catsRes?.data?.items || []);

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

      setBooks(
        Array.isArray(data.items)
          ? [...data.items] // Shows Oldest First (1, 2, 3...)
          : []
      );
      setTotal(Number(data.total || 0));
    } catch (error) {
      console.error("Failed to load books", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(loadBooks, q ? 400 : 0);
    return () => clearTimeout(t);
  }, [page, sort, selectedCats, q]); 
  // Note: priceRange removed from dependency so it only triggers on "Apply" button

  useEffect(() => {
    setPage(1);
  }, [q, sort, selectedCats]);

  // --- HANDLERS ---
  const toggleCategory = (slug) => {
    setSelectedCats(prev => prev.includes(slug) ? prev.filter(c => c !== slug) : [...prev, slug]);
  };
  
  const applyPriceFilter = (e) => { 
    if (e) e.preventDefault(); 
    setPriceRange(tempPriceRange); 
    setPage(1); 
    loadBooks(); 
  };

  const setPricePreset = (min, max) => { 
    setTempPriceRange({ min: min, max: max });
    setPriceRange({ min: min, max: max }); 
    setTimeout(() => { setPage(1); loadBooks(); }, 50); 
  };

  const clearFilters = () => { 
    setQ(""); 
    setSelectedCats([]); 
    setPriceRange({ min: "", max: "" }); 
    setTempPriceRange({ min: "", max: "" });
    setSort("oldest"); 
    setPage(1); 
  };

  const goToPage = (newPage) => { if (newPage >= 1 && newPage <= totalPages) { setPage(newPage); topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } };

  // --- SIDEBAR CONTENT (As Render Function to fix Focus Issue) ---
  const renderSidebarContent = () => {
    const visibleCategories = categories.filter(c => c.name.toLowerCase().includes(catSearch.toLowerCase()));
    return (
      <div className="pr-2 font-['Lato']">
        <FilterSection title="Categories" onClear={() => setSelectedCats([])} hasActiveFilters={selectedCats.length > 0}>
          {categories.length > 5 && (
            <div className="relative mb-4 group">
              <input
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
                placeholder="Find category..."
                className="w-full bg-[#FAF7F2] border border-[#D4AF37]/30 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37] transition-all placeholder-[#8A7A5E]/60 text-[#3E2723]"
              />
            </div>
          )}
          <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
            {visibleCategories.map((cat) => {
              const isChecked = selectedCats.includes(cat.slug);
              return (
                <label key={cat._id} className={`flex items-center cursor-pointer p-2.5 rounded-lg transition-all select-none group border border-transparent ${isChecked ? "bg-[#FFF9E6] border-[#D4AF37]/20" : "hover:bg-[#FAF7F2]"}`}>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-all shrink-0 shadow-sm ${isChecked ? "bg-[#3E2723] border-[#3E2723]" : "bg-white border-[#D4AF37]/40 group-hover:border-[#3E2723]"}`}>
                    {isChecked && <Check className="w-3.5 h-3.5 text-[#F3E5AB]" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={isChecked} onChange={() => toggleCategory(cat.slug)} />
                  <span className={`text-sm font-medium flex-1 truncate transition-colors ${isChecked ? "text-[#3E2723] font-bold" : "text-[#5C4A2E] group-hover:text-[#3E2723]"}`}>{cat.name}</span>
                  {cat.count > 0 && <span className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors ${isChecked ? "bg-[#3E2723] text-[#F3E5AB] border-[#3E2723]" : "bg-white text-[#8A7A5E] border-[#D4AF37]/30"}`}>{cat.count}</span>}
                </label>
              );
            })}
          </div>
        </FilterSection>

        <FilterSection title="Price Range" onClear={() => { setPriceRange({ min: "", max: "" }); setTempPriceRange({ min: "", max: "" }); setTimeout(loadBooks, 50); }} hasActiveFilters={priceRange.min || priceRange.max}>
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 group">
                <input
                  ref={minPriceRef}
                  type="number"
                  placeholder="Min"
                  min="0"
                  value={tempPriceRange.min}
                  onChange={(e) =>
                    setTempPriceRange(prev => ({ ...prev, min: e.target.value }))
                  }
                  className="w-full pl-7 pr-2 py-2.5 bg-white border border-[#D4AF37]/30 rounded-xl text-sm font-bold text-[#3E2723] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 transition-all shadow-sm"
                />
              </div>
              <Minus className="w-4 h-4 text-[#D4AF37]" />
              <div className="relative flex-1 group">
                <input
                  ref={maxPriceRef}
                  type="number"
                  placeholder="Max"
                  min="0"
                  value={tempPriceRange.max}
                  onChange={(e) =>
                    setTempPriceRange(prev => ({ ...prev, max: e.target.value }))
                  }
                  className="w-full pl-7 pr-2 py-2.5 bg-white border border-[#D4AF37]/30 rounded-xl text-sm font-bold text-[#3E2723] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[{ label: "Under ₹250", min: 0, max: 250 }, { label: "₹250 - ₹500", min: 250, max: 500 }, { label: "₹500 - ₹1000", min: 500, max: 1000 }, { label: "Above ₹1000", min: 1000, max: "" }].map((p, idx) => (
                <button key={idx} onClick={() => setPricePreset(p.min, p.max)} className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${(Number(priceRange.min) === p.min && Number(priceRange.max) === (p.max || 0)) ? "bg-[#3E2723] text-[#F3E5AB] border-[#3E2723] shadow-md" : "bg-white text-[#5C4A2E] border-[#D4AF37]/30 hover:border-[#D4AF37] hover:text-[#3E2723]"}`}>{p.label}</button>
              ))}
            </div>

            <button onClick={(e) => applyPriceFilter(e)} className="w-full py-3.5 bg-gradient-to-r from-[#C59D5F] to-[#B0894C] text-white font-['Cinzel'] font-bold text-sm tracking-widest uppercase rounded-xl shadow-md hover:from-[#D4AF37] hover:to-[#C59D5F] hover:shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 border border-[#D4AF37]">
              Apply Filter
            </button>
          </div>
        </FilterSection>
      </div>
    );
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen font-['Lato'] text-[#5C4A2E] pb-20 selection:bg-[#F3E5AB] selection:text-[#3E2723]">

      {/* Background Texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-100 z-0"
        style={{ backgroundImage: parchmentBg, backgroundSize: 'cover', backgroundAttachment: 'fixed' }}
      />

      {/* HERO HEADER */}
      <div ref={topRef} className="relative z-10">
        {catalogSlides && catalogSlides.length > 0 ? (
          <CatalogHeroSlider slides={catalogSlides} totalBooks={total} />
        ) : (
          // STATIC FALLBACK (Deep Wood Banner)
          <div className="relative w-full pt-28 md:pt-36 pb-16 px-6 border-b border-[#D4AF37]/30 bg-[#3E2723] overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none mix-blend-overlay" style={{ backgroundImage: mandalaBg, backgroundSize: '400px' }} />
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#3E2723] to-transparent z-0"></div>

            <div className="relative z-10 max-w-7xl 2xl:max-w-[1800px] mx-auto text-center md:text-left">
              <div className="inline-flex items-center justify-center p-3 mb-6 bg-white/10 backdrop-blur-md rounded-full shadow-inner border border-[#D4AF37]/30">
                <BookOpen className="w-6 h-6 text-[#F3E5AB]" />
              </div>
              <h1 className="text-4xl md:text-6xl font-['Playfair_Display'] font-bold text-[#F3E5AB] mb-4 tracking-tight drop-shadow-md">
                Sacred Collection
              </h1>
              <p className="text-[#D4AF37] text-lg md:text-xl font-light tracking-wide max-w-2xl">
                Discover {total} treasures of wisdom curated for young souls.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="relative z-10 max-w-7xl 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">

        {/* MOBILE TOOLBAR (Glassy) */}
        <div className="lg:hidden mb-8 flex gap-3 sticky top-[72px] z-30">
          <div className="relative flex-1 group">
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search books..."
              className="w-full pl-5 pr-10 py-3.5 bg-white/90 backdrop-blur-xl border border-[#D4AF37]/30 rounded-xl text-[#3E2723] shadow-md focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 transition-all font-medium placeholder-[#8A7A5E]"
            />
            {q && <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A7A5E] hover:text-[#3E2723]"><X className="w-5 h-5" /></button>}
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="px-5 bg-[#3E2723] text-[#F3E5AB] rounded-xl shadow-md border border-[#D4AF37]/50 flex items-center justify-center relative active:scale-95 transition-all">
            <Filter className="w-5 h-5" />
            {(selectedCats.length > 0 || priceRange.min || priceRange.max) && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse shadow-[0_0_5px_#D4AF37]" />}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">

          {/* DESKTOP SIDEBAR (Royal Index) */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-8">
            {/* Search */}
            <div className="relative group">
              {/* <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A7A5E] group-focus-within:text-[#D4AF37] transition-colors" /> */}
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search titles..."
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#D4AF37]/30 rounded-xl text-[#3E2723] shadow-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all font-medium"
              />
              {q && <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A7A5E] hover:text-[#3E2723]"><X className="w-4 h-4" /></button>}
            </div>

            {/* Filters Container */}
            <div className="bg-white/80 backdrop-blur-sm px-6 py-6 rounded-2xl border border-[#D4AF37]/20 shadow-[0_10px_30px_rgba(62,39,35,0.05)]">
              <div className="flex items-center justify-between mb-2 pb-4 border-b border-[#D4AF37]/20">
                <div className="flex items-center gap-2 text-[#3E2723] font-bold font-['Cinzel'] text-lg">
                  <Filter className="w-5 h-5 text-[#D4AF37]" />
                  <span>Filters</span>
                </div>
                {(selectedCats.length > 0 || priceRange.min || priceRange.max || q) && (
                  <button onClick={clearFilters} className="text-[10px] font-bold text-[#B0894C] uppercase tracking-wider hover:text-[#3E2723] hover:underline transition-colors">
                    Reset All
                  </button>
                )}
              </div>
              
              {/* UPDATED: Called as function to preserve focus */}
              {renderSidebarContent()}
            </div>
          </aside>

          {/* MAIN GRID */}
          <div className="flex-1">

            {/* Sort & Count Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-white/60 p-4 rounded-xl border border-[#D4AF37]/10 shadow-sm backdrop-blur-sm">
              <div className="text-sm text-[#5C4A2E] font-medium">
                Showing <span className="font-bold text-[#3E2723] font-['Cinzel'] text-lg mx-1">{books.length}</span> of {total} treasures
                {(selectedCats.length > 0 || priceRange.min || priceRange.max) && <span className="ml-3 text-[10px] bg-[#3E2723] text-[#F3E5AB] px-2 py-1 rounded border border-[#D4AF37] font-bold uppercase tracking-wide">Filtered</span>}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-[#8A7A5E] hidden sm:block font-bold uppercase tracking-wider">Sort By:</span>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                    className="appearance-none bg-white border border-[#D4AF37]/30 text-[#3E2723] text-sm font-bold py-2.5 pl-5 pr-10 rounded-lg cursor-pointer focus:outline-none focus:border-[#D4AF37] shadow-sm hover:border-[#D4AF37] transition-colors font-['Cinzel'] uppercase tracking-wide"
                  >
                    <option value="oldest">Oldest Arrivals</option>
                    <option value="new">Newest Arrivals</option>
                    <option value="priceAsc">Price: Low to High</option>
                    <option value="priceDesc">Price: High to Low</option>
                    <option value="a-z">Name: A to Z</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37] pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Content Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 text-[#8A7A5E]">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin mb-6"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-[#3E2723] animate-pulse" />
                  </div>
                </div>
                <p className="font-medium font-['Cinzel'] tracking-widest text-[#3E2723] animate-pulse">Consulting the Archives...</p>
              </div>
            ) : books.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                {books.map(b => (<ProductCard key={b._id} book={b} />))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-white/60 rounded-3xl border border-[#D4AF37]/20 border-dashed backdrop-blur-sm">
                <div className="w-24 h-24 bg-[#FFF9E6] rounded-full flex items-center justify-center mb-6 shadow-inner border border-[#D4AF37]/20">
                  <SearchX className="w-10 h-10 text-[#D4AF37]" />
                </div>
                <h3 className="text-2xl font-bold text-[#3E2723] mb-3 font-['Cinzel']">No Treasures Found</h3>
                <p className="text-[#8A7A5E] max-w-sm mx-auto mb-8 font-light">We couldn't find any books matching your specific criteria. Try adjusting your filters.</p>
                <button onClick={clearFilters} className="px-8 py-3.5 bg-[#3E2723] text-[#F3E5AB] rounded-xl font-bold text-sm shadow-lg hover:bg-[#5D4037] hover:shadow-xl active:scale-95 transition-all font-['Cinzel'] tracking-widest uppercase border border-[#D4AF37]/30">
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-4">
                <button onClick={() => goToPage(page - 1)} disabled={page === 1} className="p-3.5 rounded-full border border-[#D4AF37]/30 bg-white text-[#3E2723] hover:bg-[#D4AF37] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm group">
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                </button>

                <span className="font-bold text-[#3E2723] text-sm bg-white px-6 py-3 rounded-full border border-[#D4AF37]/30 shadow-sm font-['Cinzel'] tracking-widest">
                  Page <span className="text-[#D4AF37] text-lg mx-1">{page}</span> of {totalPages}
                </span>

                <button onClick={() => goToPage(page + 1)} disabled={page === totalPages} className="p-3.5 rounded-full border border-[#D4AF37]/30 bg-white text-[#3E2723] hover:bg-[#D4AF37] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm group">
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE SIDEBAR DRAWER */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-[#3E2723]/60 backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-[85%] max-w-[320px] bg-[#FAF7F2] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-[#D4AF37]/30">
            <div className="p-6 border-b border-[#D4AF37]/20 flex items-center justify-between bg-[#FFF9E6]">
              <h2 className="font-bold text-[#3E2723] text-xl flex items-center gap-3 font-['Cinzel']">
                <Filter className="w-5 h-5 text-[#D4AF37]" /> Filter & Sort
              </h2>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-white rounded-full text-[#3E2723] border border-[#D4AF37]/20 hover:bg-[#D4AF37] hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 relative">
              {/* Watermark in drawer */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: mandalaBg, backgroundSize: '300px' }}></div>
              <div className="relative z-10">
                {/* UPDATED: Called as function here too */}
                {renderSidebarContent()}
              </div>
            </div>
            <div className="p-6 border-t border-[#D4AF37]/20 bg-white">
              <button onClick={() => setIsSidebarOpen(false)} className="w-full py-4 bg-gradient-to-r from-[#C59D5F] to-[#B0894C] text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all font-['Cinzel'] tracking-widest uppercase text-sm border border-[#D4AF37]">
                Show {total} Results
              </button>
            </div>
          </div>
        </div>
      )}
      <ScrollToTopButton />
    </div>
  );
}

// --- CATALOG HERO SLIDER ---
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

  const getHeight = (h) => {
    switch (h) {
      case 'small': return 'min-h-[300px]';
      case 'large': return 'min-h-[600px]';
      case 'medium':
      default: return 'min-h-[450px]';
    }
  };

  return (
    <div className={`relative w-full pt-20 md:pt-0 overflow-hidden bg-[#3E2723] flex items-center group transition-all duration-300 ${getHeight(slides[current].height)}`}>

      {slides.map((slide, idx) => {
        const isFull = slide.layout === 'full';
        const fit = slide.objectFit || 'cover';

        return (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${current === idx ? "opacity-100 z-10" : "opacity-0 z-0"}`}
            style={{ backgroundColor: slide.bgColor || '#3E2723' }}
          >
            {/* Pattern Overlay */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none mix-blend-overlay" style={{ backgroundImage: mandalaBg, backgroundSize: '400px' }} />

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

            {!isFull && slide.image && (
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
                      background: `linear-gradient(to right, ${slide.bgColor || '#3E2723'} 5%, transparent 100%), linear-gradient(to top, ${slide.bgColor || '#3E2723'} 0%, transparent 50%)`
                    }}
                  ></div>
                )}
              </div>
            )}

            {/* TEXT CONTENT */}
            <div className="relative z-20 max-w-7xl 2xl:max-w-[1800px] mx-auto h-full px-6 md:px-12 flex items-center">
              <div className={`w-full md:w-1/2 pt-16 md:pt-0 ${isFull ? 'md:mx-auto md:w-2/3 md:text-center text-center' : 'text-left'}`}>
                <h1
                  className="text-4xl md:text-6xl font-['Playfair_Display'] font-bold mb-6 tracking-tight leading-tight drop-shadow-md"
                  style={{ color: slide.textColor || '#F3E5AB' }}
                >
                  {slide.title}
                </h1>
                <p
                  className={`text-lg md:text-xl font-light mb-8 opacity-90 leading-relaxed font-['Lato'] ${isFull ? 'mx-auto' : ''}`}
                  style={{ color: slide.textColor || '#F3E5AB', maxWidth: '600px' }}
                >
                  {slide.subtitle}
                </p>

                {slide.ctaText && (
                  <a
                    href={slide.ctaLink || "/catalog"}
                    className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-[#C59D5F] to-[#B0894C] text-white rounded-full font-bold text-lg hover:from-[#D4AF37] hover:to-[#C59D5F] transition-all shadow-lg shadow-[#D4AF37]/20 active:scale-95 font-['Cinzel'] tracking-wide border border-[#F3E5AB]/30"
                  >
                    <WaveText text={slide.ctaText} hoverColor="#3E2723" /> <ChevronRight className="w-5 h-5" />
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
          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/20 hover:bg-[#D4AF37] text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all z-30 border border-white/10 hover:border-[#D4AF37]"><ChevronLeft className="w-6 h-6" /></button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/20 hover:bg-[#D4AF37] text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all z-30 border border-white/10 hover:border-[#D4AF37]"><ChevronRight className="w-6 h-6" /></button>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
            {slides.map((_, idx) => (
              <button key={idx} onClick={() => setCurrent(idx)} className={`h-1.5 rounded-full transition-all duration-500 ${current === idx ? "w-8 bg-[#D4AF37]" : "w-2 bg-white/40 hover:bg-white/60"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
} 