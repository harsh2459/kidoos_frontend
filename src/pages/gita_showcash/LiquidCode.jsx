import { useEffect, useRef } from "react";

export default function Section1() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const script = document.createElement("script");
    script.type = "module";
    
    // Unsplash image
    const imageUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop";

    script.textContent = `
      import LiquidBackground from 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.22/build/backgrounds/liquid1.min.js';
      
      const canvas = document.getElementById('liquid-canvas');
      if (canvas) {
        const app = LiquidBackground(canvas);
        app.loadImage('${imageUrl}');
        
        // UPDATED SETTINGS FOR TRANSPARENCY & SUBTLETY
        app.liquidPlane.material.metalness = 0.1;  // Lowered from 0.75 for clarity
        app.liquidPlane.material.roughness = 0.1;  // Lowered slightly for a wet look
        app.liquidPlane.uniforms.displacementScale.value = 1.0; // Lowered from 5 to 1.0 for less distortion
        app.setRain(false);
        
        window._liquidApp = app;
      }
    `;

    document.body.appendChild(script);

    return () => {
      if (window._liquidApp && window._liquidApp.dispose) {
        window._liquidApp.dispose();
      }
      document.body.removeChild(script);
      delete window._liquidApp;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 m-0 w-full h-full touch-none overflow-hidden"
      style={{ fontFamily: '"Montserrat", serif' }}
    >
      <canvas
        ref={canvasRef}
        id="liquid-canvas"
        className="fixed inset-0 w-full h-full"
      />
    </div>
  );
}