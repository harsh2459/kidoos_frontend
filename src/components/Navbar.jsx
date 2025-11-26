// src/components/Navbar.jsx - WITH PROFILE LINK
import { Link, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import { useSite } from "../contexts/SiteConfig";
import { useAuth } from "../contexts/Auth";
import { useCustomer } from "../contexts/CustomerAuth";
import { assetUrl } from "../api/asset";
import { useCart } from "../contexts/CartStore";

/* simple cart icon */
function CartIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 12.39a2 2 0 0 0 2 1.61h8.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

export default function Navbar() {
  const loc = useLocation();
  const onAdminPage = loc.pathname.startsWith("/admin");

  const { site, visibility } = useSite();
  const nav = useMemo(() => visibility?.publicNav || ["catalog", "cart"], [visibility]);

  const { isAdmin, admin, logout: logoutAdmin } = useAuth();
  const { isCustomer, customer, logout: logoutCustomer } = useCustomer();

  // cart count badge
  const cartCount = useCart((s) =>
    (s.items || []).reduce((sum, it) => sum + Number(it.qty ?? 1), 0)
  );

  const [openCustomer, setOpenCustomer] = useState(false);

  // shopper UI rules
  const showShopUI = !isAdmin && !onAdminPage;
  const showLogin = !isAdmin && !isCustomer && !onAdminPage;

  // brand visibility: hide logo whenever an admin is logged in
  const showBrand = !isAdmin;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="relative mx-auto max-w-7xl px-4 h-[68px] flex items-center">
        {/* LEFT: Brand (hidden for admin) */}
        {showBrand && (
          <Link to="/" className="flex items-center gap-3 shrink-0">
            {site?.logoUrl ? (
              <img
                src={assetUrl(site.logoUrl)}
                alt="logo"
                className="h-[4rem] w-auto object-contain"
              />
            ) : (
              <div className="h-8 w-8 rounded-md bg-gray-100 grid place-items-center text-xs text-gray-500">
                logo
              </div>
            )}
          </Link>
        )}

        {/* CENTER: CATALOG + ABOUT US */}
        {showShopUI && nav.includes("catalog") && (
          <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8">
            <Link
              to="/catalog"
              className="relative tracking-[0.25em] text-sm font-medium text-gray-700 hover:text-gray-900 
                after:content-[''] after:absolute after:left-0 after:-bottom-[6px]
                after:block after:h-[2px] after:w-full after:bg-current
                after:origin-left after:scale-x-0 after:transition-transform after:duration-300
                hover:after:scale-x-100"
            >
              CATALOG
            </Link>
            <Link
              to="/aboutus"
              className="relative tracking-[0.25em] text-sm font-medium text-gray-700 hover:text-gray-900
                after:content-[''] after:absolute after:left-0 after:-bottom-[6px]
                after:block after:h-[2px] after:w-full after:bg-current
                after:origin-left after:scale-x-0 after:transition-transform after:duration-300
                hover:after:scale-x-100"
            >
              ABOUT US
            </Link>
          </nav>
        )}

        {/* RIGHT: Cart icon + profile/login/admin chip */}
        <div className="ml-auto flex items-center gap-4">
          {/* CART ICON */}
          {showShopUI && nav.includes("cart") && (
            <Link to="/cart" className="relative inline-flex items-center group">
              <CartIcon className="h-6 w-6 text-gray-700 group-hover:text-gray-900 transition-colors" />
              {cartCount > 0 && (
                <span
                  className="absolute -top-2 -right-2 min-w-[20px] h-[20px]
                    rounded-full bg-red-600 text-white text-[11px] leading-none
                    px-1.5 flex items-center justify-center font-semibold shadow-md"
                  aria-label={`${cartCount} items in cart`}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* PROFILE LINK (only for authenticated customers) */}
          {showShopUI && isCustomer && (
            <Link
              to="/profile"
              className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors group"
              title="My Profile"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm group-hover:shadow-md transition-shadow">
                {customer?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </Link>
          )}

          {/* CUSTOMER DROPDOWN (alternative - commented out since we have profile link above) */}
          {/* {!isAdmin && !onAdminPage && isCustomer && (
            <div className="relative">
              <button
                onClick={() => setOpenCustomer((v) => !v)}
                onBlur={() => setTimeout(() => setOpenCustomer(false), 150)}
                className="px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 hover:bg-gray-200 transition-colors"
              >
                Hi, {customer?.name?.split(" ")[0] || "there"}
              </button>
              {openCustomer && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg p-1">
                  <MenuButton onClick={() => navigate('/profile')} label="My Profile" />
                  <MenuButton onClick={() => logoutCustomer()} label="Logout" />
                </div>
              )}
            </div>
          )} */}

          {/* LOGIN */}
          {showLogin && (
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Login
            </Link>
          )}

          {/* ADMIN CHIP */}
          {isAdmin && (
            <div className="relative">
              <details className="group">
                <summary className="list-none cursor-pointer px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 hover:bg-gray-200 transition-colors">
                  Hi, {admin?.name || "Admin"}{" "}
                  <span className="ml-1 text-[10px] align-middle px-1.5 py-0.5 rounded bg-white text-gray-600 border">
                    ADMIN
                  </span>
                </summary>
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg p-1">
                  <MenuButton onClick={() => logoutAdmin()} label="Logout" />
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm"
    >
      {label}
    </button>
  );
}