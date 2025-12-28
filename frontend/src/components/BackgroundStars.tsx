'use client';

import React, { useMemo } from 'react';
import { PORTFOLIO_CONFIG } from '@/constants/portfolio';

export default function BackgroundStars() {
  const stars = useMemo(() => {
    return [...Array(PORTFOLIO_CONFIG.VISUAL.BACKGROUND_STAR_COUNT)].map(() => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      size:
        Math.random() *
          (PORTFOLIO_CONFIG.VISUAL.BACKGROUND_STAR_SIZE_MAX -
            PORTFOLIO_CONFIG.VISUAL.BACKGROUND_STAR_SIZE_MIN) +
        PORTFOLIO_CONFIG.VISUAL.BACKGROUND_STAR_SIZE_MIN,
      opacity:
        Math.random() *
          (PORTFOLIO_CONFIG.VISUAL.BACKGROUND_STAR_OPACITY_MAX -
            PORTFOLIO_CONFIG.VISUAL.BACKGROUND_STAR_OPACITY_MIN) +
        PORTFOLIO_CONFIG.VISUAL.BACKGROUND_STAR_OPACITY_MIN,
    }));
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute bg-white rounded-full"
          style={{
            width: star.size,
            height: star.size,
            top: `${star.top}%`,
            left: `${star.left}%`,
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  );
}
