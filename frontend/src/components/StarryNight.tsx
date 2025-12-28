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
  useEffect(() => {
    const update = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showCV) {
          setShowCV(false);
          resetToOverview();
        } else if (state.viewState !== 'OVERVIEW') {
          zoomOut();
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
    zoomOut,
    resetToOverview,
  ]);

  // Event handlers
  const handleCVClick = () => {
    setShowCV(true);
  };

  const handleNebulaClick = (nebula: (typeof portfolioData.nebulae)[0]) => {
    zoomToNebula(nebula, viewport);
  };

  const handleProjectClick = (project: Event) => {
    if (isLoggedIn) {
      setEditingEvent(project);
      setShowCreateEventOverlay(true);
    } else {
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
    zoomOut();
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
      <NavigationControls viewState={state.viewState} onBack={zoomOut} />

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
          setShowCV(false);
          resetToOverview();
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
