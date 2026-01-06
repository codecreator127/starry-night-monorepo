'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface StarVisualProps {
  /** Diameter of the white core star in pixels */
  size: number;
  /** Base color for the glow (default: #ffa500) */
  color?: string;
  className?: string;
}

export default function StarVisual({ size, color = '#ffa500', className = '' }: StarVisualProps) {
  // Glow sizes relative to core
  const glow1Size = size * 1.5; // ~150%
  const glow2Size = size * 2.2; // ~220%

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer Glow (Layer 2) */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: glow2Size,
          height: glow2Size,
          backgroundColor: color,
          opacity: 0.2,
          filter: 'blur(4px)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.25, 0.2],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.1,
        }}
      />

      {/* Inner Glow (Layer 1) */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: glow1Size,
          height: glow1Size,
          backgroundColor: color,
          opacity: 0.4,
          filter: 'blur(2px)',
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.4, 0.5, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Core Star */}
      <motion.div
        className="absolute bg-white rounded-full z-10"
        style={{
          width: size,
          height: size,
          boxShadow: `0 0 ${size * 0.5}px ${size * 0.2}px rgba(255, 255, 255, 0.8)`,
        }}
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
