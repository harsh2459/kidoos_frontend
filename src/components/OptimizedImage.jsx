import React from 'react';

/**
 * OptimizedImage - Automatically serves WebP with responsive srcset
 *
 * Handles:
 * - WebP format with PNG/JPG fallback
 * - Responsive images (400w, 800w, 1200w, 1920w)
 * - Lazy loading (unless priority=true)
 * - Preload hints for LCP images
 *
 * @param {string} src - Image path (e.g., "/images/hero.png")
 * @param {string} alt - Alt text (required for accessibility)
 * @param {boolean} priority - If true, uses loading="eager" and fetchpriority="high" (for LCP images)
 * @param {string} sizes - Responsive sizes (default: "100vw")
 * @param {string} className - CSS classes
 * @param {object} style - Inline styles
 */
export default function OptimizedImage({
  src,
  alt,
  priority = false,
  sizes = "100vw",
  className = "",
  style = {},
  ...props
}) {
  // Skip optimization if src is already WebP or external URL
  if (!src || src.includes('.webp') || src.startsWith('http')) {
    return (
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        className={className}
        style={style}
        {...props}
      />
    );
  }

  // Convert /images/hero.png -> /images-optimized/hero
  const isOptimizedPath = src.includes('/images/');
  if (!isOptimizedPath) {
    // Not in images directory, use as-is
    return (
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        className={className}
        style={style}
        {...props}
      />
    );
  }

  const basePath = src
    .replace(/^\/images\//, '/images-optimized/')
    .replace(/\.(png|jpg|jpeg)$/i, '');

  const widths = [400, 800, 1200, 1920];

  // Generate srcset for WebP
  const webpSrcSet = widths
    .map(w => `${basePath}-${w}w.webp ${w}w`)
    .join(', ');

  return (
    <picture>
      {/* WebP source with responsive sizes */}
      <source
        type="image/webp"
        srcSet={webpSrcSet}
        sizes={sizes}
      />

      {/* Fallback to original image for browsers that don't support WebP */}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className={className}
        style={style}
        {...props}
      />
    </picture>
  );
}

/**
 * OptimizedBackgroundImage - For background images using CSS
 *
 * @param {string} src - Image path
 * @param {React.ReactNode} children - Child elements
 * @param {string} className - CSS classes
 * @param {object} style - Additional inline styles
 */
export function OptimizedBackgroundImage({
  src,
  children,
  className = "",
  style = {},
  ...props
}) {
  // Convert to WebP path
  const webpPath = src
    .replace(/^\/images\//, '/images-optimized/')
    .replace(/\.(png|jpg|jpeg)$/i, '-1200w.webp');

  const backgroundStyle = {
    ...style,
    backgroundImage: `url('${webpPath}')`,
    // Fallback for browsers without WebP support
    backgroundImage: `
      image-set(
        url('${webpPath}') 1x,
        url('${src}') 1x
      )
    `.trim(),
  };

  return (
    <div
      className={className}
      style={backgroundStyle}
      {...props}
    >
      {children}
    </div>  
  );
}
