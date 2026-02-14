import React, { useState } from 'react';
import { Play } from 'lucide-react';
import WaveText from '../../components/WaveText';

const GitaVideoSection = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoId = "dQw4w9WgXcQ"; // Replace with your actual YouTube ID

    // We repeat the text to ensure the scroll area is wide enough for large screens
    const tapeContent = "ANCIENT WISDOM • MODERN FORMAT • BUILDING CHARACTER • FOCUS • CONFIDENCE • EMPATHY • ROOTS • ";

    return (
        <section className="relative py-48 overflow-hidden bg-[#FFFEF5]">

            {/* =========================================================
          THE "WISPR" TAPE LAYER (Background)
          Correctly tilted and positioned
         ========================================================= */}
            <div className="absolute top-1/2 left-0 w-[120%] -translate-x-[10%] -translate-y-1/2 -rotate-3 z-0 pointer-events-none flex items-center">

                {/* 1. THE SWIRL (SVG Loop on the Left) */}
                {/* Adjusted to align perfectly with the tape height */}
                <div className="relative z-10 -mr-1">
                    <svg width="180" height="200" viewBox="0 0 180 200" fill="none" className="overflow-visible">
                        {/* This path simulates the ribbon curling out */}
                        <path
                            d="M 180 140 C 100 140, 50 180, 20 120 C -10 60, 60 20, 120 50 C 160 70, 160 110, 120 130 C 80 150, 40 120, 60 80"
                            stroke="#051A12"
                            strokeWidth="80"
                            strokeLinecap="round"
                            fill="none"
                        />
                    </svg>
                </div>

                {/* 2. THE TAPE STRIP (Infinite Scrolling Text) */}
                {/* Solid black bar connecting to the swirl */}
                <div className="flex-1 h-[80px] bg-[#051A12] flex items-center overflow-hidden border-y-2 border-[#051A12] shadow-2xl">
                    <div className="flex animate-marquee will-change-transform">
                        {/* Block 1 */}
                        <span className="font-serif text-5xl text-[#FFFEF5] font-light tracking-wide whitespace-nowrap px-4">
                            {tapeContent} {tapeContent}
                        </span>
                        {/* Block 2 (Duplicate for seamless loop) */}
                        <span className="font-serif text-5xl text-[#FFFEF5] font-light tracking-wide whitespace-nowrap px-4">
                            {tapeContent} {tapeContent}
                        </span>
                    </div>
                </div>
            </div>


            {/* =========================================================
          VIDEO CONTAINER (Foreground)
         ========================================================= */}
            <div className="max-w-5xl mx-auto px-6 relative z-10">

                <div className="text-center mb-16">
                    <h2 className="font-serif text-5xl md:text-6xl text-[#051A12] mb-4 drop-shadow-sm">
                        <WaveText text="Experience the Magic" hoverColor="#051A12" waveHeight={20} />
                    </h2>
                </div>

                {/* Card Container */}
                <div className="relative w-full aspect-video rounded-[3rem] shadow-2xl bg-white p-3 md:p-4 border border-black/5 transform transition-transform duration-700 hover:scale-[1.02]">

                    <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden bg-[#051A12] group">

                        {!isPlaying ? (
                            /* THUMBNAIL STATE */
                            <button
                                onClick={() => setIsPlaying(true)}
                                className="absolute inset-0 w-full h-full flex items-center justify-center cursor-pointer group"
                            >
                                {/* Background Image */}
                                <img
                                    src="/images-webp/gita-english/Bento_grid_right.webp"
                                    alt="Background"
                                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                                />

                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-500"></div>

                                {/* 3D Book Cover */}
                                <div className="relative z-10 transform transition-transform duration-500 group-hover:-translate-y-2">
                                    <img
                                        src="/images-webp/gita-english-hero.webp"
                                        alt="Gita Book Cover"
                                        className="h-[250px] md:h-[380px] object-contain drop-shadow-2xl"
                                    />
                                </div>

                                {/* Play Button */}
                                <div className="absolute inset-0 flex items-center justify-center z-20">
                                    <div className="w-20 h-20 md:w-24 md:h-24 bg-[#F59E0B] rounded-full flex items-center justify-center shadow-2xl transform transition-all duration-300 group-hover:scale-110 group-hover:bg-[#d97706]">
                                        <Play size={32} fill="#051A12" strokeWidth={0} className="ml-1 text-[#051A12]" />
                                    </div>
                                </div>
                            </button>
                        ) : (
                            /* ACTIVE VIDEO STATE */
                            <iframe
                                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                                title="Gita Flow Video"
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        )}

                    </div>
                </div>

            </div>

            {/* SMOOTH INFINITE SCROLL ANIMATION 
          Uses translate3d for GPU acceleration
      */}
            <style>{`
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
        </section>
    );
};

export default GitaVideoSection;