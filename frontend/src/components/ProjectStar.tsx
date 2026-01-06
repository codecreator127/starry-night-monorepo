'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ProjectStar as ProjectStarType } from '@/types/portfolio';
import { PORTFOLIO_CONFIG } from '@/constants/portfolio';
import StarVisual from './StarVisual';

interface ProjectStarProps {
  project: ProjectStarType;
  viewport: { width: number; height: number };
  onClick: () => void;
  animationOffset: number;
  cameraScale: number;
}

export default function ProjectStar({
  project,
  viewport,
  onClick,
  animationOffset,
  cameraScale,
}: ProjectStarProps) {
  const starSize = PORTFOLIO_CONFIG.VISUAL.STAR_SIZE;
  const baseFontSize = Math.min(viewport.width, viewport.height) / 80;
  // Scale font size by camera scale, then counter-scale the element to keep visual size constant
  // For better clarity at lower scales, use a minimum scale factor to ensure high-resolution rendering
  const minScaleForClarity = 2;
  const effectiveScale = cameraScale > 1 ? Math.max(cameraScale, minScaleForClarity) : 1;
  const fontSize = baseFontSize * effectiveScale;
  const textScale = effectiveScale > 1 ? 1 / effectiveScale : 1;

  // Check if position is in pixels (absolute) or percentages (relative)
  // If values are > 100, they're likely pixels; otherwise percentages
  const isAbsolute = project.position.top > 100 || project.position.left > 100;
  const topStyle = isAbsolute ? `${project.position.top}px` : `${project.position.top}%`;
  const leftStyle = isAbsolute ? `${project.position.left}px` : `${project.position.left}%`;

  // Zoom animation - start from small scale and zoom in to create zoom effect
  const zoomScale = cameraScale > 1 ? cameraScale : 1;

  return (
    <motion.button
      className="absolute flex flex-col items-center justify-center cursor-pointer bg-transparent border-none p-0 rounded"
      style={{
        top: topStyle,
        left: leftStyle,
        transform: 'translate(-50%, -50%)',
        zIndex: 15,
      }}
      initial={{ scale: 0.3, opacity: 0 }}
      animate={{
        scale: zoomScale,
        opacity: 1,
        y: [0, Math.sin(animationOffset) * 2, 0],
      }}
      transition={{
        scale: {
          duration: PORTFOLIO_CONFIG.CAMERA.TRANSITION_DURATION,
          ease: PORTFOLIO_CONFIG.CAMERA.TRANSITION_EASE,
        },
        opacity: {
          duration: PORTFOLIO_CONFIG.CAMERA.TRANSITION_DURATION * 0.8,
          ease: PORTFOLIO_CONFIG.CAMERA.TRANSITION_EASE,
        },
        y: {
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`View ${project.event.title}`}
    >
      <div
        className="text-white text-xs select-none whitespace-nowrap pointer-events-none drop-shadow-sm -mb-2"
        style={{
          fontSize: `${fontSize}px`,
          transform: textScale !== 1 ? `scale(${textScale}) translateZ(0)` : 'translateZ(0)',
          transformOrigin: 'center top',
          textRendering: 'optimizeLegibility',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          backfaceVisibility: 'hidden',
          willChange: 'transform',
        }}
      >
        {project.event.title}
      </div>

      <motion.div
        className="hover:scale-150 transition-transform duration-300"
        style={{
          width: `${starSize}px`,
          height: `${starSize}px`,
          // Ensure the visual is centered within this container
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <StarVisual size={starSize} />
      </motion.div>
    </motion.button>
  );
}
