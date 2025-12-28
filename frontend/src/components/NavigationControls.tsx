'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { ViewState } from '@/types/portfolio';

interface NavigationControlsProps {
  viewState: ViewState;
  onBack: () => void;
}

export default function NavigationControls({ viewState, onBack }: NavigationControlsProps) {
  const showBack = viewState !== 'OVERVIEW';

  return (
    <AnimatePresence>
      {showBack && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          onClick={onBack}
          className="fixed top-6 left-6 z-50 bg-white/10 backdrop-blur-md text-white px-4 py-2.5 rounded-lg hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black flex items-center gap-2 shadow-lg"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
