import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './App.css';
import './styles/classic-light.css';

import { ThemeProvider } from './contexts/ThemeContext';
import { SiteProvider } from './contexts/SiteConfig';
import { AuthProvider } from './contexts/Auth';

import Navbar from './components/Navbar';
import Catalog from './pages/Catalog';
import BookDetail from './pages/BookDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AddBook from './pages/Admin/AddBook';
import AdminLogin from './pages/Admin/Login';
import Home from './pages/Home';
import SiteSettings from './pages/Admin/SiteSettings';
import HomepageAdmin from './pages/Admin/Homepage';
import PaymentsAdmin from './pages/Admin/Payments';
import AdminSetup from './pages/Admin/Setup';
import { AdminGuard, PageGate } from './components/RouteGuard';
import EditBook from './pages/Admin/EditBook';
import BooksAdmin from './pages/Admin/Books';
import AdminOrders from './pages/Admin/Orders';
import ApiUsers from './pages/Admin/ApiUsers';
import WhiteThemeDemo from './pages/WhiteThemeDemo';
import CustomerProvider, { useCustomer } from "./contexts/CustomerAuth";
import CustomerAuth from './pages/CustomerAuth';
import EmailSenders from './pages/Admin/EmailSenders';
import EmailTemplates from './pages/Admin/EmailTemplates';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout';


function InnerApp() {
  const loc = useLocation();
  const showFooter = loc.pathname === '/' || loc.pathname === '/catalog';

  function RequireCustomer({ children }) {
    const { isCustomer } = useCustomer();
    const here = useLocation();
    if (!isCustomer) return <Navigate to="/login" state={{ next: here.pathname }} replace />;
    return children;
  }

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          {/* customer auth */}
          <Route path="/login" element={<CustomerAuth />} />
          {/* public pages gated by Visibility */}
          <Route path="/" element={<PageGate page="home"><Home /></PageGate>} />
          <Route path="/catalog" element={<PageGate page="catalog"><Catalog /></PageGate>} />
          <Route
            path="/checkout"
            element={
              <RequireCustomer>
                <PageGate page="catalog"><Checkout /></PageGate>
              </RequireCustomer>
            }
          />
          <Route path="/white" element={<PageGate page="catalog"><WhiteThemeDemo /></PageGate>} />

          <Route path="/book/:slug" element={<BookDetail />} />
          <Route
            path="/cart"
            element={
              <RequireCustomer>
                <PageGate page="cart"><Cart /></PageGate>
              </RequireCustomer>
            }
          />

          {/* admin auth pages */}
          <Route path="/admin/login" element={<PageGate page="adminLogin"><AdminLogin /></PageGate>} />
          <Route path="/admin/setup" element={<AdminSetup />} />

          {/* admin-only */}
          <Route
            path="/admin/api-users"
            element={<AdminGuard><AdminLayout><ApiUsers /></AdminLayout></AdminGuard>}
          />
          <Route
            path="/admin/orders"
            element={<AdminGuard><AdminLayout><AdminOrders /></AdminLayout></AdminGuard>}
          />
          <Route
            path="/admin/books"
            element={<AdminGuard><AdminLayout><BooksAdmin /></AdminLayout></AdminGuard>}
          />
          <Route
            path="/admin/books/:slug/edit"
            element={<AdminGuard><AdminLayout><EditBook /></AdminLayout></AdminGuard>}
          />
          <Route
            path="/admin/settings"
            element={<AdminGuard><AdminLayout><SiteSettings /></AdminLayout></AdminGuard>}
          />
          <Route
            path="/admin/homepage"
            element={<AdminGuard><AdminLayout><HomepageAdmin /></AdminLayout></AdminGuard>}
          />
          <Route
            path="/admin/payments"
            element={<AdminGuard><AdminLayout><PaymentsAdmin /></AdminLayout></AdminGuard>}
          />
          <Route
            path="/admin/add-book"
            element={<AdminGuard><AdminLayout><AddBook /></AdminLayout></AdminGuard>}
          />
          <Route
            path="/admin/email-senders"
            element={<AdminGuard><AdminLayout><EmailSenders /></AdminLayout></AdminGuard>}
          />
          <Route
            path="/admin/email-templates"
            element={<AdminGuard><AdminLayout><EmailTemplates /></AdminLayout></AdminGuard>}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {showFooter && (
        <Footer
          contact={{
            email: "kiddosintellect@gmail.com",
            phone: "+91 98796 20138",
            hours: "Mon–Sat, 10am–6pm IST",
          }}
          links={[
            { label: "Privacy", href: "/privacy" },
            { label: "Returns", href: "/returns" },
            { label: "Shipping", href: "/shipping" },
          ]}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <SiteProvider>
      <AuthProvider>
        <CustomerProvider>
          <ThemeProvider>
            <BrowserRouter>
              <InnerApp />
              <ToastContainer
                position="top-right"
                autoClose={2500}
                hideProgressBar
                newestOnTop
                closeOnClick
                draggable
                pauseOnHover
                closeButton={false}
              />
            </BrowserRouter>
          </ThemeProvider>
        </CustomerProvider>
      </AuthProvider>
    </SiteProvider>
  );
}
