'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CVData } from '@/types/portfolio';
import { PORTFOLIO_CONFIG } from '@/constants/portfolio';

interface CVStarProps {
  cv: CVData;
  viewport: { width: number; height: number };
  onClick: () => void;
}

export default function CVStar({ cv, viewport, onClick }: CVStarProps) {
  const baseSize = PORTFOLIO_CONFIG.VISUAL.CV_STAR_SIZE;
  // Responsive scaling for nebula
  const MIN_SIZE = 10; // minimum size in px
  const MAX_SIZE = 40; // maximum size in px

  // scale proportionally to width but also consider height
  const scaleFactor = Math.min(
    viewport.width / PORTFOLIO_CONFIG.REFERENCE_WIDTH,
    viewport.height / PORTFOLIO_CONFIG.REFERENCE_HEIGHT,
  );

  // apply base size and clamp
  const scaledSize = Math.max(
    MIN_SIZE,
    Math.min(MAX_SIZE, baseSize * scaleFactor * PORTFOLIO_CONFIG.VISUAL.NEBULA_SIZE_MULTIPLIER),
  );

  const fontSize =
    12 * Math.min(viewport.width / PORTFOLIO_CONFIG.REFERENCE_WIDTH, viewport.height / 400);

  return (
    <div
      className="absolute"
      style={{
        top: '52%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <motion.button
        className="bg-blue-400 rounded-full pointer-events-auto hover:scale-125 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-black shadow-lg shadow-blue-400/50"
        style={{
          width: `${scaledSize}px`,
          height: `${scaledSize}px`,
        }}
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.95, 1, 0.95],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: [0.4, 0, 0.6, 1],
        }}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        aria-label={`View ${cv.title}`}
      />
      <div
        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-white font-medium opacity-80 select-none"
        style={{
          top: '-1.5rem',
          fontSize: `${fontSize}px`,
        }}
      >
        {cv.title}
      </div>
    </div>
  );
}
