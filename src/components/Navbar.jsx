// src/components/Navbar.jsx
import { Link, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import { useSite } from "../contexts/SiteConfig";
import { useAuth } from "../contexts/Auth";                // admin auth
import { useCustomer } from "../contexts/CustomerAuth";        // customer hook (default export)
import { assetUrl } from "../api/asset";

export default function Navbar() {
  const loc = useLocation();
  const onAdminPage = loc.pathname.startsWith("/admin");

  const { site, visibility } = useSite();
  const nav = useMemo(() => visibility?.publicNav || ["catalog", "cart"], [visibility]);

  const { isAdmin, admin, logout: logoutAdmin } = useAuth();
  const { isCustomer, customer, logout: logoutCustomer } = useCustomer();

  const [openAdmin, setOpenAdmin] = useState(false);
  const [openCustomer, setOpenCustomer] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-border-subtle">
      <div className="mx-auto max-w-container px-4 h-14 flex items-center gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          {site?.logoUrl ? (
            <img src={assetUrl(site.logoUrl)} alt="logo" className="h-8 w-auto object-contain" />
          ) : (
            <div className="h-8 w-8 rounded-md bg-surface-subtle grid place-items-center text-xs text-fg-subtle">logo</div>
          )}
          <div className="font-semibold hidden sm:block">{site?.title || "Kiddos intellect"}</div>
        </Link>

        {/* Left nav */}
        <nav className="ml-2 flex items-center gap-6 text-sm">
          {nav.includes("catalog") && <Link to="/catalog">Catalog</Link>}
          {nav.includes("cart") && <Link to="/cart">Cart</Link>}

          {/* Always show Admin menu if signed in as admin */}
          {isAdmin && (
            <div className="relative">
              <button
                className="px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-border-subtle/50 border border-border-subtle"
                onClick={() => setOpenAdmin(v => !v)}
                onBlur={() => setTimeout(() => setOpenAdmin(false), 150)}
              >
                Admin
              </button>
              {openAdmin && (
                <div className="absolute left-0 mt-2 w-56 bg-surface border border-border-subtle rounded-xl shadow-theme p-1">
                  <MenuLink to="/admin/orders" label="Orders" />
                  <MenuLink to="/admin/books" label="Books" />
                  <MenuLink to="/admin/add-book" label="Add Book" />
                  <MenuLink to="/admin/setup" label="Add Admin" />
                  <MenuLink to="/admin/homepage" label="Homepage" />
                  <MenuLink to="/admin/settings" label="Settings" />
                  <MenuLink to="/admin/payments" label="Payments" />
                  <MenuLink to="/admin/api-users" label="API Users" />
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          {/* Customer profile / login — hidden on /admin/* so it doesn't clutter admin UI */}
          {!onAdminPage && (
            isCustomer ? (
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
                        // optional hard refresh:
                        // window.location.href = "/";
                      }}
                      label="Logout"
                    />
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="px-3 py-1.5 rounded-lg border bg-surface hover:bg-surface-subtle">
                Login
              </Link>
            )
          )}

          {/* Admin profile chip with quick logout */}
          {isAdmin && (
            <div className="relative">
              <details className="group">
                <summary className="list-none cursor-pointer px-3 py-1.5 rounded-lg bg-surface-subtle border border-border-subtle">
                  Hi, {admin?.name || "Admin"}{" "}
                  <span className="ml-1 text-[10px] align-middle px-1.5 py-0.5 rounded bg-surface text-fg-muted border">ADMIN</span>
                </summary>
                <div className="absolute right-0 mt-2 w-48 bg-surface border border-border-subtle rounded-xl shadow-theme p-1">
                  <MenuButton
                    onClick={() => {
                      logoutAdmin();             // clears admin_jwt and state
                      // optional: window.location.href = "/admin/login";
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

function MenuLink({ to, label }) {
  return (
    <Link
      to={to}
      className="block px-3 py-2 rounded-lg hover:bg-surface-subtle"
    >
      {label}
    </Link>
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
