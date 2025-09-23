// src/components/AdminSidebar.jsx
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/Auth";

export default function AdminSidebar() {
  const { token, logout } = useAuth();
  const loc = useLocation();
  const isAdmin = !!token;
  if (!isAdmin) return null;

  return (
    <aside
      className="
        hidden md:flex
        fixed left-0 top-0 h-screen w-64
        flex-col
        bg-surface border-r border-border-subtle
        shadow-theme
        z-40
      "
    >
      {/* Brand / Title */}
      <div className="h-16 px-4 flex items-center gap-2 border-b border-border-subtle">
        <div className="h-8 w-8 rounded-md bg-surface-subtle grid place-items-center text-xs text-fg-subtle">
          KI
        </div>
        <div className="font-semibold">Admin</div>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto p-2">
        <Section>
          <Item to="/admin/orders"   active={loc.pathname.startsWith("/admin/orders")}>Orders</Item>
          <Item to="/admin/books"    active={loc.pathname.startsWith("/admin/books")}>Books</Item>
          <Item to="/admin/add-book" active={loc.pathname.startsWith("/admin/add-book")}>Add Book</Item>
          <Item to="/admin/payments" active={loc.pathname.startsWith("/admin/payments")}>Payments</Item>
          <Item to="/admin/settings" active={loc.pathname.startsWith("/admin/settings")}>Settings</Item>
          <Item to="/admin/api-users" active={loc.pathname.startsWith("/admin/api-users")}>API Users</Item>
          <Item to="/admin/homepage" active={loc.pathname.startsWith("/admin/homepage")}>Homepage</Item>
        </Section>
      </nav>

      {/* Footer actions */}
      <div className="p-3 border-t border-border-subtle">
        <button
          onClick={() => logout()}
          className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-subtle"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-3">
      <div className="px-3 pb-2 pt-1 text-xs uppercase tracking-wide text-fg-muted">{title}</div>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function Item({ to, active, children }) {
  const base = "px-3 py-2 rounded-lg";
  const cls = active
    ? `${base} bg-surface-subtle border border-border-subtle`
    : `${base} hover:bg-surface-subtle`;
  return (
    <Link to={to} className={cls}>
      {children}
    </Link>
  );
}
