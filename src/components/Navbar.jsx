// src/components/Navbar.jsx
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
  const showShopUI = !isAdmin && !onAdminPage;      // show catalog + cart
  const showLogin = !isAdmin && !isCustomer && !onAdminPage;

  // brand visibility: hide logo whenever an admin is logged in
  const showBrand = !isAdmin;

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-border-subtle">
      <div className="relative mx-auto max-w-container px-4 h-[68px] flex items-center">
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
              <div className="h-8 w-8 rounded-md bg-surface-subtle grid place-items-center text-xs text-fg-subtle">
                logo
              </div>
            )}
          </Link>
        )}

        {/* CENTER: CATALOG (centered regardless of left/right widths) */}
        {showShopUI && nav.includes("catalog") && (
          <nav
            className="
              pointer-events-auto
              absolute left-1/2 -translate-x-1/2
            "
          >
            <Link
              to="/catalog"
              className="
                mr-3
                relative tracking-[0.25em] text-sm
                after:content-[''] after:absolute after:left-0 after:-bottom-[6px]
                after:block after:h-[2px] after:w-full after:bg-current/80
                after:origin-left after:scale-x-0 after:transition-transform after:duration-300
                hover:after:scale-x-100
              "
            >
              CATALOG
            </Link>
            <Link
              to="/aboutus"
              className="
              ml-3
                relative tracking-[0.25em] text-sm
                after:content-[''] after:absolute after:left-0 after:-bottom-[6px]
                after:block after:h-[2px] after:w-full after:bg-current/80
                after:origin-left after:scale-x-0 after:transition-transform after:duration-300
                hover:after:scale-x-100
              "
            >
              ABOUT US
            </Link>
          </nav>
        )}

        {/* RIGHT: Cart icon + profile/login/admin chip */}
        <div className="ml-auto flex items-center gap-4">
          {/* CART ICON (right side) */}
          {showShopUI && nav.includes("cart") && (
            <Link to="/cart" className="relative inline-flex items-center">
              <CartIcon className="h-5 w-5" />
              {cartCount > 0 && (
                <span
                  className="
                    absolute -top-2 -right-2 min-w-[18px] h-[18px]
                    rounded-full bg-red-600 text-white text-[10px] leading-none
                    px-1 flex items-center justify-center font-medium shadow
                  "
                  aria-label={`${cartCount} items in cart`}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* CUSTOMER CHIP */}
          {!isAdmin && !onAdminPage && isCustomer && (
            <div className="relative">
              <button
                onClick={() => setOpenCustomer((v) => !v)}
                onBlur={() => setTimeout(() => setOpenCustomer(false), 150)}
                className="px-3 py-1.5 rounded-lg bg-surface-subtle border border-border-subtle"
              >
                Hi, {customer?.name?.split(" ")[0] || "there"}
              </button>
              {openCustomer && (
                <div className="absolute right-0 mt-2 w-48 bg-surface border border-border-subtle rounded-xl shadow-theme p-1">
                  <MenuButton onClick={() => logoutCustomer()} label="Logout" />
                </div>
              )}
            </div>
          )}

          {/* LOGIN */}
          {showLogin && (
            <Link
              to="/login"
              className="px-3 py-1.5 rounded-lg border bg-surface hover:bg-surface-subtle"
            >
              Login
            </Link>
          )}

          {/* ADMIN CHIP */}
          {isAdmin && (
            <div className="relative">
              <details className="group">
                <summary className="list-none cursor-pointer px-3 py-1.5 rounded-lg bg-surface-subtle border border-border-subtle">
                  Hi, {admin?.name || "Admin"}{" "}
                  <span className="ml-1 text-[10px] align-middle px-1.5 py-0.5 rounded bg-surface text-fg-muted border">
                    ADMIN
                  </span>
                </summary>
                <div className="absolute right-0 mt-2 w-48 bg-surface border border-border-subtle rounded-xl shadow-theme p-1">
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
      className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-subtle"
    >
      {label}
    </button>
  );
}
