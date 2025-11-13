// src/components/ScrollToTopButton.jsx
import { useState, useEffect } from "react";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      // Show button after scrolling down 300px
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
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
        fixed bottom-5 right-5 z-50
        w-11 h-11
        bg-gradient-to-br from-gray-900 to-black
        text-white
        rounded-full
        shadow-lg
        flex items-center justify-center
        transition-all duration-500 ease-out
        hover:shadow-2xl
        hover:scale-110
        active:scale-95
        group
        ${isVisible 
          ? 'opacity-100 translate-y-0 pointer-events-auto' 
          : 'opacity-0 translate-y-16 pointer-events-none'
        }
      `}
      aria-label="Scroll to top"
      title="Back to top"
    >
      {/* Animated ripple effect on hover */}
      <span className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
      
      {/* Rotating border effect */}
      <span className="absolute inset-0 rounded-full border-2 border-white opacity-0 group-hover:opacity-30 animate-ping-slow"></span>
      
      {/* Up arrow icon with bounce animation */}
      <svg
        className="w-5 h-5 transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>

      {/* Custom animations */}
      <style>{`
        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.1;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
        
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        /* Smooth fade and slide animation */
        button {
          backdrop-filter: blur(10px);
        }

        /* Add a subtle glow effect */
        button:hover {
          box-shadow: 
            0 20px 25px -5px rgba(0, 0, 0, 0.3),
            0 10px 10px -5px rgba(0, 0, 0, 0.2),
            0 0 20px rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </button>
  );
}