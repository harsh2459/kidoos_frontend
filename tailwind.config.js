/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: 'class',
  content: {
    files: ["./src/**/*.{js,jsx,ts,tsx}"],
    options: {
      safelist: [],
    },
  },
  theme: {
    // ========== CUSTOM RESPONSIVE BREAKPOINTS (480px - 2560px) ==========
    screens: {
      'xs': '480px',    // Mobile devices (minimum)
      'sm': '640px',    // Small tablets
      'md': '768px',    // Tablets
      'lg': '1024px',   // Large tablets / Small laptops
      'xl': '1280px',   // Desktops
      '2xl': '1440px',  // Large desktops
      '3xl': '1920px',  // Full HD screens
      '4xl': '2560px',  // Ultra-wide / QHD (maximum)
    },
    extend: {
      borderRadius: {
        theme: "var(--radius)",
      },
      boxShadow: {
        theme: "var(--shadow)",
      },
      colors: {
        // Semantic color tokens powered by CSS variables
        // Reference these in components as text-fg, bg-surface, border-subtle, etc.
        brand: {
          DEFAULT: "hsl(var(--brand))",
          foreground: "hsl(var(--brand-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        fg: {
          DEFAULT: "hsl(var(--fg))", // main foreground
          muted: "hsl(var(--fg-muted))",
          subtle: "hsl(var(--fg-subtle))",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))", // app background
          subtle: "hsl(var(--surface-subtle))", // section bg like gray-50
          raised: "hsl(var(--surface-raised))", // cards
        },
        border: {
          DEFAULT: "hsl(var(--border))",
          subtle: "hsl(var(--border-subtle))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          soft: "hsl(var(--success-soft))",
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          foreground: "hsl(var(--danger-foreground))",
          soft: "hsl(var(--danger-soft))",
        },
        // Admin-specific theme colors - Stormy Morning Blue Palette
        admin: {
          dark: {
            DEFAULT: "#384959",    // Dark slate - primary
            light: "#6A89A7",      // Steel blue - secondary/hover
          },
          accent: {
            DEFAULT: "#88BDF2",    // Sky blue - accent color
            foreground: "#BDDDFC", // Ice blue for text on accent
          },
          surface: {
            light: "#BDDDFC",      // Ice blue backgrounds
            dark: "#384959",       // Dark backgrounds
          }
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'serif'],
      },
      maxWidth: {
        container: "var(--container)",
      },
      // ========== RESPONSIVE SPACING & SIZING ==========
      spacing: {
        'xs': '0.5rem',   // 8px
        'sm': '0.75rem',  // 12px
        'md': '1rem',     // 16px
        'lg': '1.5rem',   // 24px
        'xl': '2rem',     // 32px
        '2xl': '3rem',    // 48px
        '3xl': '4rem',    // 64px
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],     // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }], // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],    // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }], // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],  // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],     // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],  // 36px
        '5xl': ['3rem', { lineHeight: '1' }],          // 48px
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    // Define light theme variables in :root so changing theme is centralized
    function ({ addBase }) {
      addBase({
        ':root': {
          // App dimensions and shapes
          '--radius': '0.75rem',
          '--shadow': '0 1px 2px 0 rgb(0 0 0 / 0.06), 0 1px 3px 1px rgb(0 0 0 / 0.06)',
          '--container': '1280px',

          // Typography
          '--font-sans': 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, Noto Sans, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',

          // White theme palette (HSL)
          '--surface': '0 0% 100%', // white
          '--surface-subtle': '210 40% 98%', // gray-50-ish
          '--surface-raised': '0 0% 100%',
          '--fg': '220 13% 15%', // gray-900
          '--fg-muted': '215 16% 35%', // gray-600
          '--fg-subtle': '215 13% 55%', // gray-400
          '--border': '210 18% 87%', // gray-200
          '--border-subtle': '214 32% 91%', // gray-100
          '--brand': '221 39% 11%', // slate-900
          '--brand-foreground': '0 0% 100%', // white
          '--accent': '221 39% 11%',
          '--accent-foreground': '0 0% 100%',
          '--success': '152 76% 36%', // emerald-600
          '--success-foreground': '0 0% 100%',
          '--success-soft': '151 81% 95%', // emerald-100
          '--danger': '0 72% 51%', // red-600
          '--danger-foreground': '0 0% 100%',
          '--danger-soft': '0 86% 97%', // red-100
        },
        // ========== RESPONSIVE CONTAINER ADJUSTMENTS ==========
        '@media (min-width: 480px)': {
          ':root': {
            '--container': '100%',
          }
        },
        '@media (min-width: 768px)': {
          ':root': {
            '--container': '720px',
          }
        },
        '@media (min-width: 1024px)': {
          ':root': {
            '--container': '960px',
          }
        },
        '@media (min-width: 1280px)': {
          ':root': {
            '--container': '1200px',
          }
        },
        '@media (min-width: 1440px)': {
          ':root': {
            '--container': '1320px',
          }
        },
        '@media (min-width: 1920px)': {
          ':root': {
            '--container': '1800px',
          }
        },
        '@media (min-width: 2560px)': {
          ':root': {
            '--container': '2400px',
          }
        },
        '.dark': {
          // Provide dark fallback vars for future use (won't be used now)
          '--surface': '222 47% 11%',
          '--surface-subtle': '222 47% 7%',
          '--surface-raised': '222 47% 13%',
          '--fg': '210 40% 98%',
          '--fg-muted': '215 20% 84%',
          '--fg-subtle': '215 16% 65%',
          '--border': '217 19% 27%',
          '--border-subtle': '215 14% 34%',
          '--brand': '210 40% 96%',
          '--brand-foreground': '222 47% 11%',
          '--accent': '210 40% 96%',
          '--accent-foreground': '222 47% 11%',
          '--success': '152 76% 36%',
          '--success-foreground': '0 0% 100%',
          '--success-soft': '151 61% 20%',
          '--danger': '0 72% 51%',
          '--danger-foreground': '0 0% 100%',
          '--danger-soft': '0 62% 20%',
        },
      })
    },
  ],
};
