import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../contexts/CustomerAuth';
import { 
    User, ShoppingBag, ShoppingCart, BookOpen, LogOut, 
    Settings, Bell, Mail, Home, MapPin, Phone, Edit2, Sparkles 
} from 'lucide-react';

const CustomerProfile = () => {
  const navigate = useNavigate();
  const customerContext = useCustomer();

  // Safe destructuring with fallbacks
  const customer = customerContext?.customer || null;
  const logout = customerContext?.logout || (() => { });

  const [loading, setLoading] = useState(true);

  // --- VRINDAVAN THEME ASSETS ---
  const parchmentBg = "url('/images/homepage/parchment-bg.png')";
  const mandalaBg = "url('/images/homepage/mandala-bg.png')";

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF7F2] font-['Cinzel']">
        <div className="w-16 h-16 border-4 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin mb-4"></div>
        <p className="text-[#3E2723] animate-pulse font-bold tracking-widest">Entering Sanctuary...</p>
      </div>
    );
  }

  // Show error if no customer data after loading
  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] font-['Lato'] px-4">
        <div 
            className="fixed inset-0 pointer-events-none opacity-100 z-0" 
            style={{ backgroundImage: parchmentBg, backgroundSize: 'cover' }}
        />
        <div className="relative z-10 text-center max-w-md p-10 bg-white/90 backdrop-blur-md rounded-[2rem] shadow-[0_20px_50px_rgba(62,39,35,0.1)] border border-[#D4AF37]/30">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#FFF9E6] border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shadow-inner">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-['Cinzel'] font-bold text-[#3E2723] mb-3">Profile Not Found</h2>
          <p className="text-[#8A7A5E] mb-8 font-light">Unable to load your profile. Please try logging in again.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3 bg-gradient-to-r from-[#C59D5F] to-[#B0894C] text-white rounded-xl hover:from-[#D4AF37] hover:to-[#C59D5F] transition-all font-bold shadow-lg font-['Cinzel'] tracking-widest border border-[#D4AF37]"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-['Lato'] text-[#5C4A2E] selection:bg-[#F3E5AB] selection:text-[#3E2723]">
      
      {/* Global Background Texture */}
      <div 
          className="fixed inset-0 pointer-events-none opacity-100 z-0" 
          style={{ backgroundImage: parchmentBg, backgroundSize: 'cover', backgroundAttachment: 'fixed' }}
      />

      {/* --- HERO HEADER --- */}
      <div className="relative w-full bg-[#3E2723] overflow-hidden pt-28 pb-32 md:pt-36 md:pb-40 px-6 border-b border-[#D4AF37]/30">
        {/* Texture Overlay */}
        <div 
            className="absolute inset-0 z-0 pointer-events-none opacity-10 mix-blend-overlay" 
            style={{ backgroundImage: mandalaBg, backgroundSize: '400px' }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#3E2723]/90 to-[#3E2723] pointer-events-none"></div>
      </div>

      {/* --- MAIN CONTENT (Overlapping Hero) --- */}
      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 -mt-24 md:-mt-32 relative z-10 pb-20">
        
        {/* PROFILE HEADER CARD */}
        <div className="bg-white/90 backdrop-blur-md rounded-[2rem] shadow-[0_10px_40px_rgba(62,39,35,0.08)] border border-[#D4AF37]/30 p-6 md:p-10 mb-8 relative overflow-hidden">
          
          {/* Decorative Gold Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#C59D5F] via-[#D4AF37] to-[#B0894C]"></div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
              
              {/* Avatar */}
              <div className="relative group cursor-default">
                <div className="w-28 h-28 rounded-full bg-[#FFF9E6] border-4 border-white shadow-lg flex items-center justify-center text-[#D4AF37] text-4xl font-['Cinzel'] font-bold relative z-10 ring-1 ring-[#D4AF37]/20">
                  {customer.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                {/* Glow behind avatar */}
                <div className="absolute inset-0 bg-[#D4AF37] blur-2xl opacity-20 rounded-full group-hover:opacity-30 transition-opacity"></div>
              </div>

              {/* User Info */}
              <div className="pt-2">
                <h1 className="text-3xl md:text-4xl font-['Cinzel'] font-bold text-[#3E2723] mb-3 flex items-center gap-2 justify-center md:justify-start">
                  {customer.name || 'Customer'}
                  <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                </h1>
                <div className="space-y-1.5">
                  <p className="text-[#5C4A2E] flex items-center gap-2 text-sm md:text-base justify-center md:justify-start bg-[#FAF7F2] px-3 py-1 rounded-lg border border-[#D4AF37]/10 inline-flex">
                    <Mail className="w-4 h-4 text-[#B0894C]" />
                    {customer.email}
                  </p>
                  {customer.phone && (
                    <div className="flex justify-center md:justify-start">
                        <p className="text-[#5C4A2E] flex items-center gap-2 text-sm md:text-base bg-[#FAF7F2] px-3 py-1 rounded-lg border border-[#D4AF37]/10 inline-flex">
                        <Phone className="w-4 h-4 text-[#B0894C]" />
                        {customer.phone}
                        </p>
                    </div>
                  )}
                </div>
                {customer.createdAt && (
                  <p className="text-xs text-[#8A7A5E] mt-4 uppercase tracking-widest font-bold border-t border-[#D4AF37]/10 pt-3 inline-block">
                    Member since {new Date(customer.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <button
                onClick={handleLogout}
                className="px-8 py-3 bg-white border border-[#D4AF37]/30 text-[#8A7A5E] rounded-xl hover:bg-[#3E2723] hover:text-[#F3E5AB] hover:border-[#3E2723] transition-all font-bold flex items-center justify-center gap-2 group shadow-sm font-['Cinzel'] tracking-wide"
              >
                <LogOut className="w-4 h-4 group-hover:text-[#F3E5AB] transition-colors" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard 
            icon={ShoppingBag}
            title="My Orders"
            desc="Track your shipments"
            onClick={() => navigate('/profile/orders')}
            theme="gold"
          />
          <DashboardCard 
            icon={ShoppingCart}
            title="View Cart"
            desc="Items waiting for you"
            onClick={() => navigate('/cart')}
            theme="wood"
          />
          <DashboardCard 
            icon={BookOpen}
            title="Browse Books"
            desc="Discover new wisdom"
            onClick={() => navigate('/catalog')}
            theme="bronze"
          />
          <DashboardCard 
            icon={Home}
            title="Return Home"
            desc="Back to the beginning"
            onClick={() => navigate('/')}
            theme="earth"
          />
        </div>

        {/* PREFERENCES SECTION */}
        <div className="bg-white/90 backdrop-blur-md rounded-[2rem] shadow-sm border border-[#D4AF37]/20 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[#D4AF37]/10">
            <div className="w-10 h-10 rounded-xl bg-[#FFF9E6] flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/20 shadow-sm">
                <Settings className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-['Cinzel'] font-bold text-[#3E2723]">Preferences</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Marketing Emails */}
            <div className="flex items-center justify-between p-5 rounded-2xl hover:bg-[#FAF7F2] transition-colors border border-[#E3E8E5] hover:border-[#D4AF37]/30 group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#FFF9E6] flex items-center justify-center text-[#B0894C] group-hover:bg-[#D4AF37] group-hover:text-white transition-colors">
                    <Mail className="w-5 h-5" />
                </div>
                <div>
                    <span className="block text-[#3E2723] font-bold text-sm md:text-base font-['Cinzel']">Marketing Emails</span>
                    <span className="text-xs text-[#8A7A5E]">Updates on new arrivals</span>
                </div>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${customer.preferences?.marketingEmails
                  ? 'bg-[#3E2723] text-[#F3E5AB] border-[#3E2723]'
                  : 'bg-[#F4F4F4] text-[#8A7A5E] border-[#E0E0E0]'
                }`}>
                {customer.preferences?.marketingEmails ? 'On' : 'Off'}
              </span>
            </div>

            {/* Cart Reminders */}
            <div className="flex items-center justify-between p-5 rounded-2xl hover:bg-[#FAF7F2] transition-colors border border-[#E3E8E5] hover:border-[#D4AF37]/30 group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#FFF9E6] flex items-center justify-center text-[#B0894C] group-hover:bg-[#D4AF37] group-hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                </div>
                <div>
                    <span className="block text-[#3E2723] font-bold text-sm md:text-base font-['Cinzel']">Cart Reminders</span>
                    <span className="text-xs text-[#8A7A5E]">Notifications for items</span>
                </div>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${customer.preferences?.cartReminders
                  ? 'bg-[#3E2723] text-[#F3E5AB] border-[#3E2723]'
                  : 'bg-[#F4F4F4] text-[#8A7A5E] border-[#E0E0E0]'
                }`}>
                {customer.preferences?.cartReminders ? 'On' : 'Off'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- Helper Component for Cards --- */
function DashboardCard({ icon: Icon, title, desc, onClick, theme }) {
    // Theme mapping for Vrindavan Colors
    const themes = {
        gold: "bg-[#FFF9E6] text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-white border-[#D4AF37]/20",
        wood: "bg-[#FAF7F2] text-[#3E2723] group-hover:bg-[#3E2723] group-hover:text-[#F3E5AB] border-[#3E2723]/10",
        bronze: "bg-[#FFF5EB] text-[#B0894C] group-hover:bg-[#B0894C] group-hover:text-white border-[#B0894C]/20",
        earth: "bg-[#F4F4F4] text-[#8A7A5E] group-hover:bg-[#8A7A5E] group-hover:text-white border-[#8A7A5E]/20",
    };

    return (
        <button
            onClick={onClick}
            className="group bg-white p-6 rounded-2xl shadow-sm border border-[#E3E8E5] hover:border-[#D4AF37]/50 hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-left w-full h-full relative overflow-hidden"
        >
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 border ${themes[theme]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="w-8 h-8 rounded-full bg-[#FAF7F2] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 border border-[#D4AF37]/20">
                    <svg className="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
            <h3 className="text-lg font-bold text-[#3E2723] mb-1 group-hover:text-[#D4AF37] transition-colors font-['Cinzel'] relative z-10">{title}</h3>
            <p className="text-sm text-[#8A7A5E] relative z-10">{desc}</p>
            
            {/* Subtle texture on hover */}
            <div className="absolute inset-0 bg-[#FAF7F2] opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0"></div>
        </button>
    );
}

export default CustomerProfile;