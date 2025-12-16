import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Sparkles, Globe, ShoppingBag, ArrowRight, Check } from 'lucide-react';

// --- CONFIGURATION ---
const THEME = {
  bg: '#0f172a',      // Dark slate (Modern background)
  text: '#f8fafc',    // White text
  accent: '#FACC15',  // Bright Yellow (Like your reference image)
  secondary: '#334155' // Slate grey
};

const LANGUAGES = [
  { id: 'eng', label: 'ENG', title: "Animations.dev Style", sub: "Interactive 3D Book" },
  { id: 'hin', label: 'HIN', title: "हिंदी संस्करण", sub: "बच्चों के लिए गीता" },
  { id: 'guj', label: 'GUJ', title: "ગુજરાતી આવૃત્તિ", sub: "જીવન માટે માર્ગદર્શન" }
];

export default function ScrollyTellingGita() {
  const [lang, setLang] = useState(LANGUAGES[0]);
  const containerRef = useRef(null);
  
  // Track scroll progress of the entire container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth the scroll physics
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // --- 3D TRANSFORMATIONS ---
  // 1. Rotation: Closed (-15deg) -> Open Flat (-90deg) -> Floating (-15deg)
  const rotateY = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [-15, -180, -180, -15]);
  const rotateX = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 10, -10, 0]);
  const zPosition = useTransform(smoothProgress, [0, 0.5, 1], [0, 50, 0]);
  const scale = useTransform(smoothProgress, [0, 0.1, 1], [1, 0.8, 1]);

  return (
    <div ref={containerRef} className="relative w-full bg-slate-900 text-white font-sans selection:bg-yellow-400 selection:text-black">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center backdrop-blur-md border-b border-white/10">
        <span className="font-bold text-xl tracking-tight text-yellow-400">GITA.KIDS</span>
        <div className="flex gap-2 bg-white/10 rounded-full p-1">
          {LANGUAGES.map((l) => (
            <button
              key={l.id}
              onClick={() => setLang(l)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${lang.id === l.id ? 'bg-yellow-400 text-black shadow-lg' : 'text-white/60 hover:text-white'}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </nav>

      {/* --- SCROLL CONTAINER (400vh Height) --- */}
      <div className="relative h-[400vh]">
        
        {/* --- STICKY CENTER STAGE (The Book) --- */}
        <div className="sticky top-0 h-screen w-full flex items-center justify-center perspective-1000 overflow-hidden">
          
          {/* Ambient Glow behind book */}
          <div className="absolute w-[500px] h-[500px] bg-yellow-500/20 rounded-full blur-[120px] pointer-events-none" />

          {/* THE 3D BOOK */}
          <motion.div
            style={{ 
              rotateY, 
              rotateX, 
              z: zPosition,
              scale,
              transformStyle: 'preserve-3d'
            }}
            className="relative w-[280px] h-[400px] md:w-[320px] md:h-[460px] cursor-pointer"
          >
            {/* FRONT COVER (Yellow) */}
            <div 
              className="absolute inset-0 bg-yellow-400 rounded-r-lg shadow-2xl flex flex-col justify-between p-8 text-black border-l-2 border-yellow-600/20"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="flex justify-between items-start opacity-50">
                <Globe size={24} />
                <span className="font-bold text-xs tracking-widest border border-black px-2 py-1 rounded-full">VOL. 1</span>
              </div>
              
              <div>
                <h1 className="text-4xl font-bold tracking-tighter leading-none mb-2">{lang.title}</h1>
                <p className="font-medium opacity-70">{lang.sub}</p>
              </div>

              <div className="w-full h-1 bg-black/10 rounded-full mt-auto" />
              
              {/* Gloss Reflection */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent rounded-r-lg pointer-events-none" />
            </div>

            {/* SPINE (Darker Yellow) */}
            <div 
              className="absolute left-0 top-1 bottom-1 w-[40px] bg-yellow-600 rounded-l-sm origin-left flex items-center justify-center"
              style={{ transform: 'rotateY(-90deg) translateX(-40px)' }}
            >
               <span className="text-black/50 font-bold text-xs tracking-widest transform rotate-90 whitespace-nowrap">BHAGAVAD GITA</span>
            </div>

            {/* BACK COVER (Dark) */}
            <div 
              className="absolute inset-0 bg-slate-800 rounded-l-lg border-r-2 border-white/10 flex items-center justify-center"
              style={{ transform: 'translateZ(-40px) rotateY(180deg)' }}
            >
               <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center">
                 <Sparkles className="text-yellow-400" />
               </div>
            </div>

            {/* PAGES (White block) */}
            <div 
              className="absolute right-2 top-2 bottom-2 w-[36px] bg-white transform rotate-y-90 translate-z"
              style={{ transform: 'rotateY(-90deg) translateZ(155px)', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)' }}
            >
              {/* Page lines effect */}
              <div className="w-full h-full" style={{ backgroundImage: 'repeating-linear-gradient(to right, #ccc 0px, #ccc 1px, transparent 1px, transparent 4px)' }} />
            </div>

          </motion.div>
        </div>

        {/* --- SCROLLING TEXT ZONES (These pass over the book) --- */}
        <div className="absolute top-0 left-0 w-full pointer-events-none z-10">
          
          {/* SECTION 1: HERO */}
          <div className="h-screen flex items-center justify-center text-center px-4">
             <motion.div 
               initial={{ opacity: 0, y: 50 }} 
               whileInView={{ opacity: 1, y: 0 }} 
               className="bg-slate-900/80 backdrop-blur-md p-8 rounded-3xl border border-white/10 max-w-2xl pointer-events-auto"
             >
                <span className="text-yellow-400 font-bold tracking-widest text-sm mb-4 block">SCROLL DOWN TO OPEN</span>
                <h2 className="text-5xl font-bold mb-6">Values for a New Generation</h2>
                <p className="text-lg text-slate-300">A timeless journey through the Gita, designed for modern kids.</p>
             </motion.div>
          </div>

          {/* SECTION 2: LEFT ALIGNED */}
          <div className="h-screen flex items-center justify-start px-8 md:px-32">
             <div className="max-w-md bg-slate-900/90 backdrop-blur-md p-8 rounded-2xl border border-white/10 pointer-events-auto shadow-2xl transform transition-transform hover:scale-105">
                <span className="text-6xl font-bold text-white/10 absolute -top-10 -left-4">01</span>
                <h3 className="text-3xl font-bold text-yellow-400 mb-4">Confusion & Clarity</h3>
                <p className="text-slate-300 leading-relaxed mb-6">
                   Just like Arjuna, every child faces tough choices. This book teaches them how to pause, breathe, and choose wisely.
                </p>
                <div className="flex gap-2">
                   <span className="px-3 py-1 bg-white/10 rounded-full text-xs">Decision Making</span>
                   <span className="px-3 py-1 bg-white/10 rounded-full text-xs">Focus</span>
                </div>
             </div>
          </div>

          {/* SECTION 3: RIGHT ALIGNED */}
          <div className="h-screen flex items-center justify-end px-8 md:px-32">
             <div className="max-w-md bg-slate-900/90 backdrop-blur-md p-8 rounded-2xl border border-white/10 pointer-events-auto shadow-2xl transform transition-transform hover:scale-105">
                <span className="text-6xl font-bold text-white/10 absolute -top-10 -right-4">02</span>
                <h3 className="text-3xl font-bold text-yellow-400 mb-4">A Friend, Not a Boss</h3>
                <p className="text-slate-300 leading-relaxed mb-6">
                   Krishna doesn't order; He explains. We portray God as a best friend who guides you, making spirituality approachable.
                </p>
                <div className="flex gap-2">
                   <span className="px-3 py-1 bg-white/10 rounded-full text-xs">Friendship</span>
                   <span className="px-3 py-1 bg-white/10 rounded-full text-xs">Trust</span>
                </div>
             </div>
          </div>

          {/* SECTION 4: CENTER FINAL CTA */}
          <div className="h-[80vh] flex items-center justify-center px-4">
             <div className="text-center bg-yellow-400 text-black p-12 rounded-[3rem] max-w-3xl pointer-events-auto shadow-[0_0_100px_rgba(250,204,21,0.4)]">
                <h2 className="text-4xl md:text-6xl font-bold mb-6">Start the Journey.</h2>
                <p className="text-xl opacity-80 mb-8 max-w-xl mx-auto">Get the complete bundle in English, Hindi, and Gujarati today.</p>
                <button className="bg-black text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform flex items-center gap-3 mx-auto">
                   <ShoppingBag size={20} />
                   Buy Bundle - ₹799
                </button>
                <div className="mt-6 flex justify-center gap-6 opacity-60 text-sm font-medium">
                   <span className="flex items-center gap-1"><Check size={14}/> Free Shipping</span>
                   <span className="flex items-center gap-1"><Check size={14}/> 5-Star Rated</span>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}