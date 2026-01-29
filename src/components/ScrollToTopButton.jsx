import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      title="Back to top"
      className={`
        fixed z-50 flex items-center justify-center
        bg-[#3E2723] text-[#F3E5AB]
        border border-[#D4AF37]/40
        transition-all duration-300 ease-out

        /* Position */
        bottom-4 right-4
        sm:bottom-5 sm:right-5
        lg:bottom-6 lg:right-6

        /* 👇 SMALLER SIZE */
        w-8 h-8 rounded-lg
        sm:w-9 sm:h-9 sm:rounded-lg
        md:w-10 md:h-10 md:rounded-xl
        lg:w-11 lg:h-11 lg:rounded-xl

        /* Shadow */
        shadow-[0_4px_14px_rgba(62,39,35,0.35)]
        hover:shadow-[0_8px_24px_rgba(212,175,55,0.45)]

        /* Hover */
        hover:bg-[#D4AF37]
        hover:text-[#3E2723]
        hover:-translate-y-0.5
        active:scale-90

        /* Visibility */
        ${
          isVisible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-6 scale-95 pointer-events-none"
        }
      `}
    >
      {/* Smaller icon */}
      <ArrowUp
        className="
          w-3.5 h-3.5
          sm:w-4 sm:h-4
          md:w-4.5 md:h-4.5
          lg:w-5 lg:h-5
        "
      />
    </button>
  );
}
