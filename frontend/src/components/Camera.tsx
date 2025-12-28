'use client';

import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { CameraState } from '@/types/portfolio';
import { PORTFOLIO_CONFIG } from '@/constants/portfolio';

interface CameraProps {
  camera: CameraState;
  children: React.ReactNode;
  className?: string;
}

export default function Camera({ camera, children, className = '' }: CameraProps) {
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const motionProps: MotionProps = {
    style: {
      transformOrigin: 'center center',
      willChange: 'transform', // performance hint
    },
    animate: {
      scale: camera.scale,
      x: camera.x,
      y: camera.y,
    },
    transition: prefersReducedMotion
      ? { duration: 0 }
      : {
          duration: PORTFOLIO_CONFIG.CAMERA.TRANSITION_DURATION,
          ease: PORTFOLIO_CONFIG.CAMERA.TRANSITION_EASE,
        },
  };

  return (
    <motion.div className={`absolute top-0 left-0 w-full h-full ${className}`} {...motionProps}>
      {children}
    </motion.div>
  );
}
