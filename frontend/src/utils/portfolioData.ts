import { Event } from '@/data/event';
import { CVData, NebulaCluster, ProjectStar, Position } from '@/types/portfolio';
import { PORTFOLIO_CONFIG } from '@/constants/portfolio';

/**
 * Arranges n points in a regular polygon pattern centered at the given center (absolute pixels)
 * @param count Number of points
 * @param centerX Center X position in pixels
 * @param centerY Center Y position in pixels
 * @param radius Radius from center in pixels
 * @returns Array of positions in pixels
 */
export function arrangeInPolygonAbsolute(
  count: number,
  centerX: number,
  centerY: number,
  radius: number,
): Position[] {
  if (count === 0) return [];
  if (count === 1) return [{ left: centerX, top: centerY }];

  const positions: Position[] = [];
  // Start from top (-90 degrees) and distribute evenly
  const startAngle = -Math.PI / 2;

  for (let i = 0; i < count; i++) {
    // Calculate angle for each point
    const angle = startAngle + (2 * Math.PI * i) / count;
    positions.push({
      left: centerX + radius * Math.cos(angle),
      top: centerY + radius * Math.sin(angle),
    });
  }

  return positions;
}

export function generatePortfolioData(
  events: Event[],
  viewport: { width: number; height: number },
): {
  cv: CVData;
  nebulae: NebulaCluster[];
} {
  // CV is always centered regardless of config
  const cv: CVData = {
    id: 'cv',
    position: { top: 50, left: 50 }, // Always centered
    title: 'Curriculum Vitae',
  };

  if (events.length === 0 || viewport.width === 0) {
    return { cv, nebulae: [] };
  }

  // CV is always centered at 50%, 50%
  // Add a small leftward offset to center the triangle visually
  const centerX = 50;
  const centerY = 50;

  // Group events by clusterId
  const clusters = new Map<number, Event[]>();
  events.forEach((event) => {
    if (!clusters.has(event.clusterId)) {
      clusters.set(event.clusterId, []);
    }
    clusters.get(event.clusterId)!.push(event);
  });

  const sortedClusterIds = [...clusters.keys()].sort((a, b) => a - b);
  // Calculate equilateral triangle positions centered on screen
  // Work in absolute pixels to ensure true equilateral triangle
  const centerXpx = viewport.width * 0.5;
  const centerYpx = viewport.height * 0.5;
  const minDim = Math.min(viewport.width, viewport.height);
  const radiusPx = minDim * (PORTFOLIO_CONFIG.LAYOUT.NEBULA_RADIUS / 100);

  // Equilateral triangle vertices: top, bottom-right, bottom-left
  // Angles: -90° (top), 30° (bottom-right), 150° (bottom-left)
  const triangleAngles = [
    -Math.PI / 2, // Top vertex
    Math.PI / 6, // Bottom-right (30°)
    (5 * Math.PI) / 6, // Bottom-left (150°)
  ];

  const nebulae: NebulaCluster[] = sortedClusterIds.map((clusterId, clusterIndex) => {
    const clusterEvents = clusters.get(clusterId)!;
    const clusterConfig =
      PORTFOLIO_CONFIG.CLUSTERS[clusterId as keyof typeof PORTFOLIO_CONFIG.CLUSTERS];

    const angle = triangleAngles[clusterIndex % triangleAngles.length];

    // Calculate absolute pixel positions for true equilateral triangle
    // Using Centroid centering (mathematical center of mass) which aligns
    // with the screen center (50%, 50%).
    const xPx = centerXpx + radiusPx * Math.cos(angle);
    const yPx = centerYpx + radiusPx * Math.sin(angle);

    // Convert to percentages for CSS positioning
    const clusterCenterX = (xPx / viewport.width) * 100;
    const clusterCenterY = (yPx / viewport.height) * 100;

    // Dynamic intra-cluster radius
    const intraClusterRadius = Math.max(
      PORTFOLIO_CONFIG.LAYOUT.INTRA_CLUSTER_RADIUS_MIN,
      Math.min(
        PORTFOLIO_CONFIG.LAYOUT.INTRA_CLUSTER_RADIUS_MAX,
        clusterEvents.length * PORTFOLIO_CONFIG.LAYOUT.INTRA_CLUSTER_RADIUS_MULTIPLIER,
      ),
    );

    // Create project stars
    const projects: ProjectStar[] = clusterEvents.map((event, i) => {
      const localAngle = (2 * Math.PI * i) / clusterEvents.length;
      return {
        id: event.id.toString(),
        event,
        position: {
          left: clusterCenterX + intraClusterRadius * Math.cos(localAngle),
          top: clusterCenterY + intraClusterRadius * Math.sin(localAngle),
        },
      };
    });

    return {
      clusterId,
      name: clusterConfig?.name || `Cluster ${clusterId}`,
      position: { left: clusterCenterX, top: clusterCenterY },
      projects,
      color: clusterConfig?.color || 'from-gray-500 to-gray-600',
    };
  });

  return { cv, nebulae };
}
