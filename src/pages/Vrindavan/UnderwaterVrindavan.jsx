import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";

const HERO_IMAGE = "/images/vrundaven/image_ffc064.png";

const HeroSection = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const [bubbles, setBubbles] = useState([]);

  // Generate bubbles
  useEffect(() => {
    const bubblesArray = [];
    for (let i = 0; i < 30; i++) {
      bubblesArray.push({
        id: i,
        size: Math.random() * 6 + 2,
        left: Math.random() * 100,
        duration: Math.random() * 10 + 8,
        delay: Math.random() * 5,
      });
    }
    setBubbles(bubblesArray);
  }, []);

  // Three.js setup for distant fish
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 0;

    const renderer = new THREE.WebGLRenderer({ 
      canvas, 
      alpha: true,
      antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Soft ambient lighting
    const ambientLight = new THREE.AmbientLight(0x1a3d4d, 0.5);
    scene.add(ambientLight);

    // Simple distant fish silhouette
    class DistantFish {
      constructor(scene) {
        this.group = new THREE.Group();
        
        // Very simple ellipsoid body - will be far away and dark
        const bodyGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        bodyGeometry.scale(2, 0.8, 0.6);
        
        const bodyMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color(0.5, 0.6, 0.65),
          transparent: true,
          opacity: 0.6,
          fog: true,
        });
        
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.group.add(this.body);

        // Simple tail triangle
        const tailGeometry = new THREE.ConeGeometry(0.08, 0.15, 4);
        const tailMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color(0.45, 0.55, 0.6),
          transparent: true,
          opacity: 0.55,
        });
        
        this.tail = new THREE.Mesh(tailGeometry, tailMaterial);
        this.tail.rotation.z = Math.PI / 2;
        this.tail.position.x = -0.25;
        this.group.add(this.tail);

        // Position fish far away in the background
        this.group.position.set(
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 20,
          -15 - Math.random() * 25  // Far in the distance (-15 to -40)
        );

        // Random size - smaller because they're far
        const scale = 0.8 + Math.random() * 1.2;
        this.group.scale.set(scale, scale, scale);

        this.speed = (Math.random() * 0.01 + 0.005) / scale;
        this.swimOffset = Math.random() * Math.PI * 2;
        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.verticalSpeed = (Math.random() - 0.5) * 0.001;
        
        scene.add(this.group);
      }

      animate(time) {
        // Slow, distant movement
        this.group.position.x += this.speed * this.direction;
        this.group.position.y += Math.sin(time * 1.5 + this.swimOffset) * 0.003 + this.verticalSpeed;
        
        // Very subtle tail movement
        this.tail.rotation.y = Math.sin(time * 3 + this.swimOffset) * 0.2;

        // Reset when out of view
        if (Math.abs(this.group.position.x) > 25) {
          this.group.position.x = -25 * this.direction;
          this.group.position.y = (Math.random() - 0.5) * 20;
          this.group.position.z = -15 - Math.random() * 25;
        }

        // Face direction
        this.group.rotation.y = this.direction > 0 ? -Math.PI / 2 : Math.PI / 2;
      }
    }

    // Create school of distant fish
    const fishArray = [];
    for (let i = 0; i < 25; i++) {
      fishArray.push(new DistantFish(scene));
    }

    // Add atmospheric particles (more subtle)
    const particleCount = 400;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 60;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 50 - 10;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x3a6d7a,
      size: 0.03,
      transparent: true,
      opacity: 0.25,
      sizeAttenuation: true,
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Animation loop
    let animationId;
    const animate = (time) => {
      time *= 0.001;

      fishArray.forEach(fish => fish.animate(time));

      particles.rotation.y += 0.00008;
      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(time * 0.5 + i) * 0.0003;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Very subtle camera drift
      camera.position.x = Math.sin(time * 0.08) * 0.2;
      camera.position.y = Math.cos(time * 0.06) * 0.15;

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate(0);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
    };
  }, []);

  // Text animations
  useEffect(() => {
    const title = titleRef.current;
    const subtitle = subtitleRef.current;

    if (title && subtitle) {
      title.style.filter = "blur(35px) brightness(0.4)";
      title.style.transform = "scale(0.75) translateY(100px)";
      title.style.opacity = "0";
      
      subtitle.style.filter = "blur(35px) brightness(0.4)";
      subtitle.style.transform = "scale(0.75) translateY(100px)";
      subtitle.style.opacity = "0";

      setTimeout(() => {
        title.style.transition = "all 3.5s cubic-bezier(0.22, 1, 0.36, 1)";
        title.style.filter = "blur(0px) brightness(1)";
        title.style.transform = "scale(1) translateY(0)";
        title.style.opacity = "1";
      }, 100);

      setTimeout(() => {
        subtitle.style.transition = "all 3.5s cubic-bezier(0.22, 1, 0.36, 1)";
        subtitle.style.filter = "blur(0px) brightness(1)";
        subtitle.style.transform = "scale(1) translateY(0)";
        subtitle.style.opacity = "1";
      }, 500);
    }
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-[#000b14] flex items-center justify-center"
    >
      {/* BACKGROUND IMAGE */}
      <div className="absolute inset-0 z-0">
        <img
          src={HERO_IMAGE}
          alt="Submerged Vrindavan Temple"
          className="w-full h-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#000b14] via-transparent to-[#000b14]/30" />
        <div className="absolute inset-0 bg-cyan-900/25 mix-blend-overlay" />
      </div>

      {/* 3D FISH CANVAS - Distant silhouettes */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-5 pointer-events-none"
      />

      {/* BUBBLES */}
      <div className="absolute inset-0 z-5 pointer-events-none overflow-hidden">
        {bubbles.map((b) => (
          <div
            key={b.id}
            className="absolute bottom-0 rounded-full bg-white opacity-20"
            style={{
              left: `${b.left}%`,
              width: `${b.size}px`,
              height: `${b.size}px`,
              animation: `rise ${b.duration}s linear ${b.delay}s infinite`,
              filter: 'blur(1px)',
            }}
          />
        ))}
      </div>

      {/* LIGHT RAYS - More subtle */}
      <div className="absolute inset-0 z-5 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-2 h-full bg-gradient-to-b from-cyan-300/10 to-transparent opacity-40 blur-md" 
             style={{ animation: 'sway 10s ease-in-out infinite' }} />
        <div className="absolute top-0 left-1/2 w-2 h-full bg-gradient-to-b from-cyan-200/15 to-transparent opacity-50 blur-md" 
             style={{ animation: 'sway 9s ease-in-out infinite 1s' }} />
        <div className="absolute top-0 left-3/4 w-2 h-full bg-gradient-to-b from-cyan-300/10 to-transparent opacity-40 blur-md" 
             style={{ animation: 'sway 11s ease-in-out infinite 2s' }} />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <h1
          ref={titleRef}
          className="text-5xl md:text-7xl lg:text-8xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-100 leading-tight"
          style={{ 
            textShadow: '0 4px 25px rgba(0,255,255,0.3)',
            fontFamily: 'Georgia, serif'
          }}
        >
          Vrindavan
          <br />
          <span className="italic text-4xl md:text-6xl lg:text-7xl text-cyan-300/90">
            The Sunken Archives
          </span>
        </h1>

        <p
          ref={subtitleRef}
          className="mt-8 text-cyan-200/70 text-xs md:text-sm tracking-[0.4em] uppercase font-light"
        >
          Scroll to dive into eternal wisdom
        </p>
      </div>

      <style>{`
        @keyframes rise {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-50vh) translateX(15px);
            opacity: 0.3;
          }
          100% {
            transform: translateY(-100vh) translateX(-15px);
            opacity: 0;
          }
        }

        @keyframes sway {   
          0%, 100% {
            transform: translateX(0) scaleY(1);
            opacity: 0.4;
          }
          50% {
            transform: translateX(8px) scaleY(0.97);
            opacity: 0.5;
          }
        }
      `}</style>
    </section>
  );   
};

export default HeroSection;