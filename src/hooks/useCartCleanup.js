// src/hooks/useCartCleanup.js
import { useEffect, useRef } from 'react';
import { useCart } from '../contexts/CartStore';

/*
 * Hook to automatically clean invalid items from cart on app load
 * This prevents orders from failing due to deleted/invalid book IDs
 */
export function useCartCleanup() {
  const cleanInvalidItems = useCart(s => s.cleanInvalidItems);
  const hasRun = useRef(false); // ✅ Prevent multiple runs
  
  useEffect(() => {
    // ✅ Only run once per app session
    if (hasRun.current) return;
    hasRun.current = true;
    
    console.log('🧹 Running cart cleanup...');
    const validItems = cleanInvalidItems(); // ✅ Now synchronous
    console.log(`✅ Cart cleanup complete: ${validItems.length} valid items`);
  }, []); // Empty deps - only run once
  
  return null;
}