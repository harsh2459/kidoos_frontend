// src/components/ScrollToTopButton.jsx
import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed z-50 
        flex items-center justify-center
        bg-[#1A3C34] text-white
        shadow-lg hover:shadow-xl
        border border-[#4A7C59]/30
        transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        
        /* Responsive Positioning */
        bottom-6 right-6
        sm:bottom-8 sm:right-8
        
        /* Responsive Sizing */
        w-10 h-10 rounded-xl
        sm:w-12 sm:h-12 sm:rounded-2xl
        
        /* Hover Effects */
        hover:-translate-y-1 hover:bg-[#2F523F]
        active:scale-90

        /* Visibility Transition */
        ${isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-10 scale-90 pointer-events-none'
        }
      `}
      aria-label="Scroll to top"
      title="Back to top"
    >
      {/* Icon with bounce animation on hover */}
      <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:-translate-y-0.5" />
      
      {/* Optional: Subtle glow effect behind (pseudo-element style in CSS-in-JS) */}
      <div className="absolute inset-0 -z-10 rounded-xl sm:rounded-2xl bg-[#4A7C59] opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-40"></div>
    </button>
  );
}