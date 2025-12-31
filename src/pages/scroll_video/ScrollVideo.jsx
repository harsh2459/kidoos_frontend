import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const VrindavanScroll = () => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const imagesRef = useRef([]);

    // CONFIGURATION
    const frameCount = 192; 

    const currentFrame = (index) =>
        `/images/vrindavan_frames/frame_${(index + 1).toString().padStart(4, '0')}.webp `;

    // 1. Preload Images
    useEffect(() => {
        const preloadImages = async () => {
            const promises = [];
            for (let i = 0; i < frameCount; i++) {
                const promise = new Promise((resolve) => {
                    const img = new Image();
                    img.src = currentFrame(i);
                    img.onload = () => {
                        imagesRef.current[i] = img;
                        resolve();
                    };
                    img.onerror = resolve; 
                });
                promises.push(promise);
            }
            await Promise.all(promises);
            setImagesLoaded(true);
        };
        preloadImages();
    }, []);

    // 2. Animation
    useEffect(() => {
        if (!imagesLoaded) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d", { alpha: false }); 

        canvas.width = 1920;
        canvas.height = 1080;

        if (imagesRef.current[0]) {
            context.drawImage(imagesRef.current[0], 0, 0);
        }

        const frame = { index: 0 };

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "bottom+=250% bottom",
                scrub: 0,
                pin: true,
            },
        });

        tl.to(frame, {
            index: frameCount - 1,
            snap: "index",
            ease: "none",
            onUpdate: () => {
                if (imagesRef.current[frame.index]) {
                    context.drawImage(imagesRef.current[frame.index], 0, 0);
                }
            },
        }, 0);

        tl.fromTo(textRef.current, 
            { x: "-10%" }, 
            { x: "10%", ease: "none" }, 
            0
        );

        return () => ScrollTrigger.getAll().forEach(t => t.kill());
    }, [imagesLoaded]);

    return (
        <div ref={containerRef} style={styles.wrapper}>
            {/* --- FONTS LOADED HERE --- */}
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Playfair+Display:ital,wght@0,400;1,400&display=swap');
                `}
            </style>

            <h1 ref={textRef} style={styles.backgroundText}>
                VRINDAVAN
            </h1>

            <div style={styles.cardContainer}>
                {!imagesLoaded && <div style={styles.loader}>Loading Journey...</div>}
                
                <canvas
                    ref={canvasRef}
                    style={{ ...styles.canvas, opacity: imagesLoaded ? 1 : 0 }}
                />

                <div style={styles.overlayContent}>
                    <p style={styles.subText}>Where Krishna's leela unfolds,</p>
                    <p style={styles.subText}>Where every soul finds home</p>
                    
                    <div style={styles.miniFooter}>
                        <span>THE SACRED LAND</span>
                        <span style={{margin: '0 10px'}}>•</span>
                        <span>THE ETERNAL JOURNEY</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    wrapper: {
        height: "100vh",
        width: "100%",
        backgroundColor: "#050505",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden"
    },
    backgroundText: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: "18vw",
        fontFamily: "'Cinzel', serif", 
        color: "rgba(255, 255, 255, 0.08)",
        whiteSpace: "nowrap",
        pointerEvents: "none",
        zIndex: 1,
        letterSpacing: "-0.02em"
    },
    cardContainer: {
        position: "relative",
        width: "70vw",
        maxWidth: "1200px",
        aspectRatio: "16/9",
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
        zIndex: 10,
        backgroundColor: "#111",
        border: "1px solid rgba(255,255,255,0.1)"
    },
    canvas: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block"
    },
    loader: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        color: "white",
        fontFamily: "sans-serif"
    },
    overlayContent: {
        position: "absolute",
        bottom: "0",
        left: "0",
        width: "100%",
        padding: "40px",
        background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center"
    },
    subText: {
        color: "rgba(255,255,255,0.9)",
        fontFamily: "'Playfair Display', serif",
        fontSize: "clamp(16px, 2vw, 24px)",
        fontStyle: "italic",
        margin: "0 0 5px 0",
        letterSpacing: "0.05em",
        textShadow: "0 2px 10px rgba(0,0,0,0.5)"
    },
    miniFooter: {
        marginTop: "20px",
        color: "rgba(255,255,255,0.5)",
        fontSize: "10px",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        fontFamily: "sans-serif"
    }
};

export default VrindavanScroll;