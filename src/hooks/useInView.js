// src/hooks/useInView.js
import { useEffect, useRef, useState } from "react";

/**
 * Fires once when the observed element enters the viewport.
 * Uses IntersectionObserver with a pre-load margin so data is ready
 * before the section is fully visible.
 *
 * @param {object} options
 * @param {string} options.rootMargin - Pre-load distance (default "200px")
 * @param {number} options.threshold  - Intersection threshold (default 0)
 * @returns {{ ref: React.RefObject, inView: boolean }}
 */
export function useInView({ rootMargin = "200px", threshold = 0 } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Fallback for browsers without IntersectionObserver — load immediately
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect(); // triggerOnce — never fires again
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return { ref, inView };
}
