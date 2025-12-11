// src/components/SpringOverlay.jsx
import React, { useEffect, useState } from 'react';
import Snowfall from 'react-snowfall';

const SpringOverlay = () => {
    const [isSpring, setIsSpring] = useState(false);
    const [images, setImages] = useState([]);

    useEffect(() => {
        // --- STEP 1: DEFINE SOURCES ---
        // Ensure these exact files exist in your "public" folder
        const springSources = [
            "/images/sakura.png",
            "/images/flower.png", 
            "/images/butterfly.png", 
            "/images/butterfly_1.png", 
            "/images/pink-cosmos.png", 
        ];

        // --- STEP 2: LOAD IMAGES SAFELY ---
        const loadImages = async () => {
            const promises = springSources.map(src => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    // Success: Resolve the image
                    img.onload = () => resolve(img);
                    // Error: Log it and resolve null (so the app doesn't crash)
                    img.onerror = () => {
                        console.warn(`SpringOverlay Error: Could not load image at ${src}`);
                        resolve(null); 
                    };
                    img.src = src;
                });
            });

            // Wait for ALL images to finish loading
            const loadedImages = await Promise.all(promises);
            
            // Filter out any that failed (nulls) to prevent "broken state" errors
            const validImages = loadedImages.filter(img => img !== null);
            
            setImages(validImages);
        };

        loadImages();

        // --- STEP 3: LOGIC ---
        const checkSeason = () => {
            const today = new Date();
            const month = today.getMonth(); // 0 = Jan, 1 = Feb, etc.

            // Spring: March (2), April (3), May (4)
            const isSpringMonth = month === 2 || month === 3 || month === 4;
        
            if (isSpringMonth) {
                setIsSpring(true);
            } else {
                setIsSpring(false);
            }
        };

        checkSeason();
    }, []);

    // If not spring (and not forced), render nothing
    if (!isSpring) return null;

    // Don't render Snowfall until images are actually ready
    if (images.length === 0) return null; 

    return (
        <div
            style={{
                position: 'fixed',
                width: '100vw',
                height: '100vh',
                top: 0,
                left: 0,
                zIndex: 9999,
                pointerEvents: 'none' // Critical: allows clicking through the overlay
            }}
        >
            <Snowfall
                images={images}
                // Settings for a "Breezy Spring Day"
                radius={[10, 20]}    
                snowflakeCount={10}  
                speed={[0.5, 1.5]}   
                wind={[-0.5, 2.0]}   
                rotationSpeed={[-1, 1]} 
                
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

export default SpringOverlay;