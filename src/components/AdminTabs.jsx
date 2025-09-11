// frontend/src/components/AdminTabs.jsx
import { NavLink } from "react-router-dom";

export default function AdminTabs(){
  const link = "px-3 py-2 rounded-theme hover:bg-white/10";
  return (
    <div className="flex gap-2 mb-4 overflow-x-auto">
      <NavLink to="/admin/orders" className={link}>Orders</NavLink>
      <NavLink to="/admin/api-users" className={link}>API Users</NavLink>
    </div>
  );
}
