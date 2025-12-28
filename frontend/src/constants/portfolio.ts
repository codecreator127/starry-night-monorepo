// Portfolio configuration constants
export const PORTFOLIO_CONFIG = {
  // Camera settings
  CAMERA: {
    OVERVIEW_SCALE: 1,
    NEBULA_SCALE: 3,
    DETAIL_SCALE: 6,
    TRANSITION_DURATION: 1,
    TRANSITION_EASE: [0.25, 0.1, 0.25, 1] as [number, number, number, number], // smoother ease-in-out
    PADDING_FACTOR: 0.15, // padding to ensure elements stay on screen
  },

  // Layout settings
  LAYOUT: {
    CV_POSITION: { top: 50, left: 50 }, // percentage - centered
    NEBULA_RADIUS: 32, // distance from CV star in percentage (slightly tighter for better balance)
    INTRA_CLUSTER_RADIUS_MIN: 8,
    INTRA_CLUSTER_RADIUS_MAX: 15,
    INTRA_CLUSTER_RADIUS_MULTIPLIER: 2.2, // slightly more spacing between projects
  },

  // Visual settings
  VISUAL: {
    CV_STAR_SIZE: 8, // base size in pixels
    NEBULA_SIZE_MULTIPLIER: 5,
    STAR_SIZE: 8,
    BACKGROUND_STAR_COUNT: 100, // reduced from 150
    BACKGROUND_STAR_SIZE_MIN: 1,
    BACKGROUND_STAR_SIZE_MAX: 3,
    BACKGROUND_STAR_OPACITY_MIN: 0.2,
    BACKGROUND_STAR_OPACITY_MAX: 1,
  },

  // Nebula cluster metadata
  CLUSTERS: {
    1: { name: 'Hackathons', color: 'from-purple-500 via-pink-500 to-blue-500' },
    2: { name: 'Startups', color: 'from-blue-500 via-cyan-500 to-teal-500' },
    3: { name: 'Work', color: 'from-orange-500 via-red-500 to-pink-500' },
  },

  // Reference dimensions for scaling
  REFERENCE_WIDTH: 400,
  REFERENCE_HEIGHT: 800,
} as const;
