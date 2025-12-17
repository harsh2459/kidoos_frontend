import { Link, useLocation } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { useSite } from "../contexts/SiteConfig";
import { useAuth } from "../contexts/Auth";
import { useCustomer } from "../contexts/CustomerAuth";
import { assetUrl } from "../api/asset";
import { useCart } from "../contexts/CartStore";
import {
  Menu, X, ShoppingBag, User, LogOut, ShieldCheck
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

  return (
    <header
      className={`
        sticky top-0 z-50 font-sans transition-all duration-300 border-b
        ${isScrolled
          ? "bg-white/95 backdrop-blur-md border-[#E3E8E5] shadow-sm py-2"
          : "bg-white border-transparent py-4"
        }
      `}
    >

      {/* Container: Responsive max-width for Mobile to Ultra-Wide */}
      <div className="relative mx-auto w-full px-4 sm:px-6 lg:px-8 2xl:px-12 flex items-center justify-between max-w-7xl 2xl:max-w-[1800px]">

        {/* LEFT: Brand */}
        {showBrand && (
          <Link to="/" className="flex items-center gap-3 shrink-0 z-50 relative group" onClick={closeMenu}>
            {site?.logoUrl ? (
              <img
                src={assetUrl(site.logoUrl)}
                alt="logo"
                className="h-10 md:h-[5rem] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="h-10 w-10 rounded-xl bg-[#1A3C34] text-white grid place-items-center font-serif font-bold text-xl shadow-md">
                KI
              </div>
            )}

          </Link>
        )}

        {/* CENTER: DESKTOP NAVIGATION */}
        {showShopUI && nav.includes("catalog") && (
          <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 xl:gap-12">
            {[
              { path: "/catalog", label: "CATALOG" },
              { path: "/aboutus", label: "ABOUT US" },
              { path: "/PreSchool", label: "PRE SCHOOL" }
            ].map((link) => (
              <NavLink key={link.path} to={link.path}>
                <WaveText text={link.label} hoverColor="#000" waveHeight={10} />
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
              className="relative p-2 text-[#1A3C34] hover:text-[#4A7C59] transition-colors group"
              onClick={closeMenu}
              aria-label="Cart"
            >
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 min-w-[18px] h-[18px] rounded-full bg-[#4A7C59] text-white text-[10px] flex items-center justify-center font-bold shadow-sm ring-2 ring-white animate-bounce-short">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* PROFILE LINK */}
          {showShopUI && isCustomer && (
            <Link
              to="/profile"
              className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-[#E8F0EB] text-[#1A3C34] border border-[#DCE4E0] hover:border-[#4A7C59] hover:shadow-md transition-all"
              title="My Profile"
              onClick={closeMenu}
            >
              {customer?.name ? (
                <span className="font-serif font-bold text-sm">{customer.name.charAt(0).toUpperCase()}</span>
              ) : (
                <User className="w-4 h-4" />
              )}
            </Link>
          )}

          {/* LOGIN BUTTON */}
          {showLogin && (
            <Link
              to="/login"
              className="hidden sm:inline-flex px-6 py-2.5 rounded-xl bg-[#1A3C34] text-white font-bold text-sm hover:bg-[#2F523F] transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <WaveText text="Login" hoverColor="#fff" waveHeight={10} />
            </Link>
          )}

          {/* ADMIN CHIP */}
          {isAdmin && (
            <div className="relative hidden sm:block">
              <details className="group relative">
                <summary className="list-none cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FAFBF9] border border-[#E3E8E5] hover:border-[#1A3C34] transition-all text-sm font-medium text-[#2C3E38]">
                  <ShieldCheck className="w-4 h-4 text-[#4A7C59]" />
                  <span>Admin</span>
                </summary>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#E3E8E5] rounded-xl shadow-xl p-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-2 border-b border-[#F4F7F5] text-xs text-[#8BA699]">
                    Signed in as {admin?.name || "Admin"}
                  </div>
                  <button
                    onClick={() => logoutAdmin()}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-lg transition-colors"
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
              className="lg:hidden p-2 text-[#1A3C34] hover:bg-[#F4F7F5] rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}
        </div>
      </div>

      {/* --- MOBILE DROPDOWN MENU --- */}
      <div
        className={`
            lg:hidden absolute top-full left-0 w-full bg-white border-b border-[#E3E8E5] shadow-xl 
            transition-all duration-300 ease-in-out origin-top overflow-hidden
            ${isMobileMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="flex flex-col p-6 space-y-4 text-center">

          {[
            { path: "/catalog", label: "CATALOG" },
            { path: "/aboutus", label: "ABOUT US" },
            { path: "/PreSchool", label: "PRE SCHOOL" }
          ].map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={closeMenu}
              className="text-[#1A3C34] font-serif font-bold text-lg py-2 hover:text-[#4A7C59] transition-colors"
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile Actions */}
          <div className="pt-4 border-t border-[#F4F7F5] flex flex-col gap-3 items-center w-full">
            {showLogin && (
              <Link
                to="/login"
                onClick={closeMenu}
                className="w-full max-w-xs py-3 rounded-xl bg-[#1A3C34] text-white font-bold text-sm shadow-md"
              >
                Login / Sign Up
              </Link>
            )}

            {isCustomer && (
              <Link
                to="/profile"
                onClick={closeMenu}
                className="flex items-center gap-2 text-[#1A3C34] font-medium"
              >
                <User className="w-5 h-5" /> My Profile
              </Link>
            )}

            {isAdmin && (
              <button onClick={logoutAdmin} className="flex items-center gap-2 text-red-600 font-medium py-2">
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

// Desktop Nav Link with Left-to-Right Underline Animation
function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="
                relative py-1 text-sm font-bold tracking-widest text-[#5C756D] hover:text-[#1A3C34] transition-colors duration-300
                after:content-[''] after:absolute after:left-0 after:bottom-0
                after:block after:h-[2px] after:w-full after:bg-[#4A7C59]
                after:origin-left after:scale-x-0 after:transition-transform after:duration-300
                hover:after:scale-x-100
            "
    >
      {children}
    </Link>
  );
}