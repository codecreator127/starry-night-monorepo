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
            className="bg-white text-black p-6 rounded-lg max-w-4xl w-full h-[90vh] overflow-auto flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-black hover:text-gray-600 transition focus:outline-none focus:ring-2 focus:ring-black rounded"
              aria-label="Close CV"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-4">Curriculum Vitae</h2>
            <div className="flex-1 flex items-center justify-center overflow-auto">
              <iframe
                src="/cv.pdf#view=FitV"
                className="w-full h-full border-0"
                title="Curriculum Vitae"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
