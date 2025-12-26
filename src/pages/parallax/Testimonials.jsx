import React, { useState, useEffect, useMemo } from 'react';
import { Star, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for cleaner classes
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Testimonials = () => {
  // --- DATA PREPARATION ---
  // 1. Flatten the nested array since we don't need grid layouts anymore.
  const rawTestimonials = [
      [
        { id: 1, name: "Priya Sharma", role: "Mother of 2, Mumbai", text: "My daughter was glued to her iPad all day. After getting this book, she now asks to read it every night. The illustrations are captivating!", rating: 5 },
        { id: 2, name: "Rajesh Kumar", role: "Teacher, Delhi", text: "As an educator, I'm impressed by how complex concepts are broken down. My son is learning values without feeling lectured.", rating: 5 },
        { id: 3, name: "Anjali Desai", role: "Proud Mom, Ahmedabad", text: "Best investment this year! My twins fight over who gets to read it first. They're learning courage and kindness through stories.", rating: 5 },
        { id: 4, name: "Vikram Mehta", role: "Grandfather, Bangalore", text: "I wanted my grandchildren to connect with our culture. This book bridges the gap perfectly.", rating: 5 },
        { id: 5, name: "Sneha Patel", role: "Working Mother, Pune", text: "Outstanding quality! My 6-year-old sits quietly for 20 minutes reading - that's a miracle in our house!", rating: 5 },
        { id: 6, name: "Arjun Reddy", role: "Tech Dad, Hyderabad", text: "Got my daughter off YouTube and into reading. She's learning focus and patience. Worth every rupee!", rating: 5 }
      ],
      [
        { id: 7, name: "Kavita Singh", role: "Pediatrician, Jaipur", text: "The lessons about controlling anger and making wise choices are practical. My 8-year-old quotes Krishna now!", rating: 5 },
        { id: 8, name: "Rohan Kapoor", role: "First-time Dad, Chandigarh", text: "Bought as a gift for my nephew. His parents said he finished it in two days and wants more books like this!", rating: 5 },
        { id: 9, name: "Meera Iyer", role: "Homeschool Mom, Chennai", text: "Now part of our curriculum. It teaches empathy, resilience, and critical thinking brilliantly.", rating: 5 },
        { id: 10, name: "Amit Gupta", role: "Single Father, Kolkata", text: "This book helps me teach values I learned from my parents. She's becoming more confident and thoughtful.", rating: 5 },
        { id: 11, name: "Deepa Nair", role: "School Principal, Kochi", text: "We bought 50 copies for our library. Within a week, there was a waiting list! Kids discuss stories during lunch.", rating: 5 },
        { id: 12, name: "Sanjay Malhotra", role: "NRI Parent, USA", text: "Living abroad, it's hard to teach Indian culture. This book is perfect - they're learning and feeling proud of their heritage.", rating: 5 }
      ],
      [
        { id: 13, name: "Pooja Agarwal", role: "Mom of 3, Lucknow", text: "Bedtime was chaos with three kids. Now we read one story together every night. It's our family bonding time!", rating: 5 },
        { id: 14, name: "Karan Sethi", role: "Entrepreneur, Gurgaon", text: "I travel a lot for work. Now I video call and we read together. My son saves pages for me. Strengthened our bond!", rating: 5 },
        { id: 15, name: "Lakshmi Venkat", role: "Retired Teacher, Mysore", text: "In 40 years of teaching, rarely seen material this well-crafted. It respects children's intelligence beautifully.", rating: 5 },
        { id: 16, name: "Nikhil Joshi", role: "Artist, Goa", text: "Stunning illustrations. My daughter asked, 'Papa, what's my dharma?' This book makes kids think deeply.", rating: 5 },
        { id: 17, name: "Ritu Khanna", role: "Child Psychologist, Noida", text: "I recommend this to all my clients. Helps children process emotions and develop moral reasoning remarkably well.", rating: 5 },
        { id: 18, name: "Suresh Balan", role: "Grandfather of 5, Trivandrum", text: "All five grandkids love it! Bought Hindi and English editions. They're comparing translations and learning both languages!", rating: 5 }
      ]
  ];
  // Combine into one clean list, memoized for performance.
  const testimonials = useMemo(() => rawTestimonials.flat(), []);

  // --- STATE ---
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activeTestimonial = testimonials[activeIndex];

  // --- AUTO-ROTATION LOGIC ---
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000); // Change every 6 seconds
    return () => clearInterval(interval);
  }, [isPaused, testimonials.length]);

  const handleManualClick = (index) => {
    setActiveIndex(index);
    setIsPaused(true);
    // Resume auto-rotation after 15 seconds of inactivity
    setTimeout(() => setIsPaused(false), 15000);
  };

  return (
    <section className="py-32 px-4 md:px-8 bg-[#F5F5F7] overflow-hidden">
      <div className="max-w-[1200px] mx-auto relative">
        
        {/* HEADER */}
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200/60 shadow-sm mb-6">
            <Star className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">2,500+ Happy Families</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-[#1d1d1f]">
            Loved by Parents.
          </h2>
        </div>

        {/* SPLIT LAYOUT CONTAINER */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24 items-start relative">
            
            {/* LEFT COLUMN: NAVIGATION LIST (Timeline Style) */}
            <div className="md:col-span-4 relative pl-8 md:pl-0">
                {/* The subtle vertical timeline line */}
                <div className="absolute left-0 md:left-auto md:right-0 top-4 bottom-12 w-[2px] bg-gray-200/80 hidden md:block"></div>
                
                {/* Mobile timeline line */}
                <div className="absolute left-2 top-4 bottom-12 w-[2px] bg-gray-200/80 md:hidden"></div>

                <div className="space-y-8 md:space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar py-4 md:pr-8 md:text-right mask-gradient">
                    {testimonials.map((t, index) => {
                        const isActive = index === activeIndex;
                        return (
                        <div 
                            key={t.id} 
                            onClick={() => handleManualClick(index)}
                            className={cn(
                                "relative cursor-pointer group transition-all duration-500 py-2",
                                isActive ? "opacity-100 scale-105" : "opacity-40 hover:opacity-70 hover:scale-100"
                            )}
                        >
                            {/* THE MAGIC: Animated Active Indicator Line */}
                            {isActive && (
                                <motion.div 
                                    layoutId="activeIndicator"
                                    className="absolute md:right-[-34px] left-[-26px] top-1/2 -translate-y-1/2 w-4 h-4 bg-orange-500 rounded-full shadow-[0_0_15px_4px_rgba(249,115,22,0.4)] z-10"
                                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                >
                                    <div className="absolute inset-1 bg-white rounded-full"></div>
                                </motion.div>
                            )}
                            
                            <h3 className={cn("text-xl font-bold tracking-tight transition-colors duration-300", isActive ? "text-[#1d1d1f]" : "text-gray-600")}>
                                {t.name}
                            </h3>
                            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mt-1">{t.role}</p>
                        </div>
                        );
                    })}
                </div>
            </div>

            {/* RIGHT COLUMN: THE FEATURED QUOTE */}
            <div className="md:col-span-8 relative min-h-[400px] flex items-center">
                {/* Large background quote icon for texture */}
                <Quote className="absolute top-0 left-0 w-32 h-32 text-gray-100/50 -z-10 rotate-180" />
                
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTestimonial.id}
                        initial={{ opacity: 0, x: 40, filter: "blur(8px)" }}
                        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, x: -40, filter: "blur(8px)" }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 100, 
                            damping: 20,
                            mass: 1.2
                        }}
                        className="relative z-10"
                    >
                         {/* Star Rating */}
                         <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex gap-1 mb-8"
                         >
                           {[...Array(activeTestimonial.rating)].map((_, idx) => (
                              <Star key={idx} className="w-6 h-6 fill-[#FFAA00] text-[#FFAA00]" />
                           ))}
                        </motion.div>

                        {/* The Big Quote */}
                        <h3 className="text-3xl md:text-5xl font-semibold leading-tight text-[#1d1d1f] tracking-tight">
                            "{activeTestimonial.text}"
                        </h3>

                        {/* Mobile-only author info shown below quote */}
                        <div className="mt-8 md:hidden">
                            <div className="font-bold text-[#1d1d1f] text-xl">{activeTestimonial.name}</div>
                            <div className="text-sm text-gray-400 font-bold uppercase tracking-wider mt-1">{activeTestimonial.role}</div>
                        </div>

                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
      </div>
      
      {/* Utility CSS for gradient masking the list */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        .mask-gradient {
            mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%);
            -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%);
        }
      `}</style>
    </section>
  );
};

export default Testimonials;