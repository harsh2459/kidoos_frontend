// src/components/AdminSidebar.jsx
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/Auth";
import {
  LayoutDashboard,
  ShoppingBag,
  BookOpen,
  PlusCircle,
  Layers,
  CreditCard,
  Settings,
  Users,
  Home,
  ShieldPlus,
  LogOut, Target,
  Milestone,
  Mail,
  Sparkles
} from "lucide-react";
import WaveText from "./WaveText";

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
        bg-white border-r border-[#E3E8E5]
        shadow-sm z-50
      "
    >
      {/* Brand / Title */}
      <div className="h-20 px-6 flex items-center gap-3 border-b border-[#F4F7F5]">
        <div className="h-10 w-10 rounded-xl bg-[#1A3C34] text-white grid place-items-center font-serif font-bold text-xl shadow-md">
          KI
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-[#1A3C34] leading-tight">Admin</span>
          <span className="text-[10px] text-[#5C756D] font-medium tracking-wider uppercase">Panel</span>
        </div>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
        <SectionHeader title="Store Management" />
        <Item
          to="/admin/orders"
          active={loc.pathname.startsWith("/admin/orders")}
          icon={ShoppingBag}
        >
          <WaveText text="Orders" hoverColor="#000" />
        </Item>
        <Item
          to="/admin/books"
          active={loc.pathname.startsWith("/admin/books")}
          icon={BookOpen}
        >
          <WaveText text="Books" hoverColor="#000"  />
        </Item>
        <Item
          to="/admin/add-book"
          active={loc.pathname.startsWith("/admin/add-book")}
          icon={PlusCircle}
        >
          <WaveText text="Add Books" hoverColor="#000"  />
        </Item>
        <Item
          to="/admin/categories"
          active={loc.pathname.startsWith("/admin/categories")}
          icon={Layers}
        >
          <WaveText text="Categories" hoverColor="#000"  />
        </Item>
        <Item
          to="/admin/settings/popup"
          active={loc.pathname.startsWith("/admin/settings/popup")}
          icon={Target}
        >
          <WaveText text="PopUps" hoverColor="#000"  />
        </Item>

        <div className="my-4 border-t border-[#F4F7F5]"></div>

        <SectionHeader title="System & Users" />
        <Item
          to="/admin/payments"
          active={loc.pathname.startsWith("/admin/payments")}
          icon={CreditCard}
        >
          <WaveText text="Payment Api" hoverColor="#000"  />
        </Item>
        <Item
          to="/admin/email-senders"
          active={loc.pathname.startsWith("/admin/email-senders")}
          icon={Mail}
        >
          <WaveText text="Email Senders" hoverColor="#000"  />
        </Item>
        <Item
          to="/admin/email-templates"
          active={loc.pathname.startsWith("/admin/email-templates")}
          icon={LayoutDashboard}
        >
          <WaveText text="Email Templates" hoverColor="#000"  />
        </Item>
        <Item
          to="/admin/api-users"
          active={loc.pathname.startsWith("/admin/api-users")}
          icon={Users}
        >
          <WaveText text="Shipment Profile" hoverColor="#000"  />
        </Item>
        <Item
          to="/admin/homepage"
          active={loc.pathname.startsWith("/admin/homepage")}
          icon={LayoutDashboard}
        >
          <WaveText text="Homepage" hoverColor="#000"  />
        </Item>
        <Item
          to="/admin/catalog"
          active={loc.pathname.startsWith("/admin/catalog")}
          icon={LayoutDashboard}
        >
          <WaveText text="Catalog Header" hoverColor="#000"  />
        </Item>
        <Item
          to="/admin/settings/ai"
          active={loc.pathname.startsWith("/admin/settings/ai")}
          icon={Sparkles}
        >
          <WaveText text="AI Settings" hoverColor="#000"  />
        </Item>
        <Item
          to="/admin/settings"
          active={loc.pathname.startsWith("/admin/settings")}
          icon={Settings}
        >
          <WaveText text="Settings" hoverColor="#000"  />
        </Item>
        <Item
          to="/admin/setup"
          active={loc.pathname.startsWith("/admin/setup")}
          icon={ShieldPlus}
        >
          <WaveText text="Add Admin" hoverColor="#000"  />
        </Item>
      </nav>

      {/* Footer actions */}
      <div className="p-4 border-t border-[#E3E8E5] bg-[#FAFBF9]">
        <button
          onClick={() => logout()}
          className="
            group flex items-center gap-3 w-full px-4 py-3 rounded-xl 
            text-[#5C756D] font-bold text-sm transition-all duration-200
            hover:bg-red-50 hover:text-red-600 hover:shadow-sm
          "
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <WaveText text="Logout" hoverColor="#000"  />
        </button>
      </div>
    </aside>
  );
}

// --- Helper Components ---

function SectionHeader({ title }) {
  return (
    <div className="px-4 pb-2 pt-2 text-[11px] font-bold uppercase tracking-widest text-[#8BA699]">
      {title}
    </div>
  );
}

function Item({ to, active, children, icon: Icon }) {
  // Styles matching the Navbar/AdminTabs logic
  const base = "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 mb-1";

  // Active: Deep Green BG, White Text
  const activeClass = "bg-[#1A3C34] text-white shadow-md shadow-[#1A3C34]/20";

  // Inactive: Muted Text, Hover Light Green
  const inactiveClass = "text-[#5C756D] hover:bg-[#F4F7F5] hover:text-[#1A3C34]";

  return (
    <Link to={to} className={`${base} ${active ? activeClass : inactiveClass}`}>
      {Icon && <Icon className={`w-5 h-5 ${active ? "text-white" : "text-current"}`} />}
      {children}
    </Link>
  );
}