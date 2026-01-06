'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { addEvent, deleteEvent, getEvents, updateEvent } from '@/lib/events';
import { uploadFileToS3 } from '@/lib/s3';
import { FALLBACK_EVENTS } from '@/utils/fallback';
import { Event } from '@/data/event';

// Portfolio components
import Camera from './Camera';
import BackgroundStars from './BackgroundStars';
import CVStar from './CVStar';
import NebulaCluster from './NebulaCluster';
import ProjectStar from './ProjectStar';
import NavigationControls from './NavigationControls';
import EventDisplay from './EventDisplay';
import CVOverlay from './CVOverlay';
import RocketCursor from 'rocket-cursor-component';

// Admin components
import LoginOverlay from './LoginOverlay';
import ExpandableControls from './ButtonAnimation';
import CreateEventOverlay from './CreateEventOverlay';
import RemoveEventOverlay from './RemoveEventOverlay';

// Hooks and utilities
import { usePortfolioState } from '@/hooks/usePortfolioState';
import { generatePortfolioData } from '@/utils/portfolioData';

export default function StarryNight() {
  // Viewport tracking
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  // Unified effect below handles viewport and cursor updates

  // Portfolio state management
  const { state, zoomToNebula, zoomToProject, zoomOut, resetToOverview } = usePortfolioState();

  // Data
  const [events, setEvents] = useState<Event[]>([]);
  const [fallbackMode, setFallbackMode] = useState(false);
  const portfolioData = useMemo(() => generatePortfolioData(events, viewport), [events, viewport]);

  // Admin state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showCreateEventOverlay, setShowCreateEventOverlay] = useState(false);
  const [showRemoveEventOverlay, setShowRemoveEventOverlay] = useState(false);
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // CV overlay state
  const [showCV, setShowCV] = useState(false);

  // Cursor state
  const [cursorSize, setCursorSize] = useState(48);
  const [enableCursor, setEnableCursor] = useState(false);

  useEffect(() => {
    const update = () => {
      // Update viewport
      const width = window.innerWidth;
      const height = window.innerHeight;
      setViewport({ width, height });

      // Update cursor
      const isTouch =
        window.matchMedia('(pointer: coarse)').matches ||
        window.matchMedia('(hover: none)').matches;

      // Disable on mobile or small view
      const shouldEnable = width >= 768 && !isTouch;

      setEnableCursor(shouldEnable);

      if (shouldEnable) {
        const size = Math.min(72, Math.max(40, Math.round(width * 0.04)));
        setCursorSize(size);
      }
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalHeight = document.body.style.height;

    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.height = originalHeight;
    };
  }, []);

  // Animation offset for subtle star movement
  const [animationTick, setAnimationTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setAnimationTick((t) => t + 0.01), 16);
    return () => clearInterval(interval);
  }, []);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      setEvents(FALLBACK_EVENTS);
      setFallbackMode(true);
      // TODO: Uncomment when backend is available
      // try {
      //   const data = await getEvents();
      //   setEvents(data);
      // } catch (err) {
      //   console.error('Failed to fetch events:', err);
      //   setEvents(FALLBACK_EVENTS);
      //   setFallbackMode(true);
      //   setIsLoggedIn(false);
      // }
    };
    fetchEvents();
  }, []);

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // History management
  useEffect(() => {
    // Set initial state
    window.history.replaceState({ type: 'OVERVIEW' }, '', window.location.pathname);

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;

      if (!state || state.type === 'OVERVIEW') {
        setShowCV(false);
        resetToOverview();
        return;
      }

      if (state.type === 'CV') {
        setShowCV(true);
        // Ensure we are in overview for the background
        if (state.viewState !== 'OVERVIEW') {
          resetToOverview();
        }
        return;
      }

      // For other states, ensure CV is closed
      setShowCV(false);

      if (state.type === 'NEBULA') {
        const nebula = portfolioData.nebulae.find((n) => n.clusterId === state.id);
        if (nebula) {
          zoomToNebula(nebula, { width: window.innerWidth, height: window.innerHeight });
        } else {
          resetToOverview();
        }
      } else if (state.type === 'DETAIL') {
        const project = events.find((e) => e.id === state.id);
        if (project) {
          zoomToProject(project, { width: window.innerWidth, height: window.innerHeight });
        } else {
          resetToOverview(); // Or fallback to nebula?
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [events, portfolioData, resetToOverview, zoomToNebula, zoomToProject]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showCV) {
          // CV is an overlay, use history back
          window.history.back();
        } else if (state.viewState !== 'OVERVIEW') {
          // Use history back for main navigation
          window.history.back();
        } else if (showCreateEventOverlay || showRemoveEventOverlay || showLogin) {
          setShowCreateEventOverlay(false);
          setShowRemoveEventOverlay(false);
          setShowLogin(false);
        }
      } else if (e.key.toLowerCase() === 'p' && !fallbackMode) {
        if (isLoggedIn) {
          setShowLogoutPrompt((prev) => !prev);
        } else {
          setShowLogin(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    state.viewState,
    showCV,
    showCreateEventOverlay,
    showRemoveEventOverlay,
    showLogin,
    isLoggedIn,
    fallbackMode,
  ]);

  // Event handlers
  const handleCVClick = () => {
    window.history.pushState({ type: 'CV' }, '', '#cv');
    setShowCV(true);
  };

  const handleNebulaClick = (nebula: (typeof portfolioData.nebulae)[0]) => {
    window.history.pushState(
      { type: 'NEBULA', id: nebula.clusterId },
      '',
      `#nebula-${nebula.clusterId}`,
    );
    zoomToNebula(nebula, viewport);
  };

  const handleProjectClick = (project: Event) => {
    if (isLoggedIn) {
      setEditingEvent(project);
      setShowCreateEventOverlay(true);
    } else {
      window.history.pushState({ type: 'DETAIL', id: project.id }, '', `#project-${project.id}`);
      zoomToProject(project, viewport);
    }
  };

  const handleSaveEvent = async (data: {
    id?: number;
    title: string;
    description: string;
    imageFile?: File;
    videoFile?: File;
    imageRemoved?: boolean;
    videoRemoved?: boolean;
  }) => {
    try {
      let imageUrl: string | null = null;
      let videoUrl: string | null = null;

      if (data.id) {
        const existingEvent = events.find((e) => e.id === data.id)!;

        if (data.imageRemoved) {
          imageUrl = null;
        } else if (data.imageFile) {
          imageUrl = await uploadFileToS3(data.imageFile, data.id);
        } else {
          imageUrl = existingEvent.imageUrl;
        }

        if (data.videoRemoved) {
          videoUrl = null;
        } else if (data.videoFile) {
          videoUrl = await uploadFileToS3(data.videoFile, data.id);
        } else {
          videoUrl = existingEvent.videoUrl;
        }

        await updateEvent(data.id, {
          title: data.title,
          description: data.description,
          imageUrl,
          videoUrl,
        });

        setEvents((prev) =>
          prev.map((e) =>
            e.id === data.id
              ? { ...e, title: data.title, description: data.description, imageUrl, videoUrl }
              : e,
          ),
        );
      } else {
        const newEvent = await addEvent({
          title: data.title,
          description: data.description,
          imageUrl: null,
          videoUrl: null,
        });

        const eventId = newEvent.id;

        if (data.imageFile) imageUrl = await uploadFileToS3(data.imageFile, eventId);
        if (data.videoFile) videoUrl = await uploadFileToS3(data.videoFile, eventId);

        if (imageUrl !== null || videoUrl !== null) {
          await updateEvent(eventId, { imageUrl, videoUrl });
          newEvent.imageUrl = imageUrl;
          newEvent.videoUrl = videoUrl;
        }

        setEvents((prev) => [...prev, newEvent]);
      }
    } catch (err) {
      console.error('Failed to save event:', err);
    }
  };

  const handleRemoveEvent = async (id: number) => {
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Failed to remove event:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    setIsLoggedIn(false);
    setShowLogoutPrompt(false);
  };

  const closeProjectDetail = () => {
    // If we have history (which we should if we came here via click), go back
    if (state.viewState === 'DETAIL') {
      window.history.back();
    } else {
      // Fallback if somehow state is desynced
      zoomOut();
    }
  };

  // Determine which projects to show
  const visibleProjects = useMemo(() => {
    if (state.viewState === 'NEBULA' && state.activeNebula) {
      return state.activeNebula.projects;
    }
    return [];
  }, [state.viewState, state.activeNebula]);

  // Determine which nebulae to show
  const visibleNebulae = useMemo(() => {
    if (state.viewState === 'OVERVIEW') {
      return portfolioData.nebulae;
    }
    return [];
  }, [state.viewState, portfolioData.nebulae]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {enableCursor && !showCV && (
        <RocketCursor
          size={cursorSize}
          threshold={12}
          flameHideTimeout={250}
          hideCursor={true}
          followSpeed={0.35}
        />
      )}
      <BackgroundStars />

      {/* CV Star - only visible in overview */}
      {state.viewState === 'OVERVIEW' && (
        <div className="fixed inset-0 pointer-events-none z-20">
          <CVStar cv={portfolioData.cv} viewport={viewport} onClick={handleCVClick} />
        </div>
      )}

      <Camera camera={state.camera}>
        {/* Nebulae - only in overview */}
        {visibleNebulae.map((nebula) => (
          <NebulaCluster
            key={nebula.clusterId}
            nebula={nebula}
            viewport={viewport}
            onClick={() => handleNebulaClick(nebula)}
            isActive={state.activeNebula?.clusterId === nebula.clusterId}
          />
        ))}
      </Camera>

      {/* Project Stars - render outside Camera when in nebula view with zoom animation */}
      {state.viewState === 'NEBULA' &&
        visibleProjects.map((project) => (
          <ProjectStar
            key={project.id}
            project={project}
            viewport={viewport}
            onClick={() => handleProjectClick(project.event)}
            animationOffset={animationTick + Number(project.id)}
            cameraScale={state.camera.scale}
          />
        ))}

      {/* Navigation Controls */}
      <NavigationControls viewState={state.viewState} onBack={() => window.history.back()} />

      {/* Project Detail Overlay */}
      <AnimatePresence>
        {state.viewState === 'DETAIL' && state.activeProject && (
          <EventDisplay event={state.activeProject} onClose={closeProjectDetail} />
        )}
      </AnimatePresence>

      {/* CV Overlay */}
      <CVOverlay
        isOpen={showCV}
        onClose={() => {
          // Use history back to close
          window.history.back();
        }}
      />

      {/* Admin UI */}
      <AnimatePresence>
        {showLogoutPrompt && (
          <div
            className="fixed top-6 right-6 bg-white text-black px-4 py-2 rounded cursor-pointer z-50 shadow-md hover:bg-gray-200 transition"
            onClick={handleLogout}
          >
            Log out
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogin && !fallbackMode && (
          <LoginOverlay
            onClose={() => setShowLogin(false)}
            onLoginSuccess={() => {
              setIsLoggedIn(true);
              setShowLogin(false);
            }}
          />
        )}
      </AnimatePresence>

      {showCreateEventOverlay && (
        <CreateEventOverlay
          initialEvent={editingEvent || undefined}
          onClose={() => {
            setShowCreateEventOverlay(false);
            setEditingEvent(null);
          }}
          onSave={(data) => {
            handleSaveEvent(data);
            setShowCreateEventOverlay(false);
            setEditingEvent(null);
          }}
        />
      )}

      {showRemoveEventOverlay && (
        <RemoveEventOverlay
          events={events}
          onClose={() => setShowRemoveEventOverlay(false)}
          onRemove={(id) => handleRemoveEvent(id)}
        />
      )}

      {isLoggedIn &&
        !showLogin &&
        !showCreateEventOverlay &&
        !showRemoveEventOverlay &&
        state.viewState === 'OVERVIEW' && (
          <ExpandableControls
            onCreateClick={() => {
              setEditingEvent(null);
              setShowCreateEventOverlay(true);
            }}
            onRemoveClick={() => setShowRemoveEventOverlay(true)}
          />
        )}
    </div>
  );
}
