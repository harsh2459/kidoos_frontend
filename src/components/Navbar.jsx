import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSaleTimer } from "../hooks/useSaleTimer";
import { useMemo, useState, useEffect, useRef } from "react";
import { useSite } from "../contexts/SiteConfig";
import { useAuth } from "../contexts/Auth";
import { useCustomer } from "../contexts/CustomerAuth";
import { assetUrl } from "../api/asset";
import { useCart } from "../contexts/CartStore";
import { api } from "../api/client";
import {
  Menu, X, ShoppingBag, User, LogOut, ShieldCheck, Search,
  Home, Loader2, ChevronRight
} from "lucide-react";
import WaveText from "./WaveText";

// --- Fuzzy match: score how well query matches a string (handles misspellings) ---
function fuzzyScore(str, query) {
  if (!str || !query) return 0;
  const s = str.toLowerCase();
  const q = query.toLowerCase().trim();
  if (s.includes(q)) return 100;
  // Check if all chars of query appear in order
  let si = 0, qi = 0, score = 0;
  while (si < s.length && qi < q.length) {
    if (s[si] === q[qi]) { score++; qi++; }
    si++;
  }
  return qi === q.length ? Math.round((score / q.length) * 70) : 0;
}

export default function Navbar() {
  const loc = useLocation();
  const navigate = useNavigate();
  const onAdminPage = loc.pathname.startsWith("/admin");

  const { site, visibility } = useSite();
  const nav = useMemo(() => visibility?.publicNav || ["catalog", "cart"], [visibility]);

  const { isAdmin, admin, logout: logoutAdmin } = useAuth();
  const { isCustomer, customer } = useCustomer();

  // Flash deal timer (persisted across refreshes)
  const { saleMin, saleSec } = useSaleTimer();

  // Cart count badge
  const cartCount = useCart((s) =>
    (s.items || []).reduce((sum, it) => sum + Number(it.qty ?? 1), 0)
  );

  // State for Mobile Menu & Scrolled State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
    else { setSearchQuery(""); setSearchResults([]); setActiveIndex(-1); }
  }, [isSearchOpen]);

  // Close search on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const { data } = await api.get("/books", {
          params: { q: searchQuery.trim(), limit: 8, visibility: "public" },
        });
        let items = Array.isArray(data.items) ? data.items : [];
        // Client-side fuzzy re-rank for misspellings
        const q = searchQuery.trim();
        items = items
          .map(b => ({ ...b, _score: Math.max(fuzzyScore(b.title, q), fuzzyScore(b.author, q)) }))
          .filter(b => b._score > 0)
          .sort((a, b) => b._score - a._score);
        setSearchResults(items);
      } catch { setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleResultClick = (book) => {
    setIsSearchOpen(false);
    navigate(`/book/${book.slug}`);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, searchResults.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, -1)); }
    else if (e.key === "Enter") {
      if (activeIndex >= 0 && searchResults[activeIndex]) handleResultClick(searchResults[activeIndex]);
      else if (searchQuery.trim()) { setIsSearchOpen(false); navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`); }
    }
    else if (e.key === "Escape") setIsSearchOpen(false);
  };

  // UI Rules
  const showShopUI = !isAdmin && !onAdminPage;
  const showLogin = !isAdmin && !isCustomer && !onAdminPage;
  const showBrand = !isAdmin;

  const closeMenu = () => setIsMobileMenuOpen(false);

  // VRINDAVAN THEME ASSETS
  const mandalaBg = "url('/images-webp/homepage/mandala-bg.webp')";

  return (
    <>
    {/* ===== SALE TICKER BANNER ===== */}
    {showShopUI && !onAdminPage && (
      <div className="relative overflow-hidden bg-[#3E2723] py-1.5 z-[101]">
        <style>{`@keyframes ki-ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
        <div
          style={{ animation: 'ki-ticker 30s linear infinite' }}
          className="flex whitespace-nowrap w-max will-change-transform"
        >
          {[0, 1].map(i => (
            <span key={i} className="inline-flex items-center gap-5 px-4 text-[11px] font-bold uppercase tracking-widest font-['Cinzel']">
              <span className="text-[#D4AF37]">⚡ Flash Deal</span>
              <span className="text-[#D4AF37]/40">◆</span>
              <span className="text-[#F3E5AB]">Ultimate Discount on All Books Here</span>
              <span className="text-[#D4AF37]/40">◆</span>
              <span className="text-[#D4AF37]">Purchase Now &amp; Save Big</span>
              <span className="text-[#D4AF37]/40">◆</span>
              <span className="inline-flex items-center gap-2 text-[#F3E5AB]">
                Offer Ends In
                <span className="inline-flex items-center gap-1">
                  <span className="bg-[#D4AF37] text-[#3E2723] font-black rounded px-1.5 py-0.5 text-[11px] font-mono leading-none">{saleMin}</span>
                  <span className="text-[#D4AF37] font-black">:</span>
                  <span className="bg-[#D4AF37] text-[#3E2723] font-black rounded px-1.5 py-0.5 text-[11px] font-mono leading-none">{saleSec}</span>
                </span>
              </span>
              <span className="text-[#D4AF37]/40">◆</span>
              <span className="text-[#D4AF37]">Kiddos Intellect Special Offer</span>
              <span className="text-[#D4AF37]/40">◆</span>
              <span className="text-[#F3E5AB]">Shop Smart, Grow Bright</span>
              <span className="text-[#D4AF37]/40">◆</span>
            </span>
          ))}
        </div>
      </div>
    )}
    <header
      className={`
        ${onAdminPage ? "relative" : "sticky top-0 z-[100]"} font-['Lato'] transition-all duration-500 ease-in-out
        ${isScrolled
          ? "bg-[#FAF7F2]/92 backdrop-blur-xl border-b border-[#D4AF37]/30 shadow-[0_4px_24px_rgba(62,39,35,0.1)] py-2"
          : "bg-white/10 backdrop-blur-[8px] border-b border-white/15 py-3"
        }
      `}
    >
      {/* Golden thread */}
      <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent transition-opacity duration-500 ${isScrolled ? 'opacity-100' : 'opacity-60'}`} />

      <div className="relative mx-auto w-full px-4 sm:px-6 lg:px-8 2xl:px-12 flex items-center justify-between max-w-7xl 2xl:max-w-[1800px]">

        {/* LEFT: Brand */}
        {showBrand && (
          <Link to="/" className="flex items-center gap-3 shrink-0 z-50 relative group" onClick={closeMenu}>
            {site?.logoUrl ? (
              <img
                src={assetUrl(site.logoUrl)}
                alt="Kiddos Intellect"
                className="block h-12 md:h-[5rem] w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-sm"
              />
            ) : (
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#3E2723] to-[#2C1810] text-[#D4AF37] grid place-items-center font-['Cinzel'] font-bold text-xl shadow-[0_4px_10px_rgba(62,39,35,0.3)] border border-[#D4AF37]/50">
                  KI
                </div>
                <span className="font-['Cinzel'] font-bold text-xl tracking-wide text-[#3E2723]">
                  Kiddos Intellect
                </span>
              </div>
            )}
          </Link>
        )}

        {/* CENTER: DESKTOP NAVIGATION */}
        {showShopUI && nav.includes("catalog") && (
          <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 xl:gap-10">
            {[
              { path: "/", label: "HOME" },
              { path: "/catalog", label: "CATALOG" },
              { path: "/aboutus", label: "ABOUT US" },
              { path: "/Sacred Stories", label: "SACRED STORIES" }
            ].map((link) => (
              <NavLink key={link.path} to={link.path} isScrolled={isScrolled}>
                <WaveText text={link.label} hoverColor="#D4AF37" waveHeight={8} />
              </NavLink>
            ))}
          </nav>
        )}

        {/* RIGHT: Icons & Actions */}
        <div className="flex items-center gap-3 sm:gap-5 z-50 relative">

          {/* SEARCH ICON */}
          {showShopUI && (
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search books"
              className={`relative p-2 hover:text-[#D4AF37] transition-colors group ${isScrolled ? 'text-[#3E2723]' : 'text-[#3E2723] [filter:drop-shadow(0_1px_4px_rgba(255,255,255,0.7))]'}`}
            >
              <Search className="w-6 h-6" />
            </button>
          )}

          {/* CART ICON */}
          {showShopUI && nav.includes("cart") && (
            <Link
              to="/cart"
              className={`relative p-2 hover:text-[#D4AF37] transition-colors group ${isScrolled ? 'text-[#3E2723]' : 'text-[#3E2723] [filter:drop-shadow(0_1px_4px_rgba(255,255,255,0.7))]'}`}
              onClick={closeMenu}
              aria-label="Cart"
            >
              <ShoppingBag className="w-6 h-6 transition-transform group-hover:-translate-y-0.5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 min-w-[18px] h-[18px] rounded-full bg-[#D4AF37] text-white text-[10px] flex items-center justify-center font-bold shadow-sm ring-2 ring-white/60 animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* PROFILE LINK */}
          {showShopUI && isCustomer && (
            <Link
              to="/profile"
              className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-white/60 backdrop-blur-sm text-[#3E2723] border border-[#D4AF37]/40 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-white hover:shadow-md transition-all duration-300"
              title="My Profile"
              onClick={closeMenu}
            >
              {customer?.name ? (
                <span className="font-['Cinzel'] font-bold text-sm">{customer.name.charAt(0).toUpperCase()}</span>
              ) : (
                <User className="w-4 h-4" />
              )}
            </Link>
          )}

          {/* LOGIN BUTTON */}
          {showLogin && (
            <Link
              to="/login"
              className={`hidden sm:inline-flex px-6 py-2 rounded-full font-['Cinzel'] font-bold text-sm tracking-wide transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 border
                ${isScrolled
                  ? "bg-gradient-to-r from-[#C59D5F] to-[#B0894C] text-white border-[#D4AF37] hover:shadow-[0_5px_15px_rgba(197,157,95,0.4)]"
                  : "bg-white/20 backdrop-blur-sm text-[#3E2723] border-[#D4AF37]/60 hover:bg-[#D4AF37]/90 hover:text-white hover:border-[#D4AF37]"
                }`}
            >
              Login
            </Link>
          )}

          {/* ADMIN CHIP */}
          {isAdmin && !onAdminPage && (
            <div className="relative hidden sm:block">
              <details className="group relative mt-[9px]">
                <summary className="list-none cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all text-sm font-medium text-[#3E2723]">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span className="font-['Cinzel'] font-bold">Admin</span>
                </summary>
                <div className="absolute left-0 top-full mt-2 w-48 bg-[#FAF7F2]/95 backdrop-blur-md border border-[#D4AF37]/30 rounded-xl shadow-[0_10px_30px_rgba(62,39,35,0.15)] p-1 overflow-hidden">
                  <Link to="/admin/orders">
                    <button className="w-full text-left px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2 rounded-lg transition-colors font-medium">
                      <Home className="w-4 h-4" /> AdminPage
                    </button>
                  </Link>
                  <button
                    onClick={() => logoutAdmin()}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-lg transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </details>
            </div>
          )}

          {/* HAMBURGER MENU */}
          {showShopUI && (
            <button
              className="lg:hidden p-2 text-[#3E2723] hover:bg-white/40 hover:text-[#D4AF37] rounded-lg transition-colors backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}
        </div>
      </div>

      {/* --- MOBILE MENU --- */}
      <div
        className={`
          lg:hidden absolute top-full left-0 w-full
          bg-[#FAF7F2]/95 backdrop-blur-xl
          border-b border-[#D4AF37]/30 shadow-[0_12px_40px_rgba(62,39,35,0.15)]
          transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] origin-top overflow-hidden
          ${isMobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
        `}
        style={{ backgroundImage: `url('/images-webp/homepage/parchment-bg.webp')`, backgroundSize: 'cover' }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: mandalaBg, backgroundSize: '300px', backgroundRepeat: 'repeat' }} />

        <div className="flex flex-col p-8 space-y-6 text-center relative z-10">
          {[
            { path: "/catalog", label: "CATALOG" },
            { path: "/aboutus", label: "ABOUT US" },
            { path: "/PreSchool", label: "PRE SCHOOL" }
          ].map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={closeMenu}
              className="text-[#3E2723] font-['Cinzel'] font-bold text-xl py-2 hover:text-[#D4AF37] transition-colors relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-[#D4AF37] transition-all duration-300 group-hover:w-1/3" />
            </Link>
          ))}

          <div className="pt-6 border-t border-[#D4AF37]/20 flex flex-col gap-4 items-center w-full">
            {showLogin && (
              <Link
                to="/login"
                onClick={closeMenu}
                className="w-full max-w-xs py-3 rounded-full bg-gradient-to-r from-[#C59D5F] to-[#B0894C] text-white font-['Cinzel'] font-bold text-sm shadow-md border border-[#D4AF37]"
              >
                Login / Sign Up
              </Link>
            )}
            {isCustomer && (
              <Link to="/profile" onClick={closeMenu} className="flex items-center gap-2 text-[#3E2723] font-medium font-['Cinzel']">
                <User className="w-5 h-5 text-[#D4AF37]" /> My Profile
              </Link>
            )}
            {isAdmin && (
              <button onClick={logoutAdmin} className="flex items-center gap-2 text-red-600 font-medium py-2 font-['Lato']">
                <LogOut className="w-4 h-4" /> Admin Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </header>

    {/* ===== SEARCH MODAL (fixed, breaks out of header stacking context) ===== */}
    {isSearchOpen && showShopUI && (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
          onClick={() => setIsSearchOpen(false)}
        />

        {/* Search panel */}
        <div
          ref={searchContainerRef}
          className="fixed top-[90px] left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-2xl"
        >
          {/* Input */}
          <div className="relative flex items-center bg-white border-2 border-[#D4AF37] rounded-2xl shadow-[0_20px_60px_rgba(62,39,35,0.35)] overflow-hidden">
           
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setActiveIndex(-1); }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search books, authors…"
              className="w-full pl-12 pr-20 py-4 bg-transparent text-[#3E2723] placeholder:text-[#B0A090] font-['Lato'] text-base outline-none"
            />
            <div className="absolute right-3 flex items-center gap-1">
              {searchLoading
                ? <Loader2 className="w-5 h-5 text-[#D4AF37] animate-spin" />
                : searchQuery
                  ? <button onClick={() => setSearchQuery("")} title="Clear" className="p-1.5 rounded-full text-[#A08C6E] hover:text-[#3E2723] hover:bg-[#FAF7F2] transition-colors"><X className="w-4 h-4" /></button>
                  : null
              }
              <button onClick={() => setIsSearchOpen(false)} title="Close" className="p-1.5 rounded-full text-[#A08C6E] hover:text-[#3E2723] hover:bg-[#FAF7F2] transition-colors border border-[#D4AF37]/20 ml-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Results card */}
          {searchQuery.trim() && (
            <div className="mt-2 bg-white border border-[#D4AF37]/40 rounded-2xl shadow-[0_20px_60px_rgba(62,39,35,0.25)] overflow-hidden">
              {searchResults.length > 0 ? (
                <>
                  <div className="px-4 pt-3 pb-1 border-b border-[#D4AF37]/20">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#A08C6E] font-['Cinzel']">Search Results</span>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto">
                    {searchResults.map((book, idx) => {
                      const coverPath = Array.isArray(book?.assets?.coverUrl)
                        ? book.assets.coverUrl[0]
                        : book?.assets?.coverUrl;
                      const coverSrc = coverPath ? assetUrl(coverPath) : null;
                      return (
                      <button
                        key={book._id || book.slug}
                        onClick={() => handleResultClick(book)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 text-left transition-all border-b border-[#D4AF37]/10 last:border-0
                          ${activeIndex === idx ? "bg-[#FFF9E6] shadow-[inset_3px_0_0_#D4AF37]" : "hover:bg-[#FAF7F2] hover:shadow-[inset_3px_0_0_rgba(212,175,55,0.4)]"}`}
                      >
                        {/* Cover */}
                        <div className="w-12 h-16 shrink-0 rounded-xl overflow-hidden border border-[#D4AF37]/30 bg-[#FAF7F2] shadow-sm">
                          {coverSrc
                            ? <img src={coverSrc} alt={book.title} className="w-full h-full object-cover" onError={e => { e.currentTarget.src = "https://placehold.co/96x128/FAF7F2/D4AF37?text=📖"; }} />
                            : <div className="w-full h-full grid place-items-center text-2xl">📖</div>
                          }
                        </div>
                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <p className="font-['Cinzel'] font-bold text-[#3E2723] text-sm leading-tight line-clamp-2">{book.title}</p>
                          {book.author && <p className="text-[#8A7A5E] text-xs mt-1">{book.author}</p>}
                          {book.price != null && (
                            <p className="text-[#D4AF37] text-xs font-bold mt-1">₹{book.price}</p>
                          )}
                        </div>
                        {/* Arrow */}
                        <ChevronRight className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      </button>
                    );})}
                  </div>
                  <button
                    onClick={() => { setIsSearchOpen(false); navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`); }}
                    className="w-full py-3.5 text-sm font-bold text-[#D4AF37] hover:bg-[#FFF9E6] transition-colors font-['Cinzel'] border-t border-[#D4AF37]/20 tracking-wide"
                  >
                    View all results for "{searchQuery}" →
                  </button>
                </>
              ) : !searchLoading ? (
                <div className="px-6 py-8 text-center">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#FAF7F2] border border-[#D4AF37]/20 grid place-items-center text-2xl">🔍</div>
                  <p className="text-[#3E2723] font-bold font-['Cinzel'] text-sm mb-1">No books found</p>
                  <p className="text-[#8A7A5E] text-xs font-['Lato']">for "<span className="font-semibold">{searchQuery}</span>"</p>
                  <button
                    onClick={() => { setIsSearchOpen(false); navigate(`/catalog`); }}
                    className="mt-4 px-5 py-2 rounded-full border border-[#D4AF37] text-[#D4AF37] font-bold text-xs font-['Cinzel'] hover:bg-[#D4AF37] hover:text-white transition-all"
                  >Browse all books</button>
                </div>
              ) : (
                <div className="py-8 flex justify-center">
                  <Loader2 className="w-7 h-7 text-[#D4AF37] animate-spin" />
                </div>
              )}
            </div>
          )}
        </div>
      </>
    )}
    </>
  );
}

/* --- Helper Components --- */

function NavLink({ to, children, isScrolled }) {
  return (
    <Link
      to={to}
      className={`
        relative py-1 text-sm font-bold tracking-widest font-['Cinzel'] transition-all duration-300
        ${isScrolled
          ? 'text-[#3E2723]'
          : 'text-[#3E2723] [text-shadow:0_1px_8px_rgba(255,255,255,0.8),0_0px_2px_rgba(255,255,255,0.6)]'
        }
        hover:text-[#D4AF37]
        after:content-[''] after:absolute after:left-0 after:bottom-0
        after:block after:h-[2px] after:w-full after:bg-[#D4AF37]
        after:origin-left after:scale-x-0 after:transition-transform after:duration-300
        hover:after:scale-x-100
      `}
    >
      {children}
    </Link>
  );
}