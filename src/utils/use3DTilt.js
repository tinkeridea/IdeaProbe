import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Lightweight hook for subtle, performant 3D mouse tilt.
 * Honors prefers-reduced-motion and touch devices.
 */
export function use3DTilt({
  maxTilt = 6,
  scale = 1.015,
  perspective = 1000,
  speed = 200,
  disabled = false,
} = {}) {
  const ref = useRef(null);
  const [style, setStyle] = useState({});
  const [isHovered, setIsHovered] = useState(false);
  const isReducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      isReducedMotion.current = mediaQuery.matches;
      const handleChange = (e) => {
        isReducedMotion.current = e.matches;
      };
      mediaQuery.addEventListener?.('change', handleChange);
      return () => mediaQuery.removeEventListener?.('change', handleChange);
    }
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (disabled || isReducedMotion.current || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const clientX = e.clientX;
      const clientY = e.clientY;

      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

      const tiltX = ((y - 0.5) * -2 * maxTilt).toFixed(2);
      const tiltY = ((x - 0.5) * 2 * maxTilt).toFixed(2);

      setStyle({
        transform: `perspective(${perspective}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${scale}, ${scale}, 1)`,
        transition: 'transform 80ms ease-out',
        willChange: 'transform',
      });
    },
    [disabled, maxTilt, scale, perspective]
  );

  const handleMouseEnter = useCallback(() => {
    if (disabled || isReducedMotion.current) return;
    setIsHovered(true);
  }, [disabled]);

  const handleMouseLeave = useCallback(() => {
    if (disabled || isReducedMotion.current) return;
    setIsHovered(false);
    setStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: `transform ${speed}ms cubic-bezier(0.2, 0, 0.2, 1)`,
      willChange: 'auto',
    });
  }, [disabled, perspective, speed]);

  return {
    ref,
    tiltStyle: style,
    isHovered,
    tiltProps: {
      ref,
      style,
      onMouseMove: handleMouseMove,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  };
}

export default use3DTilt;
