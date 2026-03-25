import { useState, useEffect } from 'react';

const SALE_DURATION_MS = 45 * 60 * 1000; // 45 minutes
const LS_KEY = 'ki_flash_deal_end';

/**
 * Returns a persisted 45-min countdown timer.
 * - Survives page refreshes and navigation (stored in localStorage)
 * - Automatically restarts when it reaches 0
 * - All tabs/components share the same end-time
 */
function getRemaining() {
    let end = Number(localStorage.getItem(LS_KEY) || 0);
    const now = Date.now();
    if (!end || end <= now) {
        end = now + SALE_DURATION_MS;
        localStorage.setItem(LS_KEY, String(end));
    }
    return Math.max(0, Math.floor((end - now) / 1000));
}

export function useSaleTimer() {
    const [remaining, setRemaining] = useState(getRemaining);

    useEffect(() => {
        const interval = setInterval(() => setRemaining(getRemaining()), 1000);
        return () => clearInterval(interval);
    }, []);

    return {
        saleMin: Math.floor(remaining / 60).toString().padStart(2, '0'),
        saleSec: (remaining % 60).toString().padStart(2, '0'),
        remaining,
    };
}
