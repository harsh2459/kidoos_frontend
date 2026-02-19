import React, { lazy, Suspense } from 'react';
import "react-toastify/dist/ReactToastify.css";
import './App.css';
import './styles/classic-light.css';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './contexts/ThemeContext';
import { SiteProvider } from './contexts/SiteConfig';
import { AuthProvider } from './contexts/Auth';
import CustomerProvider, { useCustomer } from "./contexts/CustomerAuth";
import { useCartCleanup } from './hooks/useCartCleanup';

// Components that are always needed (keep as static imports)
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AdminGuard, PageGate } from './components/RouteGuard';
import AdminLayout from './components/AdminLayout';
import DynamicPopup from './components/DynamicPopup';
import LoadingFallback from './components/LoadingFallback';

// Lazy load all page components
const Home = lazy(() => import('./pages/Home'));
const Catalog = lazy(() => import('./pages/Catalog'));
const BookDetail = lazy(() => import('./pages/BookDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const CustomerAuth = lazy(() => import('./pages/CustomerAuth'));
const CustomerProfile = lazy(() => import('./pages/CustomerProfile'));
const OrderHistory = lazy(() => import('./pages/OrderHistory'));
const Invoice = lazy(() => import('./pages/Invoice'));

// Policy pages
const AboutUs = lazy(() => import('./pages/AboutUs'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy'));
const TermsAndConditions = lazy(() => import('./pages/Terms&Conditions'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const FAQ = lazy(() => import('./pages/FAQ'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const PreSchool = lazy(() => import('./pages/PreSchool'));

// Experimental/Demo pages (lazy load to reduce main bundle)
const GitaHome = lazy(() => import('./pages/Gita/GitaHome'));
const GitaShowcase1 = lazy(() => import('./pages/gita-deepseek/GitaShowcase'));
const Hero = lazy(() => import('./pages/parallax/Hero'));
const HeroSection = lazy(() => import('./pages/gita_showcash/HeroSection'));
const ScrollVideo = lazy(() => import('./pages/scroll_video/ScrollVideo'));
const Portal = lazy(() => import('./pages/Vrindavan/Portal'));
const UnderwaterVrindavan = lazy(() => import('./pages/Vrindavan/UnderwaterVrindavan'));

// Admin pages (lazy load separately - rarely accessed)
const AdminLogin = lazy(() => import('./pages/Admin/Login'));
const AdminSetup = lazy(() => import('./pages/Admin/Setup'));
const Dashboard = lazy(() => import('./pages/Admin/Dashboard'));
const AddBook = lazy(() => import('./pages/Admin/AddBook'));
const EditBook = lazy(() => import('./pages/Admin/EditBook'));
const BooksAdmin = lazy(() => import('./pages/Admin/Books'));
const AdminOrders = lazy(() => import('./pages/Admin/Orders'));
const SiteSettings = lazy(() => import('./pages/Admin/SiteSettings'));
const HomepageAdmin = lazy(() => import('./pages/Admin/Homepage'));
const PaymentsAdmin = lazy(() => import('./pages/Admin/Payments'));
const CatalogSettings = lazy(() => import('./pages/Admin/CatalogSettings'));
const ApiUsers = lazy(() => import('./pages/Admin/ApiUsers'));
const EmailSenders = lazy(() => import('./pages/Admin/EmailSenders'));
const EmailTemplates = lazy(() => import('./pages/Admin/EmailTemplates'));
const AdminCategories = lazy(() => import('./pages/Admin/Categories'));
const PopupSettings = lazy(() => import('./pages/Admin/PopupSettings'));
const AiSettings = lazy(() => import('./pages/Admin/AiSettings'));

function InnerApp() {
  const loc = useLocation();
  const showFooter = loc.pathname === '/' || loc.pathname === '/catalog' || loc.pathname === '/aboutus' || loc.pathname === '/privacy' || loc.pathname === '/shipping' || loc.pathname === '/terms' || loc.pathname === '/refund' || loc.pathname === '/faq' || loc.pathname === '/contact' || loc.pathname === '/PreSchool';
  const hideNavbarRoutes = ['/intro', '/gita', '/scroll', '/j', '/water-1'];
  const showNavbar = !hideNavbarRoutes.includes(loc.pathname);
  const isAdminRoute = loc.pathname.startsWith('/admin');

  const getPageName = () => {
    if (loc.pathname === '/') return 'home';
    if (loc.pathname === '/catalog') return 'products';
    if (loc.pathname === '/cart') return 'cart';
    return 'all';
  };

  function RequireCustomer({ children }) {
    const { isCustomer } = useCustomer();
    const here = useLocation();
    if (!isCustomer) return <Navigate to="/login" state={{ next: here.pathname }} replace />;
    return children;
  }

  return (
    <>
      {showNavbar && <Navbar />}
      <main>
        {!isAdminRoute && <DynamicPopup page={getPageName()} />}
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* customer auth */}
            <Route path="/login" element={<CustomerAuth />} />
            {/* public pages gated by Visibility */}
            <Route path="/" element={<PageGate page="home"><Home /></PageGate>} />
            <Route path="/catalog" element={<PageGate page="catalog"><Catalog /></PageGate>} />
            <Route path="/aboutus" element={<PageGate page="aboutus"><AboutUs /></PageGate>} />
            <Route path="/preschool" element={<PageGate page="preschool"><PreSchool /></PageGate>} />
            <Route path="/invoice/:id" element={<Invoice />} />
            <Route path="/gita1" element={<GitaHome />} />
            <Route path="/1" element={<GitaShowcase1 />} />
            <Route path="/Sacred Stories" element={<Hero />} />
            <Route path="/gita" element={<HeroSection />} />
            <Route path="/scroll" element={<ScrollVideo />} />
            <Route path="/j" element={<Portal />} />
            <Route path="/water-1" element={<UnderwaterVrindavan />} />
            <Route path="/profile" element={<RequireCustomer><CustomerProfile /></RequireCustomer>} />
            <Route
              path="/profile/orders"
              element={
                <RequireCustomer>
                  <OrderHistory />
                </RequireCustomer>
              }
            />
            <Route
              path="/checkout"
              element={
                <PageGate page="catalog"><Checkout /></PageGate>
              }
            />
            <Route path="/book/:slug" element={<BookDetail />} />
            <Route
              path="/cart"
              element={
                <RequireCustomer>
                  <PageGate page="cart"><Cart /></PageGate>
                </RequireCustomer>
              }
            />

            {/* others */}
            <Route path="/faq" element={<PageGate page="faq"><FAQ /></PageGate>} />
            <Route path="/contact" element={<PageGate page="contact"><ContactUs /></PageGate>} />

            {/* Policy */}
            <Route path='/privacy' element={<PrivacyPolicy />} />
            <Route path='/shipping' element={<ShippingPolicy />} />
            <Route path='/terms' element={<TermsAndConditions />} />
            <Route path='/refund' element={<RefundPolicy />} />

            {/* admin auth pages */}
            <Route path="/admin/login" element={<PageGate page="adminLogin"><AdminLogin /></PageGate>} />
            <Route path="/admin/setup" element={<AdminSetup />} />

            {/* admin-only */}
            <Route
              path="/admin/api-users"
              element={<AdminGuard><AdminLayout><ApiUsers /></AdminLayout></AdminGuard>}
            />
            <Route
              path="/admin/dashboard"
              element={<AdminGuard><AdminLayout><Dashboard /></AdminLayout></AdminGuard>}
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
              path="/admin/catalog"
              element={<AdminGuard><AdminLayout><CatalogSettings /></AdminLayout></AdminGuard>}
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
            <Route
              path="/admin/categories"
              element={<AdminGuard><AdminLayout><AdminCategories /></AdminLayout></AdminGuard>}
            />
            <Route
              path="/admin/settings/popup"
              element={<AdminGuard><AdminLayout><PopupSettings /></AdminLayout></AdminGuard>}
            />
            <Route
              path="/admin/ai-settings"
              element={<AdminGuard><AdminLayout><AiSettings /></AdminLayout></AdminGuard>}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {
        showFooter && (
          <Footer
            contact={{
              email: "kiddosintellect@gmail.com",
              phone: "+91 98798 57529",
              hours: "Mon–Sat, 10am–6pm IST",
            }}
            links={[
              { label: "Privacy", href: "/privacy" },
              { label: "Returns", href: "/returns" },
              { label: "Shipping", href: "/shipping" },
            ]}
          />
        )
      }
    </>
  );
}

export default function App() {
  useCartCleanup();
  return (
    <HelmetProvider>
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
    </HelmetProvider>
  );
}