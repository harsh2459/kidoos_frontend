import { Link, NavLink } from "react-router-dom";
import { useCart } from "../contexts/CartStore";
import { useSite } from "../contexts/SiteConfig";
import { useAuth } from "../contexts/Auth";

export default function Navbar() {
  const items = useCart(s => s.items);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const { site, visibility, loaded } = useSite();           // <-- loaded
  const { isAdmin, logout } = useAuth();

  const publicNav = visibility?.publicNav || ["catalog","theme","admin","cart"];

  const linkBase = "transition-colors px-1 py-0.5 text-sm font-medium hover:text-brand";
  const linkActive = "text-brand font-semibold border-b-2 border-brand";
  const linkInactive = "text-fg hover:text-brand";

  const renderItem = (id) => {
    if (id === "catalog") {
      return (
        <NavLink key="catalog" to="/catalog"
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
          Catalog
        </NavLink>
      );
    }
    if (id === "cart") {
      return (
        <NavLink key="cart" to="/cart"
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
          Cart <span className="ml-1 text-xs text-fg-subtle">({count})</span>
        </NavLink>
      );
    }
    return null;
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-surface/80 border-b border-border-subtle shadow-sm">
      <nav className="mx-auto max-w-container px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold flex items-center gap-2 text-fg">
          {site.logoUrl ? (
            <img src={site.logoUrl} alt="logo" className="h-10 w-auto object-contain" />
          ) : "Home"}
        </Link>

        {/* don’t flash links before settings load */}
        <div className="flex gap-6 items-center">
          {loaded && publicNav.map(renderItem)}
          {isAdmin && (
            <>
              <NavLink to="/admin/orders" className={({isActive}) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>Orders</NavLink>
              <NavLink to="/admin/setup" className={({isActive}) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>AddAdmin</NavLink>
              <NavLink to="/admin/homepage" className={({isActive}) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>Homepage</NavLink>
              <NavLink to="/admin/settings" className={({isActive}) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>Settings</NavLink>
              <NavLink to="/admin/payments" className={({isActive}) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>Payments</NavLink>
              <NavLink to="/admin/books" className={({isActive}) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>Books</NavLink>
              <NavLink to="/admin/add-book" className={({isActive}) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>Add Book</NavLink>
              <button onClick={logout} className="text-sm text-fg-subtle hover:text-danger transition-colors">Logout</button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
