// WaveText.jsx - Reusable Wave Animation Component
import React, { useState } from 'react';

/**
 * WaveText Component
 * Creates a wave animation effect on hover where each character bounces up and down
 * 
 * @param {string} text - The text to animate
 * @param {string} className - Additional CSS classes for the wrapper
 * @param {string} hoverColor - Color when hovered (default: '#F59E0B')
 * @param {number} waveHeight - How high the wave goes in px (default: 8)
 * @param {number} waveDuration - Animation duration in seconds (default: 0.6)
 * @param {number} charDelay - Delay between each character in seconds (default: 0.05)
 * @param {boolean} isHovered - External hover control (optional)
 * @param {function} onMouseEnter - External mouse enter handler (optional)
 * @param {function} onMouseLeave - External mouse leave handler (optional)
 */
const WaveText = ({ 
  text, 
  className = '', 
  hoverColor = '#F59E0B',
  waveHeight = 8,
  waveDuration = 0.6,
  charDelay = 0.05,
  isHovered: externalIsHovered,
  onMouseEnter: externalOnMouseEnter,
  onMouseLeave: externalOnMouseLeave
}) => {
  const [internalIsHovered, setInternalIsHovered] = useState(false);
  
  // Use external hover state if provided, otherwise use internal
  const isHovered = externalIsHovered !== undefined ? externalIsHovered : internalIsHovered;

  const handleMouseEnter = () => {
    if (externalOnMouseEnter) {
      externalOnMouseEnter();
    } else {
      setInternalIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (externalOnMouseLeave) {
      externalOnMouseLeave();
    } else {
      setInternalIsHovered(false);
    }
  };

  return (
    <>
      <span 
        className={`inline-block cursor-default ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {text.split('').map((char, index) => (
          <span
            key={index}
            className="inline-block"
            style={{
              animation: isHovered ? `wave-${waveHeight} ${waveDuration}s ease-in-out ${index * charDelay}s` : 'none',
              color: isHovered ? hoverColor : 'inherit',
              transition: 'color 0.3s ease'
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>
      
      <style>{`
        @keyframes wave-${waveHeight} {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-${waveHeight}px); }
        }
      `}</style>
    </>
  );
};

export default WaveText;

// ============================================
// USAGE EXAMPLES
// ============================================

/*

// Example 1: Basic Usage (Internal Hover)
import WaveText from './components/WaveText';

<WaveText text="Hello World" />


// Example 2: With External Hover Control (Like your GitaBentoGrid)
const [hoveredTitle, setHoveredTitle] = useState(null);

<h3 
  onMouseEnter={() => setHoveredTitle('curriculum')}
  onMouseLeave={() => setHoveredTitle(null)}
>
  <WaveText 
    text="A Curriculum for Life" 
    isHovered={hoveredTitle === 'curriculum'} 
  />
</h3>


// Example 3: With Custom Styling
<WaveText 
  text="Hover Over Me" 
  className="text-4xl font-bold"
/>


// Example 4: Custom Wave Effect
<WaveText 
  text="Custom Wave" 
  hoverColor="#3B82F6"
  waveHeight={12}
  waveDuration={0.8}
  charDelay={0.08}
/>


// Example 5: In a Button
<button className="px-6 py-3 bg-blue-500 text-white rounded-lg">
  <WaveText text="Click Me" hoverColor="#FFFFFF" />
</button>


// Example 6: In a Heading
<h1 className="text-5xl font-serif">
  <WaveText text="Welcome to Our Site" />
</h1>


// Example 7: Multiple Words with Different Colors
<div>
  <WaveText text="Creative" hoverColor="#8B5CF6" />
  <span> & </span>
  <WaveText text="Innovative" hoverColor="#F59E0B" />
</div>


// Example 8: In Your Tags (Like the Gita Hero)
{['Focus', 'Confidence', 'Empathy'].map((tag) => (
  <span 
    key={tag} 
    className="px-5 py-2 bg-white border rounded-full"
  >
    <WaveText text={tag} />
  </span>
))}

*/