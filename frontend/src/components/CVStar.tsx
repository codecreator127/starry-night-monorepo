'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CVData } from '@/types/portfolio';
import { PORTFOLIO_CONFIG } from '@/constants/portfolio';
import StarVisual from './StarVisual';

interface CVStarProps {
  cv: CVData;
  viewport: { width: number; height: number };
  onClick: () => void;
}

export default function CVStar({ cv, viewport, onClick }: CVStarProps) {
  const baseSize = PORTFOLIO_CONFIG.VISUAL.CV_STAR_SIZE;
  const MIN_SIZE = 10;
  const MAX_SIZE = 40;

  const scaleFactor = Math.min(
    viewport.width / PORTFOLIO_CONFIG.REFERENCE_WIDTH,
    viewport.height / PORTFOLIO_CONFIG.REFERENCE_HEIGHT,
  );

  const scaledSize = Math.max(
    MIN_SIZE,
    Math.min(MAX_SIZE, baseSize * scaleFactor * PORTFOLIO_CONFIG.VISUAL.NEBULA_SIZE_MULTIPLIER),
  );

  // The simplified StarVisual renders the core at 'size'.
  // We want the visual weight to match the previous Three.js sphere which was ~1/3 of the container.
  // So we pass a size ~1/2 to 2/3 of scaledSize to mimic the visual impact, or just use scaledSize and let the glow expand?
  // Previous: scaledSize was the canvas size. Star diameter was ~1/3 of view height.
  // View height was ~3 units (tan(37.5) * 2 * 2). Star diameter 1.
  // So star core is roughly 1/3 of canvas.
  const starCoreSize = scaledSize * 0.35;

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
        className="pointer-events-auto focus:outline-none flex items-center justify-center"
        style={{
          width: `${scaledSize}px`,
          height: `${scaledSize}px`,
          background: 'transparent',
          padding: 0,
          border: 'none',
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
      >
        <StarVisual size={starCoreSize} />
      </motion.button>

      <div
        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-white font-medium opacity-80 select-none"
        style={{
          top: '-1.7rem',
          fontSize: `${fontSize}px`,
        }}
      >
        {cv.title}
      </div>
    </div>
  );
}
