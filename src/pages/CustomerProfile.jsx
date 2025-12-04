// src/pages/CustomerProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../contexts/CustomerAuth';
import { 
    User, ShoppingBag, ShoppingCart, BookOpen, LogOut, 
    Settings, Bell, Mail, Home, MapPin, Phone 
} from 'lucide-react';

const CustomerProfile = () => {
  const navigate = useNavigate();
  const customerContext = useCustomer();

  // Safe destructuring with fallbacks
  const customer = customerContext?.customer || null;
  const logout = customerContext?.logout || (() => { });

  const [loading, setLoading] = useState(true);

  // Background texture for the header
  const bgImage = "url('/images/terms-bg.png')";

  useEffect(() => {
    // Wait a bit for context to load
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [customer]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7F5]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#E3E8E5] border-t-[#1A3C34] rounded-full animate-spin"></div>
          <p className="text-[#5C756D]">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error if no customer data after loading
  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7F5]">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-sm border border-[#E3E8E5]">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#E8F0EB] flex items-center justify-center text-[#4A7C59]">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#1A3C34] mb-2">Profile Not Found</h2>
          <p className="text-[#5C756D] mb-6">Unable to load your profile. Please try logging in again.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-[#1A3C34] text-white rounded-xl hover:bg-[#2F523F] transition-all font-bold shadow-md"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F5] font-sans text-[#2C3E38] selection:bg-[#D4E2D4] selection:text-[#1A3C34]">
      
      {/* --- HERO HEADER --- */}
      <div className="relative w-full bg-[#1A3C34] overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 px-6">
        {/* Texture Overlay */}
        <div 
            className="absolute inset-0 z-0 pointer-events-none opacity-20 mix-blend-soft-light" 
            style={{
                backgroundImage: bgImage,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'grayscale(100%)' 
            }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent to-[#1A3C34]/90 pointer-events-none"></div>
      </div>

      {/* --- MAIN CONTENT (Overlapping Hero) --- */}
      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 -mt-20 md:-mt-24 relative z-10 pb-20">
        
        {/* PROFILE HEADER CARD */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#E3E8E5] p-6 md:p-10 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full bg-[#E8F0EB] border-4 border-white shadow-md flex items-center justify-center text-[#1A3C34] text-3xl font-serif font-bold">
                  {customer.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </div>

              {/* User Info */}
              <div>
                <h1 className="text-3xl font-serif font-bold text-[#1A3C34] mb-2">
                  {customer.name || 'Customer'}
                </h1>
                <div className="space-y-1">
                  <p className="text-[#5C756D] flex items-center gap-2 text-sm md:text-base">
                    <Mail className="w-4 h-4" />
                    {customer.email}
                  </p>
                  {customer.phone && (
                    <p className="text-[#5C756D] flex items-center gap-2 text-sm md:text-base">
                      <Phone className="w-4 h-4" />
                      {customer.phone}
                    </p>
                  )}
                </div>
                {customer.createdAt && (
                  <p className="text-xs text-[#8BA699] mt-3 uppercase tracking-wide font-medium">
                    Member since {new Date(customer.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 bg-white border border-[#DCE4E0] text-[#5C756D] rounded-xl hover:bg-[#FAFBF9] hover:text-[#1A3C34] hover:border-[#1A3C34] transition-all font-medium flex items-center justify-center gap-2 group"
              >
                <LogOut className="w-4 h-4 group-hover:text-red-500 transition-colors" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard 
            icon={ShoppingBag}
            title="Order History"
            desc="View past orders"
            onClick={() => navigate('/profile/orders')}
            color="green"
          />
          <DashboardCard 
            icon={ShoppingCart}
            title="Shopping Cart"
            desc="View current cart"
            onClick={() => navigate('/cart')}
            color="amber"
          />
          <DashboardCard 
            icon={BookOpen}
            title="Browse Catalog"
            desc="Discover new books"
            onClick={() => navigate('/catalog')}
            color="blue"
          />
          <DashboardCard 
            icon={Home}
            title="Go Home"
            desc="Back to homepage"
            onClick={() => navigate('/')}
            color="slate"
          />
        </div>

        {/* PREFERENCES SECTION */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E3E8E5] p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E3E8E5]">
            <div className="w-10 h-10 rounded-lg bg-[#E8F0EB] flex items-center justify-center text-[#1A3C34]">
                <Settings className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-serif font-bold text-[#1A3C34]">Preferences</h2>
          </div>
          
          <div className="space-y-4">
            {/* Marketing Emails */}
            <div className="flex items-center justify-between p-4 rounded-xl hover:bg-[#FAFBF9] transition-colors border border-transparent hover:border-[#E3E8E5]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Mail className="w-5 h-5" />
                </div>
                <div>
                    <span className="block text-[#1A3C34] font-bold text-sm md:text-base">Marketing Emails</span>
                    <span className="text-xs text-[#8BA699]">Receive updates about new books & offers</span>
                </div>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${customer.preferences?.marketingEmails
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
                }`}>
                {customer.preferences?.marketingEmails ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            {/* Cart Reminders */}
            <div className="flex items-center justify-between p-4 rounded-xl hover:bg-[#FAFBF9] transition-colors border border-transparent hover:border-[#E3E8E5]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                    <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                    <span className="block text-[#1A3C34] font-bold text-sm md:text-base">Cart Reminders</span>
                    <span className="text-xs text-[#8BA699]">Get notified about items left in cart</span>
                </div>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${customer.preferences?.cartReminders
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
                }`}>
                {customer.preferences?.cartReminders ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- Helper Component for Cards --- */
function DashboardCard({ icon: Icon, title, desc, onClick, color }) {
    // Color mapping for icons
    const colors = {
        green: "bg-[#E8F0EB] text-[#4A7C59] group-hover:bg-[#1A3C34] group-hover:text-white",
        amber: "bg-[#FFF9F0] text-[#8A6A4B] group-hover:bg-[#8A6A4B] group-hover:text-white",
        blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
        slate: "bg-slate-100 text-slate-600 group-hover:bg-slate-700 group-hover:text-white",
    };

    return (
        <button
            onClick={onClick}
            className="group bg-white p-6 rounded-2xl shadow-sm border border-[#E3E8E5] hover:border-[#4A7C59] hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-left w-full h-full"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${colors[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="w-8 h-8 rounded-full bg-[#FAFBF9] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                    <svg className="w-4 h-4 text-[#1A3C34]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
            <h3 className="text-lg font-bold text-[#1A3C34] mb-1 group-hover:text-[#4A7C59] transition-colors">{title}</h3>
            <p className="text-sm text-[#5C756D]">{desc}</p>
        </button>
    );
}

export default CustomerProfile;