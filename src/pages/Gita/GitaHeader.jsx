import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import WaveText from '../../components/WaveText';
const GitaHeader = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div>
      <nav
        className={`transition-all duration-300 ease-in-out flex justify-between items-center px-6 py-3 rounded-full 
        ${scrolled ? 'shadow-lg bg-[#FFFEF5]/90 backdrop-blur-md' : 'bg-[#FFFEF5]/80 backdrop-blur-sm'} 
        border border-black/5 w-full max-w-4xl ml-[350px] mt-6 mb-12`}
      >
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <span className="font-serif text-2xl font-bold text-[#051A12]">
            kiddos intellect.
          </span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex gap-8 font-medium text-gray-600 text-sm">
          <WaveText text="English" />
          <WaveText text="Hindi" />
          <WaveText text="Gujarati" />
        </div>

        {/* CTA Button */}
        <button className="bg-[#F59E0B] text-[#051A12] px-6 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 hover:scale-105 transition-transform">
          Buy Now <ArrowRight size={16} />
        </button>
      </nav>
    </div>
  );
};

export default GitaHeader;