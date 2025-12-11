// src/components/AutumnOverlay.jsx
import React, { useEffect, useState } from 'react';
import Snowfall from 'react-snowfall';

const AutumnOverlay = () => {
    const [isAutumn, setIsAutumn] = useState(false);
    const [images, setImages] = useState([]);

    useEffect(() => {
        const leafSources = [
            "/images/Autumn_1.png",
            "/images/Autumn_2.png",
            "/images/Autumn_3.png",
        ];

        const imgElements = leafSources.map(src => {
            const img = new Image();
            img.src = src;
            return img;
        });
        setImages(imgElements); 
        const checkSeason = () => {
            const today = new Date();
            const month = today.getMonth();

            // Logic: Month 8 (Sept), 9 (Oct), or 10 (Nov)
            const isAutumnMonth = month === 8 || month === 9 || month === 10;
            if (isAutumnMonth) {
                setIsAutumn(true);
            } else {
                setIsAutumn(false);
            }
        };

        checkSeason();
    }, []);

    // If it's not Autumn, render nothing
    if (!isAutumn) return null;

    return (
        <div
            style={{
                position: 'fixed',
                width: '100vw',
                height: '100vh',
                top: 0,
                left: 0,
                zIndex: 9999, // On top of everything
                pointerEvents: 'none' // Allows clicking through the leaves
            }}
        >
            <Snowfall
                images={images}
                // Size: Adjust if your images look too big/small
                radius={[15, 30]}
                snowflakeCount={10}
                speed={[0.5, 2.0]}
                wind={[-0.5, 2]}
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

export default AutumnOverlay;