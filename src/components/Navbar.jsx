// src/components/Navbar.jsx
import { Link, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import { useSite } from "../contexts/SiteConfig";
import { useAuth } from "../contexts/Auth";                // admin auth
import { useCustomer } from "../contexts/CustomerAuth";    // customer hook
import { assetUrl } from "../api/asset";

export default function Navbar() {
  const loc = useLocation();
  const onAdminPage = loc.pathname.startsWith("/admin");

  const { site, visibility } = useSite();
  const nav = useMemo(() => visibility?.publicNav || ["catalog", "cart"], [visibility]);

  // ---- auth state
  const { isAdmin, admin, logout: logoutAdmin } = useAuth();
  const { isCustomer, customer, logout: logoutCustomer } = useCustomer();

  // ---- UI state
  const [openCustomer, setOpenCustomer] = useState(false);

  // ---- visibility rules
  // Hide shopper nav when admin is logged in OR on /admin/*
  const showCustomerNav = !isAdmin && !onAdminPage;
  // Hide Login button when admin is logged in (or when a customer is already logged in)
  const showLogin = !isAdmin && !isCustomer && !onAdminPage;

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-border-subtle">
      <div className="mx-auto max-w-container px-4 h-[68px] flex items-center gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          {site?.logoUrl ? (
            <img src={assetUrl(site.logoUrl)} alt="logo" className="h-[4rem] w-auto object-contain" />
          ) : (
            <div className="h-8 w-8 rounded-md bg-surface-subtle grid place-items-center text-xs text-fg-subtle">
              logo
            </div>
          )}
          {/* <div className="font-semibold hidden sm:block">{site?.title || "Kiddos intellect"}</div> */}
        </Link>

        {/* Left nav (Catalog / Cart) — hidden for admin and on /admin/* */}
        {showCustomerNav && (
          <nav className="ml-2 flex items-center gap-6 text-sm">
            {nav.includes("catalog") && <Link to="/catalog">Catalog</Link>}
            {nav.includes("cart") && <Link to="/cart">Cart</Link>}
          </nav>
        )}

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          {/* Customer profile (hidden for admin and on /admin/*) */}
          {!isAdmin && !onAdminPage && isCustomer && (
            <div className="relative">
              <button
                onClick={() => setOpenCustomer(v => !v)}
                onBlur={() => setTimeout(() => setOpenCustomer(false), 150)}
                className="px-3 py-1.5 rounded-lg bg-surface-subtle border border-border-subtle"
              >
                Hi, {customer?.name?.split(" ")[0] || "there"}
              </button>
              {openCustomer && (
                <div className="absolute right-0 mt-2 w-48 bg-surface border border-border-subtle rounded-xl shadow-theme p-1">
                  <MenuButton
                    onClick={() => {
                      logoutCustomer();          // clears cust_jwt and state
                      // window.location.href = "/"; // optional hard refresh
                    }}
                    label="Logout"
                  />
                </div>
              )}
            </div>
          )}

          {/* Login (hidden for admin, hidden if customer already logged in, and hidden on /admin/*) */}
          {showLogin && (
            <Link to="/login" className="px-3 py-1.5 rounded-lg border bg-surface hover:bg-surface-subtle">
              Login
            </Link>
          )}

          {/* Admin profile chip (always visible when admin logged in) */}
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
                  <MenuButton
                    onClick={() => {
                      logoutAdmin();             // clears admin_jwt and state
                      // window.location.href = "/admin/login"; // optional redirect
                    }}
                    label="Logout"
                  />
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* Utilities */
function MenuButton({ onClick, label }) {
  return (
    <button onClick={onClick} className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-subtle">
      {label}
    </button>
  );
}
