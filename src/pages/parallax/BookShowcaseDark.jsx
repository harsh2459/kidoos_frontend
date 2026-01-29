import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, Layers, ShieldCheck, Globe, ArrowRight, Feather, Star, Link } from 'lucide-react';
import Testimonials from './Testimonials';
import Faq from './Faq';

// --- ASSETS (Using Public Folder Strings) ---
const BOOK_ENG = "/images/3d-english.png";
const BOOK_HIN = "/images/3d_hindi.png";
const BOOK_GUJ = "/images/3d_gujarati.png";
const ART_BG = "/images/art-bg.png";

gsap.registerPlugin(ScrollTrigger);

// --- 1. HERO SECTION ---
const HeroSection = () => {
  const containerRef = useRef(null);
  const textRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(textRef.current, {
        yPercent: -30,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen flex flex-col items-center justify-center bg-[#F5F5F7] overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-orange-200/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-blue-200/30 rounded-full blur-[120px] pointer-events-none" />

      <div ref={textRef} className="relative z-10 text-center px-6 max-w-5xl mx-auto mt-[-5vh]">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-8">
          <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
          <span className="text-xs font-bold tracking-widest uppercase text-gray-500">#1 Best Seller for Kids</span>
        </div>
        <h1 className="text-6xl md:text-9xl font-bold tracking-tighter text-[#1d1d1f] leading-[0.9] mb-8">
          Wisdom, <br />
          <span className="text-gray-400">Simplified.</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto font-medium leading-relaxed mb-10">
          The Bhagavad Gita reimagined for the modern child. <br className="hidden md:block" />
          No jargon. Just epic stories and life lessons.
        </p>
        <a href="/catalog">
          <button className="px-10 py-4 bg-[#1d1d1f] text-white rounded-full font-semibold text-lg hover:scale-105 transition-transform duration-300 shadow-xl shadow-black/10">
            Buy the Collection
          </button>
        </a>
      </div>
    </section>
  );
};

// --- 2. SMOOTH SCROLL SHOWCASE (Fixed: No Stacking) ---
const FeatureSection = ({ id, book, bg, pill, title, subtitle, desc, align = "right" }) => {
  return (
    <section className={`relative py-32 w-full overflow-hidden ${bg}`}>
      <div className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <div className={`space-y-8 ${align === "left" ? "lg:order-2" : "lg:order-1"}`}>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest ${pill}`}>
            <Globe className="w-3 h-3" />
            {subtitle}
          </div>
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-[#1d1d1f] leading-[1]">
            {title}
          </h2>
          <p className="text-xl text-gray-500 leading-relaxed max-w-md font-medium">
            {desc}
          </p>
        </div>

        {/* Image */}
        <div className={`flex justify-center relative ${align === "left" ? "lg:order-1 lg:justify-start" : "lg:order-2 lg:justify-end"}`}>
          <img
            src={book}
            alt={title}
            className="relative w-[300px] md:w-[450px] object-contain drop-shadow-2xl transition-transform duration-700 hover:scale-[1.02]"
          />
        </div>
      </div>
    </section>
  )
}

// --- 3. PREMIUM BENTO GRID (Tight, Dark Mode) ---
const PremiumBentoGrid = () => {
  return (
    <section className="py-32 px-4 md:px-6 bg-white">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-bold text-[#1d1d1f] tracking-tight mb-6">
            Everything a parent wants. <br />
            <span className="text-gray-400">Everything a child needs.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-auto md:h-[600px]">
          {/* CARD 1: HERO */}
          <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-[2rem] bg-[#1d1d1f] text-white p-8 md:p-12 flex flex-col justify-between shadow-2xl shadow-gray-200">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 backdrop-blur-md">
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-3xl font-bold mb-4">Visual Storytelling</h3>
              <p className="text-gray-400 text-lg leading-relaxed max-w-sm">
                90+ hand-crafted illustrations that don't just decorate, they explain. We use a vibrant art style to bring Kurukshetra to life.
              </p>
            </div>
            <div className="absolute right-[-20%] bottom-[-20%] w-[80%] h-[80%] bg-gradient-to-tl from-purple-500/30 to-transparent rounded-full blur-3xl pointer-events-none" />
            <button className="mt-8 w-fit flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:gap-4 transition-all text-white/80 hover:text-white">
              See Inside <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* CARD 2: MATERIAL */}
          <div className="md:col-span-1 md:row-span-1 rounded-[2rem] bg-[#F5F5F7] p-8 hover:bg-[#ebebeb] transition-colors duration-300 flex flex-col justify-between">
            <div>
              <Layers className="w-8 h-8 text-[#1d1d1f] mb-4 opacity-80" />
              <h3 className="text-xl font-bold text-[#1d1d1f] mb-2">Premium Paper</h3>
              <p className="text-gray-500 text-sm leading-relaxed">120gsm matte finish. Easy on the eyes.</p>
            </div>
          </div>

          {/* CARD 3: ARTWORK (Using Art BG) */}
          <div className="md:col-span-1 md:row-span-2 rounded-[2rem] relative overflow-hidden group shadow-lg">
            <div className="absolute inset-0 bg-gray-900/20 group-hover:bg-gray-900/0 transition-colors z-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 z-20" />
            <img
              src={ART_BG}
              alt="Vrindavan Art"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="relative z-30 p-8 h-full flex flex-col justify-end text-white">
              <Feather className="w-8 h-8 mb-4 text-orange-300" />
              <h3 className="text-xl font-bold mb-2">Vedic Roots</h3>
              <p className="text-white/80 text-sm">Authentic values tailored for 2024.</p>
            </div>
          </div>

          {/* CARD 4: EXPERT VETTED */}
          <div className="md:col-span-1 md:row-span-1 rounded-[2rem] bg-[#FFFBF0] border border-orange-100 p-8 hover:border-orange-200 transition-colors duration-300 flex flex-col justify-between">
            <div>
              <ShieldCheck className="w-8 h-8 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold text-[#1d1d1f] mb-2">Expert Vetted</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Child psychologist approved.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- MAIN COMPONENT ---
const BookShowcaseDark = () => {
  return (
    <div className="w-full bg-white min-h-screen font-sans selection:bg-orange-100 selection:text-orange-900">
      <HeroSection />

      {/* Scroll Sections (No Stacking) */}
      <FeatureSection
        id="eng" book={BOOK_ENG} bg="bg-white" pill="bg-blue-50 text-blue-700"
        title="Universal Wisdom" subtitle="English Edition"
        desc="We stripped away the archaic language. What remains is a gripping narrative that speaks directly to a child's curiosity."
      />
      <FeatureSection
        id="hin" book={BOOK_HIN} bg="bg-[#FDF6F0]" pill="bg-orange-100 text-orange-700" align="left"
        title="Roots & Tradition" subtitle="Hindi Edition"
        desc="Preserving the poetic beauty of the original Sanskrit while remaining accessible. A bridge to their cultural identity."
      />
      <FeatureSection
        id="guj" book={BOOK_GUJ} bg="bg-[#F0F4F8]" pill="bg-teal-100 text-teal-700"
        title="Cultural Heritage" subtitle="Gujarati Edition"
        desc="Bringing the warmth of home to the battlefield of Kurukshetra. Ensures the message of Karma resonates in their mother tongue."
      />

      <PremiumBentoGrid />
      <Testimonials />
      <Faq />
    </div>
  );
};

export default BookShowcaseDark;