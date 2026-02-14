'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Github, ExternalLink } from 'lucide-react';
import { Event } from '@/data/event';

interface EventDisplayProps {
  event: Event;
  onClose: () => void;
}

interface ParsedContent {
  overview: string;
  keyFeatures: string[];
  techStack: string[];
}

/**
 * Parses the description text into structured sections
 */
function parseDescription(description: string): ParsedContent {
  const techStackMatch = description.match(/[Tt]ech\s+[Ss]tack:\s+([^.]+)/);
  const techStack = techStackMatch
    ? techStackMatch[1]
        .split(',')
        .map((tech) => tech.trim())
        .filter(Boolean)
    : [];

  const cleanDescription = description.replace(/[Tt]ech\s+[Ss]tack:\s+[^.]+\.?/g, '').trim();
  const sentences = cleanDescription.match(/[^.!?]+[.!?]+/g) || [cleanDescription];
  const overview = sentences.slice(0, 2).join(' ').trim();

  const featuresMatch = cleanDescription.match(
    /Key features:\s*([\s\S]*?)(?:\.?\s*(?:Tech stack:|$))/i,
  );

  let keyFeatures: string[] = [];

  if (featuresMatch) {
    const featuresText = featuresMatch[1];
    keyFeatures = featuresText
      .split(/[,;]|and(?=\s+[A-Z])/)
      .map((f) => f.trim())
      .filter((f) => f.length > 10 && f.length < 100)
      .slice(0, 5);
  } else {
    const middleSentences = sentences.slice(1, Math.min(4, sentences.length - 1));
    keyFeatures = middleSentences
      .filter((s) => {
        const lower = s.toLowerCase();
        return (
          (lower.includes('allow') && lower.includes('to')) ||
          (lower.includes('enable') && lower.includes('to')) ||
          (lower.includes('feature') && lower.length > 30) ||
          (lower.includes('include') && lower.length > 30)
        );
      })
      .map((s) => {
        let cleaned = s.trim();
        cleaned = cleaned.replace(/^(it|this|the)\s+/i, '');
        cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        return cleaned;
      })
      .slice(0, 4);
  }

  const finalOverview =
    overview ||
    (description.length > 0 ? description.split(/[.!?]/)[0] + '.' : 'Project overview.');

  return { overview: finalOverview, keyFeatures, techStack };
}

function Section({
  title,
  children,
  className = '',
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`${className}`}>
      {title && <h3 className="text-lg font-semibold text-white mb-3 drop-shadow-sm">{title}</h3>}
      <div className="text-white/90 leading-relaxed">{children}</div>
    </div>
  );
}

function ActionButton({
  href,
  icon: Icon,
  label,
  disabled = false,
}: {
  href?: string | null;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  disabled?: boolean;
}) {
  if (disabled || !href) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 text-gray-500 cursor-not-allowed border border-gray-700/50"
        aria-label={`${label} (unavailable)`}
      >
        <Icon size={20} />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20 hover:border-white/30"
      aria-label={label}
    >
      <Icon size={20} />
      <span>{label}</span>
    </a>
  );
}

export default function EventDisplay({ event, onClose }: EventDisplayProps) {
  const { title, description, imageUrl, videoUrl, githubUrl, liveUrl } = event;
  const content = parseDescription(description);
  const [isImageOpen, setIsImageOpen] = useState(false);

  // ESC key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const } },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-black/80 flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative flex flex-col w-full max-w-5xl bg-black/70 backdrop-blur-md rounded-2xl overflow-hidden my-8 border border-white/5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="relative px-5 sm:px-6 pt-6 pb-5 border-b border-white/10"
        >
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-tight pr-10">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-2.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all border border-white/0 hover:border-white/10"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <ActionButton
              href={githubUrl}
              icon={Github}
              label="View GitHub"
              disabled={!githubUrl}
            />
            <ActionButton
              href={liveUrl}
              icon={ExternalLink}
              label="Live Demo"
              disabled={!liveUrl}
            />
          </div>
        </motion.div>

        {/* Content + Media */}
        <div className="flex flex-col lg:flex-row gap-8 p-6 sm:p-8">
          {/* Media */}
          {(imageUrl || videoUrl) && (
            <motion.div
              variants={itemVariants}
              className="order-1 lg:order-2 flex-shrink-0 lg:w-96 mb-2 lg:mb-0"
            >
              <div className="sticky top-6">
                <div
                  className={`w-full aspect-video bg-black/50 rounded-xl overflow-hidden flex items-center justify-center border border-white/10 ${imageUrl ? 'cursor-zoom-in' : ''} group relative`}
                  onClick={() => imageUrl && setIsImageOpen(true)}
                >
                  <AnimatePresence mode="wait">
                    {imageUrl && (
                      <motion.img
                        key="image"
                        src={imageUrl}
                        alt={`${title} screenshot`}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    {videoUrl && !imageUrl && (
                      <motion.video
                        key="video"
                        src={videoUrl}
                        controls
                        className="w-full h-full object-contain"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </AnimatePresence>

                  {imageUrl && (
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-medium border border-white/20">
                        Click to expand
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Text Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="order-2 lg:order-1 flex-1 space-y-8"
          >
            <motion.div variants={itemVariants}>
              <Section title="Overview">
                <p className="max-w-[60ch] text-lg text-white/80 leading-relaxed font-light">
                  {content.overview}
                </p>
              </Section>
            </motion.div>

            {content.keyFeatures.length > 0 && (
              <motion.div variants={itemVariants}>
                <Section title="Key Features">
                  <ul className="grid grid-cols-1 gap-3 max-w-[60ch]">
                    {content.keyFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3 text-white/80">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              </motion.div>
            )}

            {content.techStack.length > 0 && (
              <motion.div variants={itemVariants}>
                <Section title="Tech Stack">
                  <div className="flex flex-wrap gap-2.5 max-w-[60ch]">
                    {content.techStack.map((tech, index) => (
                      <span
                        key={index}
                        className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/90 text-sm border border-white/10 transition-colors"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </Section>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Fullscreen Image Overlay - Moved outside the modal content to escape transform constraints */}
      <AnimatePresence>
        {isImageOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-6 md:p-12 lg:p-20"
            onClick={() => setIsImageOpen(false)}
          >
            <motion.img
              src={imageUrl ?? ''}
              alt={`${title} fullscreen`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="max-w-full max-h-full object-contain cursor-zoom-out shadow-2xl rounded-sm"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              onClick={() => setIsImageOpen(false)}
              className="absolute top-8 right-8 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10 hover:scale-110 active:scale-95"
              aria-label="Close fullscreen view"
            >
              <X size={28} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
