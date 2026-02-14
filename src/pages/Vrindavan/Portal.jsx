import React, { useState } from "react";
import { useNavigate ,Link } from "react-router-dom";
import WaterTransition from "./WaterTransition";


// ===============================
// ASSETS
// ===============================
const VIDEO_PATH = "/videos/final_image_portel.mp4";

const ORBS = {
  blue: {
    src: "/images-webp/vrundaven/blue_orb.webp",
    label: "WATER CONSCIOUSNESS",
    path: "/water-1",
  },
  fire: {
    src: "/images-webp/vrundaven/fire_orb.webp",
    label: "SOLAR POWER",
    path: "/solar-power",
  },
  green: {
    src: "/images-webp/vrundaven/green_orb.webp",
    label: "LIFE FORCE",
    path: "/life-force",
  },
  yellow: {
    src: "/images-webp/vrundaven/yellow_orb.webp",
    label: "SOLAR WISDOM",
    path: "/solar-wisdom",
  },
};

// ===============================
// NORMAL ORB (LINK)
// ===============================
const OrbLink = ({ src, label, path }) => {
  return (
    <Link
      to={path}
      className="relative inline-flex flex-col items-center group mx-1"
    >
      <img
        src={src}
        alt={label}
        className="w-8 h-8 md:w-12 md:h-12 lg:w-14 lg:h-14 object-contain"
      />
      <span className="absolute top-full mt-2 px-3 py-1 rounded-full bg-black/80 text-[10px] tracking-widest uppercase text-white opacity-0 group-hover:opacity-100 transition">
        {label}
      </span>
    </Link>
  );
};

// ===============================
// BLUE ORB (PORTAL TRIGGER)
// ===============================
const OrbButton = ({ src, label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="relative inline-flex flex-col items-center group mx-1"
    >
      <img
        src={src}
        alt={label}
        className="w-8 h-8 md:w-12 md:h-12 lg:w-14 lg:h-14 object-contain"
      />
      <span className="absolute top-full mt-2 px-3 py-1 rounded-full bg-black/80 text-[10px] tracking-widest uppercase text-white opacity-0 group-hover:opacity-100 transition">
        {label}
      </span>
    </button>
  );
};

// ===============================
// PORTAL PAGE
// ===============================
const Portal = () => {
  const navigate = useNavigate();
  const [waterActive, setWaterActive] = useState(false);

  const enterWaterPortal = () => {
    setWaterActive(true);

    setTimeout(() => {
      navigate("/water-1");
    }, 1400);
  };

  return (
    <div className="w-screen h-screen bg-black overflow-hidden">
      {/* BACKGROUND VIDEO */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-90"
      >
        <source src={VIDEO_PATH} type="video/mp4" />
      </video>

      {/* VIGNETTE */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.7)_100%)] z-10" />

      {/* CONTENT */}
      <div className="relative z-20 w-full h-full flex items-center justify-center text-center px-6">
        <div>
          <h1 className="flex flex-wrap items-center justify-center text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-400 drop-shadow-lg">
            <span>R</span>

            {/* BLUE + FIRE */}
            <OrbButton
              src={ORBS.blue.src}
              label={ORBS.blue.label}
              onClick={enterWaterPortal}
            />
            <OrbLink {...ORBS.fire} />

            <span>ts</span>
            <span className="mx-2" />

            {/* GREEN */}
            <OrbLink {...ORBS.green} />
            <span>f</span>
            <span className="mx-2" />

            {/* YELLOW */}
            <span>W</span>
            <OrbLink {...ORBS.yellow} />
            <span>isdom</span>
          </h1>

          <p className="text-blue-100/50 tracking-[0.4em] text-[10px] md:text-xs uppercase mt-6">
            AN INTERACTIVE LIVING EXPERIENCE
          </p>
        </div>
      </div>

      {/* WATER TRANSITION */}
      <WaterTransition active={waterActive} />
    </div>
  );
};

export default Portal;
