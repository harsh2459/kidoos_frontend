import React, { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const TestimonialsBentoGrid = () => {
  const [currentLayout, setCurrentLayout] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const sectionRef = useRef(null);

  // 18 testimonials divided into 3 layouts of 6 each
  const testimonials = [
    // Layout 1
    [
      { id: 1, name: "Priya Sharma", role: "Mother of 2, Mumbai", text: "My daughter was glued to her iPad all day. After getting this book, she now asks to read it every night. The illustrations are captivating!", rating: 5 },
      { id: 2, name: "Rajesh Kumar", role: "Teacher, Delhi", text: "As an educator, I'm impressed by how complex concepts are broken down. My son is learning values without feeling lectured.", rating: 5 },
      { id: 3, name: "Anjali Desai", role: "Proud Mom, Ahmedabad", text: "Best investment this year! My twins fight over who gets to read it first. They're learning courage and kindness through stories.", rating: 5 },
      { id: 4, name: "Vikram Mehta", role: "Grandfather, Bangalore", text: "I wanted my grandchildren to connect with our culture. This book bridges the gap perfectly - ancient wisdom kids understand.", rating: 5 },
      { id: 5, name: "Sneha Patel", role: "Working Mother, Pune", text: "Outstanding quality! My 6-year-old sits quietly for 20 minutes reading - that's a miracle in our house!", rating: 5 },
      { id: 6, name: "Arjun Reddy", role: "Tech Dad, Hyderabad", text: "Got my daughter off YouTube and into reading. She's learning focus and patience. Worth every rupee!", rating: 5 }
    ],
    // Layout 2
    [
      { id: 7, name: "Kavita Singh", role: "Pediatrician, Jaipur", text: "The lessons about controlling anger and making wise choices are practical. My 8-year-old quotes Krishna now!", rating: 5 },
      { id: 8, name: "Rohan Kapoor", role: "First-time Dad, Chandigarh", text: "Bought as a gift for my nephew. His parents said he finished it in two days and wants more books like this!", rating: 5 },
      { id: 9, name: "Meera Iyer", role: "Homeschool Mom, Chennai", text: "Now part of our curriculum. It teaches empathy, resilience, and critical thinking brilliantly.", rating: 5 },
      { id: 10, name: "Amit Gupta", role: "Single Father, Kolkata", text: "This book helps me teach values I learned from my parents. She's becoming more confident and thoughtful.", rating: 5 },
      { id: 11, name: "Deepa Nair", role: "School Principal, Kochi", text: "We bought 50 copies for our library. Within a week, there was a waiting list! Kids discuss stories during lunch.", rating: 5 },
      { id: 12, name: "Sanjay Malhotra", role: "NRI Parent, USA", text: "Living abroad, it's hard to teach Indian culture. This book is perfect - they're learning and feeling proud of their heritage.", rating: 5 }
    ],
    // Layout 3
    [
      { id: 13, name: "Pooja Agarwal", role: "Mom of 3, Lucknow", text: "Bedtime was chaos with three kids. Now we read one story together every night. It's our family bonding time!", rating: 5 },
      { id: 14, name: "Karan Sethi", role: "Entrepreneur, Gurgaon", text: "I travel a lot for work. Now I video call and we read together. My son saves pages for me. Strengthened our bond!", rating: 5 },
      { id: 15, name: "Lakshmi Venkat", role: "Retired Teacher, Mysore", text: "In 40 years of teaching, rarely seen material this well-crafted. It respects children's intelligence beautifully.", rating: 5 },
      { id: 16, name: "Nikhil Joshi", role: "Artist, Goa", text: "Stunning illustrations. My daughter asked, 'Papa, what's my dharma?' This book makes kids think deeply.", rating: 5 },
      { id: 17, name: "Ritu Khanna", role: "Child Psychologist, Noida", text: "I recommend this to all my clients. Helps children process emotions and develop moral reasoning remarkably well.", rating: 5 },
      { id: 18, name: "Suresh Balan", role: "Grandfather of 5, Trivandrum", text: "All five grandkids love it! Bought Hindi and English editions. They're comparing translations and learning both languages!", rating: 5 }
    ]
  ];

  // 3 different bento grid layouts
  const gridLayouts = [
    // Layout 1: Classic asymmetric
    "grid grid-cols-4 grid-rows-4 gap-4",
    // Layout 2: Horizontal emphasis
    "grid-cols-12 grid-rows-2 gap-4",
    // Layout 3: Balanced mix
    "grid grid-cols-6 grid-rows-5 gap-4"
  ];

  const cardPositions = [
    // Layout 1 positions
    [
      "row-span-2",
      "col-span-2 row-span-2", // Small square
      "row-span-2 col-start-4", // Medium rect
      "row-span-2 col-start-2 row-start-3", // Tall rect (right)
      "col-span-2 row-span-2 col-start-3 row-start-3", // Long rect (bottom left)
      "row-span-2 col-start-1 row-start-3", // Medium square
    ],
    // Layout 2 positions
    [
      "col-span-6 row-span-1", // Large rect
      "col-span-3 row-span-1", // Medium square
      "col-span-3 row-span-1", // Medium square
      "col-span-3 row-span-1", // Small rect
      "col-span-4 row-span-1", // Medium rect
      "col-span-5 row-span-2"  // Tall rect (right)
    ],
    // Layout 3 positions
    [
      "col-span-2 row-span-3", // Tall rect (left)
      "row-span-3 col-start-3", // Medium rect
      "row-span-2 col-start-4", // Medium square
      "col-span-2 row-span-2 col-start-5", // Long rect
      "col-span-3 row-span-2 col-start-1 row-start-4", // Medium square
      "col-span-3 row-span-3 col-start-4 row-start-3"  // Long rect
    ]
  ];

  // Auto-rotate every 10 seconds
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentLayout((prev) => (prev + 1) % 3);
    }, 10000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const nextLayout = () => {
    setCurrentLayout((prev) => (prev + 1) % 3);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 20000);
  };

  const prevLayout = () => {
    setCurrentLayout((prev) => (prev - 1 + 3) % 3);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 20000);
  };

  return (
    <section
      ref={sectionRef}
      className="py-24 px-6 bg-gradient-to-b from-[#FFFEF5] to-[#FFF7ED] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
          <div className="inline-flex items-center gap-2 bg-[#FDE68A] text-[#92400E] px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Star size={16} fill="#92400E" />
            <span>Loved by Families</span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#051A12] mb-4">
            Parents & Kids Love It
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Real stories from families across India
          </p>

          {/* Rating Summary */}
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} fill="#F59E0B" className="text-[#F59E0B]" />
                ))}
              </div>
              <span className="font-bold text-[#051A12] text-lg">4.9/5</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <span className="font-semibold">2,500+ Happy Families</span>
          </div>
        </div>

        {/* Bento Grid with Transitions */}
        <div className="relative min-h-[600px]">

          {/* Navigation Buttons */}
          <button
            onClick={prevLayout}
            className="absolute -left-4 md:-left-16 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center hover:bg-[#F59E0B] hover:text-white hover:scale-110 transition-all duration-300"
            aria-label="Previous layout"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextLayout}
            className="absolute -right-4 md:-right-16 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center hover:bg-[#F59E0B] hover:text-white hover:scale-110 transition-all duration-300"
            aria-label="Next layout"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Grid Layouts */}
          {[0, 1, 2].map((layoutIndex) => (
            <div
              key={layoutIndex}
              className={`grid ${gridLayouts[layoutIndex]} absolute inset-0 transition-all duration-700 ${layoutIndex === currentLayout
                ? 'opacity-100 scale-100 z-10'
                : 'opacity-0 scale-95 z-0 pointer-events-none'
                }`}
            >
              {testimonials[layoutIndex].map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className={`${cardPositions[layoutIndex][index]} bg-white border-2 border-gray-100 hover:border-[#F59E0B] rounded-3xl p-6 md:p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl group`}
                  style={{
                    transitionDelay: layoutIndex === currentLayout ? `${index * 80}ms` : '0ms'
                  }}
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} fill="#F59E0B" className="text-[#F59E0B]" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-gray-700 leading-relaxed mb-4 text-sm md:text-base line-clamp-4 group-hover:text-[#051A12] transition-colors">
                    "{testimonial.text}"
                  </p>

                  {/* Author */}
                  <div className="mt-auto">
                    <p className="font-bold text-[#051A12] text-sm md:text-base">{testimonial.name}</p>
                    <p className="text-xs md:text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Page Indicators */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
            {[0, 1, 2].map((index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentLayout(index);
                  setIsPaused(true);
                  setTimeout(() => setIsPaused(false), 20000);
                }}
                className={`transition-all duration-300 rounded-full ${index === currentLayout
                  ? 'w-8 h-3 bg-[#F59E0B]'
                  : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                  }`}
                aria-label={`Layout ${index + 1}`}
              />
            ))}
          </div>
        </div>


      </div>
    </section>
  );
};

export default TestimonialsBentoGrid;