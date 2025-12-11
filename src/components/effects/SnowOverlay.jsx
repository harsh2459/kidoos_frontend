// src/components/SnowOverlay.jsx
import React, { useEffect, useState } from 'react';
import Snowfall from 'react-snowfall';

const SnowOverlay = () => {
    const [isWinterSeason, setIsWinterSeason] = useState(false);

    useEffect(() => {
        // --- LOGIC: WHEN TO SHOW SNOW ---
        const checkSeason = () => {
            const today = new Date();
            const month = today.getMonth(); 
            const day = today.getDate();

            
            const isDecember = month === 11;
            
            const isJanuary = month === 0 && day <= 15

            if (isDecember || isJanuary ) {
                setIsWinterSeason(true);
            } else {
                setIsWinterSeason(false);
            }
        };

        checkSeason();
    }, []);

    // If it's not winter, render nothing
    if (!isWinterSeason) return null;

    return (
        <div
            style={{
                position: 'fixed',
                width: '100vw',
                height: '100vh',
                top: 0,
                left: 0,
                zIndex: 9999, // High enough to be on top, but below critical modals if needed
                pointerEvents: 'none' // CRITICAL: Allows clicking on buttons "through" the snow
            }}
        >
            <Snowfall
                // Changed from "red" to white/ice blue for a magical feel
                color="#E3F2FD" 
                snowflakeCount={100} // Reduced slightly for mobile performance
                radius={[0.5, 2.5]} 
                speed={[0.5, 1.5]}   // Slower speed feels more peaceful
                wind={[-0.5, 1.0]} 
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
                }}
            />
        </div>
    );
};

export default SnowOverlay;

{/* Snow effect dec 1 - Jan 15 */}