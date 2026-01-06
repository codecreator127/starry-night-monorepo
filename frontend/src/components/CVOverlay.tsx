'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface CVOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CVOverlay({ isOpen, onClose }: CVOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-white text-black p-4 rounded-lg w-[95vw] h-[95vh] overflow-hidden flex flex-col relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white text-black p-2 rounded-full shadow-md transition-all hover:scale-105 focus:outline-none"
              aria-label="Close CV"
            >
              <X size={24} />
            </button>
            <div className="flex-1 w-full h-full relative">
              <iframe
                src="/cv.pdf#view=FitH"
                className="w-full h-full border-0 absolute inset-0"
                title="Curriculum Vitae"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
