// src/App.js
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
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

export default function App() {
  function RequireCustomer({ children }) {
    const { isCustomer } = useCustomer();
    const loc = useLocation();
    if (!isCustomer) return <Navigate to="/login" state={{ next: loc.pathname }} replace />;
    return children;
  }

  return (
    <SiteProvider>
      <AuthProvider> {/* admin */}
        <CustomerProvider> {/* customer */}
          <ThemeProvider>
            <BrowserRouter>
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
                    element={<RequireCustomer><PageGate page="catalog"><Checkout /></PageGate></RequireCustomer>}
                  />
                  <Route path="/white" element={<PageGate page="catalog"><WhiteThemeDemo /></PageGate>} />

                  <Route path="/book/:slug" element={<BookDetail />} />
                  <Route path="/cart" element={<PageGate page="cart"><Cart /></PageGate>} />

                  {/* admin auth pages */}
                  <Route path="/admin/login" element={<PageGate page="adminLogin"><AdminLogin /></PageGate>} />
                  <Route path="/admin/setup" element={<AdminSetup />} />

                  {/* admin-only */}
                  <Route path="/admin/api-users" element={<AdminGuard><ApiUsers /></AdminGuard>} />
                  <Route path="/admin/orders" element={<AdminGuard><AdminOrders /></AdminGuard>} />
                  <Route path="/admin/books" element={<AdminGuard><BooksAdmin /></AdminGuard>} />
                  <Route path="/admin/books/:slug/edit" element={<AdminGuard><EditBook /></AdminGuard>} />
                  <Route path="/admin/settings" element={<AdminGuard><SiteSettings /></AdminGuard>} />
                  <Route path="/admin/homepage" element={<AdminGuard><HomepageAdmin /></AdminGuard>} />
                  <Route path="/admin/payments" element={<AdminGuard><PaymentsAdmin /></AdminGuard>} />
                  <Route path="/admin/add-book" element={<AdminGuard><AddBook /></AdminGuard>} />
                  <Route path="/admin/email-senders" element={<AdminGuard><EmailSenders /></AdminGuard>} />
                  <Route path="/admin/email-templates" element={<AdminGuard><EmailTemplates /></AdminGuard>} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
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
            </BrowserRouter>
          </ThemeProvider>
        </CustomerProvider>
      </AuthProvider>
    </SiteProvider>
  );
}
