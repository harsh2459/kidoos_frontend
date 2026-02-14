import { NavLink } from "react-router-dom";
import { 
  Package, 
  Users, 
  Mail, 
  CreditCard, 
  Target, 
  BookOpen, 
  Settings, 
  LayoutTemplate, 
  Sparkles
} from "lucide-react";

export default function AdminTabs() {
  // Configuration for tabs to keep JSX clean and maintainable
  const tabs = [
    { path: "/admin/orders", label: "Orders", icon: Package },
    { path: "/admin/api-users", label: "API Users", icon: Users },
    { path: "/admin/email-senders", label: "Senders", icon: Mail },
    { path: "/admin/email-templates", label: "Templates", icon: LayoutTemplate },
    { path: "/admin/payments", label: "Payments", icon: CreditCard },
    { path: "/admin/settings/popup", label: "Popups", icon: Target },
    { path: "/admin/books", label: "Books", icon: BookOpen },
    { path: "/admin/setup", label: "Setup", icon: Settings },
    { path: "/admin/settings/ai", label: "AI Config", icon: Sparkles },
  ];

  const baseClass = "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap border";
  
  // Style: Deep Green background for active, Ghost/Subtle for inactive (matching Navbar logic)
  const activeClass = "bg-[#384959] text-white border-[#384959] shadow-md transform scale-[1.02]";
  const inactiveClass = "bg-white text-[#5C756D] border-[#E3E8E5] hover:border-[#384959] hover:text-[#384959] hover:bg-[#F4F7F5]";

  return (
    // Container aligned with Navbar's responsive padding
    <div className="w-full bg-white border-b border-[#E3E8E5] mb-6 sticky top-[72px] z-40 shadow-sm">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 2xl:px-12 max-w-7xl 2xl:max-w-[1800px]">
        <nav className="flex items-center gap-3 overflow-x-auto py-4 no-scrollbar mask-gradient">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) => 
                `${baseClass} ${isActive ? activeClass : inactiveClass}`
              }
            >
              {/* Icon rendering with size matching Navbar icons */}
              <tab.icon className={`w-4 h-4 ${tab.label === "Popups" ? "text-current" : ""}`} />
              <span>{tab.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}