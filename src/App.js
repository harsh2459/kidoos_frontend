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
import CustomerProvider, { useCustomer } from "./contexts/CustomerAuth";
import CustomerAuth from './pages/CustomerAuth';
import EmailSenders from './pages/Admin/EmailSenders';
import EmailTemplates from './pages/Admin/EmailTemplates';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout';
import AboutUs from './pages/AboutUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ShippingPolicy from './pages/ShippingPolicy';
import TermsAndConditions from './pages/Terms&Conditions';
import RefundPolicy from './pages/RefundPolicy';
import FAQ from './pages/FAQ';
import ContactUs from './pages/ContactUs';
import CustomerProfile from './pages/CustomerProfile';
import OrderHistory from './pages/OrderHistory';
import AdminCategories from './pages/Admin/Categories';
import DynamicPopup from './components/DynamicPopup';
import PopupSettings from './pages/Admin/PopupSettings';
import PreSchool from './pages/PreSchool';
import { useCartCleanup } from './hooks/useCartCleanup';
import Invoice from './pages/Invoice';
import GitaHome from './pages/Gita/GitaHome';
import CatalogSettings from './pages/Admin/CatalogSettings';
import GitaShowcase1 from './pages/gita-deepseek/GitaShowcase';
import HeroVrindavan from './pages/parallax/HeroVrindavan';
import Hero from './pages/parallax/Hero';
import HeroSection from './pages/gita_showcash/HeroSection';
import ScrollVideo from './pages/scroll_video/ScrollVideo';
import CustomCursor from './components/CustomCursor';
import AiSettings from './pages/Admin/AiSettings';


function InnerApp() {
  const loc = useLocation();
  const showFooter = loc.pathname === '/' || loc.pathname === '/catalog' || loc.pathname === '/aboutus' || loc.pathname === '/privacy' || loc.pathname === '/shipping' || loc.pathname === '/terms' || loc.pathname === '/refund' || loc.pathname === '/faq' || loc.pathname === '/contact' || loc.pathname === '/PreSchool';
  const hideNavbarRoutes = ['/intro' ,'/gita' ,'/scroll'];
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
        <CustomCursor />
        {!isAdminRoute && <DynamicPopup page={getPageName()} />}
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
          <Route path="/intro" element={<Hero />} />
          <Route path="/gita" element={<HeroSection />} />
          <Route path="/scroll" element={<ScrollVideo />} />
          <Route
            path="/profile"
            element={
              <RequireCustomer>
                <CustomerProfile />
              </RequireCustomer>
            }
          />
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
              <RequireCustomer>
                <PageGate page="catalog"><Checkout /></PageGate>
              </RequireCustomer>
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
            path="/admin/settings/ai"
            element={<AdminGuard><AdminLayout><AiSettings /></AdminLayout></AdminGuard>}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes >
      </main >
      
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
