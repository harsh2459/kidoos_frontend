import React from 'react';
import GitaHeader from './GitaHeader';
import GitaHero from './GitaHero';
import GitaBentoGrid from './GitaBentoGrid';
import GitaTestimonial from './GitaTestimonial';
import GitaFAQ from './GitaFAQ';
import GitaPricing from './GitaPricing';
import GitaVideoSection from './GitaVideoSection';
import GitaSpecs from './GitaSpecs';
const GitaHome = () => {
  return (
    <div className="min-h-screen bg-[#FFFEF5] text-[#0C120F]">
      <GitaHeader />

      <main>
        <GitaHero />
        <GitaVideoSection/>
        <GitaBentoGrid />
        <GitaTestimonial />
        <GitaFAQ/>
        <GitaPricing/>
        <GitaSpecs/>
      </main>

    </div>
  );
};

export default GitaHome;