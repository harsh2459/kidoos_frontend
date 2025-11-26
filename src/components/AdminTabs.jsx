// frontend/src/components/AdminTabs.jsx
import { NavLink } from "react-router-dom";

export default function AdminTabs() {
  const link = "px-3 py-2 rounded-theme hover:bg-white/10";
  return (
    <div className="flex gap-2 mb-4 overflow-x-auto">
      <NavLink to="/admin/orders" className={link}>Orders</NavLink>
      <NavLink to="/admin/api-users" className={link}>API Users</NavLink>
      <NavLink to="/admin/email-senders" className={link}>Email Senders</NavLink>
      <NavLink to="/admin/email-templates" className={link}>Email Templates</NavLink>
      <NavLink to="/admin/payments" className={({ isActive }) =>
        `${link} ${isActive ? "bg-white/20" : ""}`
      }>
        Payments
      </NavLink>
      <NavLink to="/admin/settings/popup" className={link}>
        🎯 Popups
      </NavLink>
      <NavLink
        to="/admin/books"
        className={({ isActive }) => `${link} ${isActive ? "bg-brand text-brand-foreground" : "text-fg-muted hover:text-fg"}`}
      >
        Books
      </NavLink>
      <NavLink
        to="/admin/setup"
        className={({ isActive }) => `${link} ${isActive ? "bg-brand text-brand-foreground" : "text-fg-muted hover:text-fg"}`}
      >
        Setup
      </NavLink>
    </div>
  );
}

