import { useState, useCallback } from 'react';
import { PortfolioState, NebulaCluster, CameraState } from '@/types/portfolio';
import { Event } from '@/data/event';
import { PORTFOLIO_CONFIG } from '@/constants/portfolio';

const INITIAL_CAMERA: CameraState = {
  scale: PORTFOLIO_CONFIG.CAMERA.OVERVIEW_SCALE,
  x: 0,
  y: 0,
};

export function usePortfolioState() {
  const [state, setState] = useState<PortfolioState>({
    viewState: 'OVERVIEW',
    activeNebula: null,
    activeProject: null,
    camera: INITIAL_CAMERA,
  });

  const zoomToNebula = useCallback(
    (nebula: NebulaCluster, viewport: { width: number; height: number }) => {
      const { NEBULA_SCALE } = PORTFOLIO_CONFIG.CAMERA;
      const viewportCenterX = viewport.width / 2;
      const viewportCenterY = viewport.height / 2;

      if (nebula.projects.length === 0) {
        // Fallback to nebula center if no projects
        const targetX = (nebula.position.left / 100) * viewport.width;
        const targetY = (nebula.position.top / 100) * viewport.height;
        setState({
          viewState: 'NEBULA',
          activeNebula: nebula,
          activeProject: null,
          camera: {
            scale: NEBULA_SCALE,
            x: viewportCenterX - targetX * NEBULA_SCALE,
            y: viewportCenterY - targetY * NEBULA_SCALE,
          },
        });
        return;
      }

      // Rearrange projects in a polygon pattern centered on screen using percentage positioning
      // Using percentages so they work correctly when rendered outside the Camera component
      const polygonRadius = 20; // radius in percentage (more spread out)
      // Center polygon shifted left from screen center
      const polygonCenterX = 40;
      const polygonCenterY = 50;

      // Calculate polygon positions in percentages
      const polygonPositions =
        nebula.projects.length > 0
          ? (() => {
              const positions: { left: number; top: number }[] = [];
              if (nebula.projects.length === 1) {
                return [{ left: polygonCenterX, top: polygonCenterY }];
              }
              const startAngle = -Math.PI / 2; // Start from top
              for (let i = 0; i < nebula.projects.length; i++) {
                const angle = startAngle + (2 * Math.PI * i) / nebula.projects.length;
                positions.push({
                  left: polygonCenterX + polygonRadius * Math.cos(angle),
                  top: polygonCenterY + polygonRadius * Math.sin(angle),
                });
              }
              return positions;
            })()
          : [];

      // Create a transformed nebula with rearranged projects using absolute positions
      const transformedNebula: NebulaCluster = {
        ...nebula,
        projects: nebula.projects.map((project, i) => ({
          ...project,
          position: polygonPositions[i],
        })),
      };

      // Center camera so the polygon center appears at screen center
      // With transformOrigin 'center center', scaling happens from the center of the container
      // After scaling from center (cx, cy): point at (px, py) becomes:
      //   (cx + (px - cx) * scale, cy + (py - cy) * scale)
      //   = (cx * (1 - scale) + px * scale, cy * (1 - scale) + py * scale)
      // After translation: (cx * (1 - scale) + px * scale + camera.x, cy * (1 - scale) + py * scale + camera.y)
      //
      // For a point at the center (cx, cy) = (viewportCenterX, viewportCenterY):
      // After scaling: (cx * (1 - scale) + cx * scale, cy * (1 - scale) + cy * scale) = (cx, cy)
      // So the center stays at the center! We just need camera.x = 0, camera.y = 0
      setState({
        viewState: 'NEBULA',
        activeNebula: transformedNebula,
        activeProject: null,
        camera: {
          scale: NEBULA_SCALE,
          x: 0,
          y: 0,
        },
      });
    },
    [],
  );

  const zoomToProject = useCallback(
    (project: Event, viewport: { width: number; height: number }) => {
      const { DETAIL_SCALE } = PORTFOLIO_CONFIG.CAMERA;
      const centerX = viewport.width / 2;
      const centerY = viewport.height / 2;

      setState((prev) => {
        // Find the project's position from active nebula
        const nebula = prev.activeNebula;
        if (!nebula) return prev;

        const projectStar = nebula.projects.find((p) => p.event.id === project.id);
        if (!projectStar) return prev;

        // Project star position - check if it's absolute (pixels) or relative (percentage)
        const isAbsolute = projectStar.position.left > 100 || projectStar.position.top > 100;
        const targetX = isAbsolute
          ? projectStar.position.left
          : (projectStar.position.left / 100) * viewport.width;
        const targetY = isAbsolute
          ? projectStar.position.top
          : (projectStar.position.top / 100) * viewport.height;

        // Center the project star on screen
        // With transformOrigin 'center center', scaling happens from (centerX, centerY)
        // After scaling: point becomes (centerX + (targetX - centerX) * scale, centerY + (targetY - centerY) * scale)
        // After translation: (centerX + (targetX - centerX) * scale + camera.x, centerY + (targetY - centerY) * scale + camera.y)
        // We want this to equal (centerX, centerY):
        // camera.x = (centerX - targetX) * scale
        // camera.y = (centerY - targetY) * scale
        return {
          ...prev,
          viewState: 'DETAIL',
          activeProject: project,
          camera: {
            scale: DETAIL_SCALE,
            x: (centerX - targetX) * DETAIL_SCALE,
            y: (centerY - targetY) * DETAIL_SCALE,
          },
        };
      });
    },
    [],
  );

  const zoomOut = useCallback(() => {
    setState((prev) => {
      if (prev.viewState === 'DETAIL') {
        // Zoom back to nebula view - use same calculation as zoomToNebula
        if (prev.activeNebula) {
          const viewport = { width: window.innerWidth, height: window.innerHeight };
          const { NEBULA_SCALE } = PORTFOLIO_CONFIG.CAMERA;
          const centerX = viewport.width / 2;
          const centerY = viewport.height / 2;

          // Center camera on the polygon center (screen center) - same as zoomToNebula
          // With transformOrigin 'center center', no translation needed
          return {
            viewState: 'NEBULA',
            activeNebula: prev.activeNebula,
            activeProject: null,
            camera: {
              scale: NEBULA_SCALE,
              x: 0,
              y: 0,
            },
          };
        }
      } else if (prev.viewState === 'NEBULA') {
        // Zoom back to overview
        return {
          viewState: 'OVERVIEW',
          activeNebula: null,
          activeProject: null,
          camera: INITIAL_CAMERA,
        };
      }
      return prev;
    });
  }, []);

  const resetToOverview = useCallback(() => {
    setState({
      viewState: 'OVERVIEW',
      activeNebula: null,
      activeProject: null,
      camera: INITIAL_CAMERA,
    });
  }, []);

  return {
    state,
    zoomToNebula,
    zoomToProject,
    zoomOut,
    resetToOverview,
  };
}
