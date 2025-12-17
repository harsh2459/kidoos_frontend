import React, { useState, useEffect } from 'react';
import { Star, Heart, Sparkles, BookOpen } from 'lucide-react';

// Wave Text Component
const WaveText = () => {
    const [hoveredTag, setHoveredTag] = useState(null);
    
    const tags = ['Focus', 'Confidence', 'Empathy', 'Decision Making', 'Roots', 'Culture'];
    
    return null; // This component is just for organization, actual rendering happens in the tags section
};

// PLACEHOLDER IMAGES FOR BACKGROUND GRID
const bgImages = [
    "/images/gita-inside-english-1.jpg",
    "/images/gita-inside-english-2.jpg",
    "/images/gita-inside-english-3.jpg",
    "/images/gita-inside-english-4.jpg",
    "/images/gita-inside-english-5.jpg",
    "/images/gita-inside-english-6.jpg",
    "/images/gita-inside-english-7.jpg",
    "/images/gita-inside-english-8.jpg",
    "/images/gita-inside-english-9.jpg",
    "/images/gita-inside-english-10.jpg",
];

const GitaHero = () => {
    const [scrollY, setScrollY] = useState(0);
    const [hoveredTag, setHoveredTag] = useState(null);

    useEffect(() => {
        const handleScroll = () => {
            requestAnimationFrame(() => {
                setScrollY(window.scrollY);
            });
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // --- IMPROVED SMOOTH ANIMATION LOGIC ---
    
    // Smooth easing function for more natural motion
    const easeInOutQuart = (t) => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    
    // 1. TEXT PHASE (0px to 450px): Smoother text exit with better easing
    const textProgress = Math.min(1, scrollY / 450);
    const textEased = easeInOutQuart(textProgress);

    const textOpacity = 1 - textEased; 
    const textScale = 1 - (textEased * 0.2);
    const textBlur = textEased * 12; // Reduced blur for smoother effect
    const textTranslateY = textEased * 30; // Slight upward movement

    // 2. BOOK ENTRANCE (150px to 650px): Overlaps with text for seamless transition
    const bookStartScroll = 150;
    const bookEntranceDuration = 500;
    const bookProgress = Math.max(0, Math.min(1, (scrollY - bookStartScroll) / bookEntranceDuration));
    const bookEased = easeOutCubic(bookProgress);

    const bookOpacity = bookEased;
    const bookScaleIn = 0.8 + (bookEased * 0.2); // 0.8 -> 1.0

    // 3. EXIT PHASE (700px to 1100px): Smoother book exit with better timing
    const exitStart = 700;
    const exitDuration = 400;
    const exitProgress = Math.max(0, Math.min(1, (scrollY - exitStart) / exitDuration));
    const exitEased = easeInOutQuart(exitProgress);
    
    // Smoother exit movements
    const bookExitTranslate = exitEased * -80; 
    const bookExitScale = 1 - (exitEased * 0.08); 
    const bookExitOpacity = 1 - (exitEased * 0.6);

    // Combine scales
    const finalBookScale = bookScaleIn * bookExitScale;

    // Background images with parallax
    const bgOpacity = bookOpacity * bookExitOpacity;
    const bgTranslate = bookExitTranslate * 0.3;

    // Grid entrance timing (synchronized with book exit)
    const gridStart = 750;
    const gridProgress = Math.max(0, Math.min(1, (scrollY - gridStart) / 350));
    const gridEased = easeOutCubic(gridProgress);
    const gridTranslateY = (1 - gridEased) * 40;
    const gridOpacity = 0.3 + (gridEased * 0.7);

    return (
        <div className="relative bg-[#FFFEF5]">
            
            {/* =========================================
                PART 1: HERO SECTION (Sticky Wrapper)
               ========================================= */}
            <div className="relative h-[160vh] w-full">
                
                <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center">

                    {/* --- BACKGROUND GLOW --- */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 flex items-center justify-center">
                        <div 
                            className="w-[80vw] h-[80vh] bg-gradient-to-b from-transparent via-gray-200/50 to-transparent blur-[120px] transition-opacity duration-700"
                            style={{ opacity: bgOpacity }}
                        ></div>
                    </div>

                    {/* --- TEXT LAYER (Fades Out) --- */}
                    <div 
                        className="absolute top-[20%] z-20 text-center px-6 will-change-transform"
                        style={{ 
                            opacity: textOpacity,
                            transform: `scale(${textScale}) translateY(${textTranslateY}px)`,
                            filter: `blur(${textBlur}px)`,
                            pointerEvents: textOpacity <= 0.1 ? 'none' : 'auto',
                            transition: 'opacity 0.1s ease-out, transform 0.1s ease-out, filter 0.1s ease-out'
                        }}
                    >
                        <div className="inline-flex items-center gap-2 bg-[#FDE68A] text-[#92400E] px-4 py-1.5 rounded-full text-sm font-semibold mb-8">
                            <Star size={14} fill="#92400E" /> 
                            <span>Nurturing Young Minds</span>
                        </div>
                        <h1 className="font-serif text-[#051A12] text-5xl md:text-7xl lg:text-9xl leading-none mb-6">
                            Books That Build <br />
                            <span className="italic text-[#575F5B]">Knowledge & Character</span>
                        </h1>
                        <p className="font-sans text-[#575F5B] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                            Ancient wisdom from the Gita, simplified for modern kids.
                        </p>
                    </div>

                    {/* --- BACKGROUND CONTENT CLOUD (Behind Book) --- */}
                    <div 
                        className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none will-change-transform"
                        style={{ 
                            opacity: bgOpacity,
                            transform: `translateY(${bgTranslate}px)`,
                            transition: 'opacity 0.3s ease-out, transform 0.2s ease-out'
                        }} 
                    >
                        {/* Distributed Images */}
                        <img src={bgImages[0]} className="absolute top-[-5%] left-[-5%] w-[30vw] opacity-25 blur-[3px] -rotate-12" alt="" />
                        <img src={bgImages[1]} className="absolute bottom-[-10%] left-[-5%] w-[35vw] opacity-25 blur-[3px] rotate-6" alt="" />
                        <img src={bgImages[2]} className="absolute bottom-[-5%] left-[25%] w-[25vw] opacity-20 blur-[4px] -rotate-3" alt="" />
                        <img src={bgImages[3]} className="absolute top-[35%] left-[-5%] w-[20vw] opacity-30 blur-[2px] rotate-12" alt="" />
                        <img src={bgImages[4]} className="absolute bottom-[-5%] right-[25%] w-[25vw] opacity-20 blur-[4px] rotate-3" alt="" />
                        <img src={bgImages[5]} className="absolute top-[40%] right-[-5%] w-[20vw] opacity-30 blur-[2px] -rotate-6" alt="" />
                        <img src={bgImages[6]} className="absolute bottom-[-10%] right-[-5%] w-[35vw] opacity-25 blur-[3px] -rotate-12" alt="" />
                        <img src={bgImages[7]} className="absolute top-[30%] right-[-5%] w-[25vw] opacity-25 blur-[3px] rotate-6" alt="" />
                        <img src={bgImages[8]} className="absolute top-[-5%] right-[-5%] w-[30vw] opacity-30 blur-[3px] rotate-12" alt="" />
                        <img src={bgImages[9]} className="absolute top-[-10%] left-[25%] w-[25vw] opacity-25 blur-[4px] -rotate-6" alt="" />
                    </div>

                    {/* --- MAIN BOOK HERO --- */}
                    <div 
                        className="relative z-30 flex justify-center items-center pointer-events-none will-change-transform"
                        style={{ 
                            transform: `translateY(${bookExitTranslate}px) scale(${finalBookScale})`,
                            opacity: bookOpacity,
                            width: '100%',
                            maxWidth: '1200px',
                            transition: 'opacity 0.2s ease-out, transform 0.2s ease-out'
                        }}
                    >
                        <div className="relative pointer-events-auto w-full flex justify-center">
                            <img 
                                src="/images/gita-english-hero.png" 
                                alt="Gita Book English Edition" 
                                className="w-full object-contain drop-shadow-2xl rounded-lg z-50 transition-transform duration-300 hover:scale-105"
                                style={{ maxHeight: '85vh' }}
                            />
                        </div>

                        {/* Floating Stickers (They move slightly differently for depth) */}
                        <div 
                            className="absolute top-[25%] left-[5%] bg-white w-20 h-20 rounded-full shadow-xl font-bold text-gray-800 flex items-center justify-center z-50 transition-transform duration-200"
                            style={{ transform: `translateX(${scrollY * -0.02}px) translateY(${bookExitTranslate * 0.8}px)` }}
                        >
                            <span className="text-2xl">GB</span>
                        </div>
                        <div 
                            className="absolute bottom-[25%] right-[5%] bg-white w-20 h-20 rounded-full shadow-xl font-bold text-gray-800 flex items-center justify-center z-50 transition-transform duration-200"
                            style={{ transform: `translateX(${scrollY * 0.02}px) translateY(${bookExitTranslate * 0.8}px)` }}
                        >
                            <span className="text-2xl">IN</span>
                        </div>
                    </div>

                </div>
            </div>


            {/* =========================================
                PART 2: BENTO GRID (Seamless Entry)
               ========================================= */}
            <section 
                className="relative z-40 bg-[#FFFEF5] pt-10 pb-40 px-6 -mt-20 rounded-t-[60px] shadow-[0_-40px_80px_rgba(255,254,245,1)]"
                style={{
                    transform: `translateY(${gridTranslateY}px)`,
                    opacity: gridOpacity,
                    transition: 'transform 0.3s ease-out, opacity 0.3s ease-out'
                }}
            >
                <div className="max-w-7xl mx-auto">
                    
                    <div className="text-center mb-16">
                        <span className="text-[#F59E0B] font-semibold tracking-wide uppercase text-sm">Our Philosophy</span>
                        <h2 className="font-serif text-5xl md:text-6xl text-[#051A12] mt-4">Why Parents Trust Us</h2>
                    </div>
                    
                    {/* Wave Text Component */}
                    <WaveText />

                    {/* THE BENTO GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* 1. Large Mission Card */}
                        <div className="md:col-span-2 bg-[#051A12] text-[#FFFEF5] rounded-[32px] p-10 md:p-14 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                            <div className="relative z-10">
                                <div className="inline-block px-4 py-1 rounded-full border border-white/20 text-sm mb-6 backdrop-blur-sm">Our Mission</div>
                                <h3 className="font-serif text-4xl md:text-5xl mb-6 leading-tight">
                                    Building Character, <br/>
                                    <span className="italic text-[#F59E0B]">One Page at a Time.</span>
                                </h3>
                                <p className="text-lg opacity-80 max-w-lg leading-relaxed">
                                    In a world of screen addiction, we bring back the joy of reading. 
                                    Our vision is to create a world where every child has access to quality books 
                                    that spark curiosity.
                                </p>
                            </div>
                            {/* Decoration */}
                            <Star className="absolute top-10 right-10 text-[#F59E0B] opacity-20 w-24 h-24" />
                            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#F59E0B] opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity"></div>
                        </div>

                        {/* 2. Visual Card */}
                        <div className="bg-[#E6F4F1] rounded-[32px] p-10 flex flex-col justify-center items-center text-center group hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                <Sparkles className="w-10 h-10 text-[#0F766E]" />
                            </div>
                            <h3 className="font-serif text-3xl text-[#051A12] mb-3">Magical Art</h3>
                            <p className="text-[#575F5B]">No boring walls of text. Every page is a work of art that captivates.</p>
                        </div>

                        {/* 3. Values Card */}
                        <div className="bg-white border border-gray-100 rounded-[32px] p-10 group hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-16 h-16 bg-[#FFF7ED] rounded-2xl flex items-center justify-center mb-6">
                                <Heart className="w-8 h-8 text-[#EA580C]" />
                            </div>
                            <h3 className="font-serif text-2xl text-[#051A12] mb-2">Child Centric</h3>
                            <p className="text-sm text-[#575F5B]">Curated specifically for developing minds aged 5-12.</p>
                        </div>

                        {/* 4. Curriculum Card */}
                        <div className="md:col-span-2 bg-white border border-gray-100 rounded-[32px] p-10 md:p-12 group hover:-translate-y-2 transition-transform duration-300">
                             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                                <div>
                                    <h3 className="font-serif text-3xl text-[#051A12] mb-2">Made for Growth</h3>
                                    <p className="text-[#575F5B]">A structured path to emotional intelligence.</p>
                                </div>
                                <div className="p-3 bg-[#F3F4F6] rounded-full mt-4 md:mt-0">
                                    <BookOpen className="w-6 h-6 text-[#4B5563]" />
                                </div>
                             </div>
                             
                             {/* Tags with Wave Effect */}
                             <div className="flex flex-wrap gap-3">
                                {['Focus', 'Confidence', 'Empathy', 'Decision Making', 'Roots', 'Culture'].map((tag) => (
                                    <span 
                                        key={tag} 
                                        className="px-5 py-2 bg-[#FFFEF5] border border-gray-200 rounded-full text-sm font-medium text-[#051A12] hover:border-[#F59E0B] transition-all duration-300 cursor-pointer"
                                        onMouseEnter={() => setHoveredTag(tag)}
                                        onMouseLeave={() => setHoveredTag(null)}
                                    >
                                        <span className="inline-block">
                                            {tag.split('').map((char, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-block"
                                                    style={{
                                                        animation: hoveredTag === tag ? `wave 0.6s ease-in-out ${index * 0.05}s` : 'none',
                                                        color: hoveredTag === tag ? '#F59E0B' : 'inherit',
                                                        transition: 'color 0.3s ease'
                                                    }}
                                                >
                                                    {char === ' ' ? '\u00A0' : char}
                                                </span>
                                            ))}
                                        </span>
                                    </span>
                                ))}
                             </div>
                             
                             <style>{`
                                @keyframes wave {
                                    0%, 100% { transform: translateY(0); }
                                    50% { transform: translateY(-8px); }
                                }
                                
                                @keyframes scroll {
                                    0% {
                                        transform: translateX(0);
                                    }
                                    100% {
                                        transform: translateX(-50%);
                                    }
                                }
                                
                                .animate-scroll {
                                    animation: scroll 30s linear infinite;
                                    display: flex;
                                }
                             `}</style>
                        </div>

                    </div>
                </div>
            </section>

        </div>
    );
};

export default GitaHero;