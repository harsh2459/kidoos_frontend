import { Link, useLocation } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { useSite } from "../contexts/SiteConfig";
import { useAuth } from "../contexts/Auth";
import { useCustomer } from "../contexts/CustomerAuth";
import { assetUrl } from "../api/asset";
import { useCart } from "../contexts/CartStore";
import {
  Menu, X, ShoppingBag, User, LogOut, ShieldCheck, Search,
  Home
} from "lucide-react";
import WaveText from "./WaveText";

export default function Navbar() {
  const loc = useLocation();
  const onAdminPage = loc.pathname.startsWith("/admin");

  const { site, visibility } = useSite();
  const nav = useMemo(() => visibility?.publicNav || ["catalog", "cart"], [visibility]);

  const { isAdmin, admin, logout: logoutAdmin } = useAuth();
  const { isCustomer, customer } = useCustomer();

  // Cart count badge
  const cartCount = useCart((s) =>
    (s.items || []).reduce((sum, it) => sum + Number(it.qty ?? 1), 0)
  );

  // State for Mobile Menu & Scrolled State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // UI Rules
  const showShopUI = !isAdmin && !onAdminPage;
  const showLogin = !isAdmin && !isCustomer && !onAdminPage;
  const showBrand = !isAdmin;

  const closeMenu = () => setIsMobileMenuOpen(false);

  // VRINDAVAN THEME ASSETS
  const mandalaBg = "url('/images/homepage/mandala-bg.png')";

  return (
    <header
      className={`
        sticky top-0 z-[100] font-['Lato'] transition-all duration-500 ease-in-out
        ${isScrolled
          ? "bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#D4AF37]/30 shadow-md py-2"
          : "bg-transparent border-b border-transparent py-4"
        }
      `}
    >
      {/* Decorative Top Line (Golden Thread) */}
      <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent transition-opacity duration-500 ${isScrolled ? 'opacity-100' : 'opacity-0'}`}></div>

      <div className="relative mx-auto w-full px-4 sm:px-6 lg:px-8 2xl:px-12 flex items-center justify-between max-w-7xl 2xl:max-w-[1800px]">

        {/* LEFT: Brand */}
        {showBrand && (
          <Link to="/" className="flex items-center gap-3 shrink-0 z-50 relative group" onClick={closeMenu}>
            {site?.logoUrl ? (
              <img
                src={assetUrl(site.logoUrl)}
                alt="logo"
                className="h-12 md:h-[5rem] w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-sm"
              />
            ) : (
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br  from-[#3E2723] to-[#2C1810] text-[#D4AF37] grid place-items-center font-['Cinzel'] font-bold text-xl shadow-[0_4px_10px_rgba(62,39,35,0.3)] border border-[#D4AF37]/50">
                  KI
                </div>
                <span className={`font-['Cinzel'] font-bold text-xl tracking-wide hidden sm:block transition-colors ${isScrolled ? 'text-[#3E2723]' : 'text-[#3E2723]'}`}>
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
              { path: "/catalog", label: "CATALOG" },
              { path: "/aboutus", label: "ABOUT US" },
              { path: "/Sacred Stories", label: "Sacred Stories" }
            ].map((link) => (
              <NavLink key={link.path} to={link.path} isScrolled={isScrolled}>
                {/* Passing Gold color for hover effect */}
                <WaveText text={link.label} hoverColor="#D4AF37" waveHeight={8} />
              </NavLink>
            ))}
          </nav>
        )}

        {/* RIGHT: Icons & Actions */}
        <div className="flex items-center gap-3 sm:gap-5 z-50 relative">
          {/* CART ICON */}
          {showShopUI && nav.includes("cart") && (
            <Link
              to="/cart"
              className="relative p-2 text-[#3E2723] hover:text-[#D4AF37] transition-colors group"
              onClick={closeMenu}
              aria-label="Cart"
            >
              <ShoppingBag className="w-6 h-6 transition-transform group-hover:-translate-y-0.5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 min-w-[18px] h-[18px] rounded-full bg-[#D4AF37] text-white text-[10px] flex items-center justify-center font-bold shadow-sm ring-2 ring-[#FAF7F2] animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* PROFILE LINK */}
          {showShopUI && isCustomer && (
            <Link
              to="/profile"
              className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-[#FFF9E6] text-[#3E2723] border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-white hover:shadow-md transition-all duration-300"
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

          {/* LOGIN BUTTON (Gold Gradient) */}
          {showLogin && (
            <Link
              to="/login"
              className="hidden sm:inline-flex px-6 py-2 rounded-full bg-gradient-to-r from-[#C59D5F] to-[#B0894C] text-white font-['Cinzel'] font-bold text-sm tracking-wide hover:shadow-[0_5px_15px_rgba(197,157,95,0.4)] transition-all transform hover:-translate-y-0.5 active:scale-95 border border-[#D4AF37]"
            >
              Login
            </Link>
          )}

          {/* ADMIN CHIP */}
          {isAdmin && (
            <div className="relative hidden sm:block">
              <details className="group relative mt-[9px]">
                <summary className="list-none cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFF9E6] border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all text-sm font-medium text-[#3E2723]">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span className="font-['Cinzel'] font-bold">Admin</span>
                </summary>
                <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-[#D4AF37]/30 rounded-xl shadow-[0_10px_30px_rgba(62,39,35,0.1)] p-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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

          {/* HAMBURGER MENU (Mobile/Tablet) */}
          {showShopUI && (
            <button
              className="lg:hidden p-2 text-[#3E2723] hover:bg-[#FFF9E6] hover:text-[#D4AF37] rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}
        </div>
      </div>

      {/* --- MOBILE DROPDOWN MENU (Parchment Scroll Style) --- */}
      <div
        className={`
            lg:hidden absolute top-full left-0 w-full bg-[#FAF7F2] border-b border-[#D4AF37]/30 shadow-2xl 
            transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] origin-top overflow-hidden
            ${isMobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
        `}
        style={{
          backgroundImage: `url('/images/homepage/parchment-bg.png')`, // Ensure this path is correct
          backgroundSize: 'cover'
        }}
      >
        {/* Mandala Watermark inside menu */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: mandalaBg, backgroundSize: '300px', backgroundRepeat: 'repeat' }}
        ></div>

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
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-[#D4AF37] transition-all duration-300 group-hover:w-1/3"></span>
            </Link>
          ))}

          {/* Mobile Actions */}
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
              <Link
                to="/profile"
                onClick={closeMenu}
                className="flex items-center gap-2 text-[#3E2723] font-medium font-['Cinzel']"
              >
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
  );
}

/* --- Helper Components --- */

// Desktop Nav Link with Gold Underline Animation
function NavLink({ to, children, isScrolled }) {
  return (
    <Link
      to={to}
      className={`
        relative py-1 text-sm font-bold tracking-widest font-['Cinzel'] transition-colors duration-300
        ${isScrolled ? 'text-[#3E2723]' : 'text-[#3E2723]'}
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