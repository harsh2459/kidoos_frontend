// src/components/AdminLayout.jsx
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <>
      <AdminSidebar />
      <div className="min-h-screen md:pl-64 bg-bg">
        {/* top spacer for your header if needed */}
        <div className="h-16" />
        <div className="p-4">{children}</div>
      </div>
    </>
  );
}
