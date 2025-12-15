'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addEvent, deleteEvent, getEvents, updateEvent } from '@/lib/events';
import LoginOverlay from './LoginOverlay';
import ExpandableControls from './ButtonAnimation';
import CreateEventOverlay from './CreateEventOverlay';
import RemoveEventOverlay from './RemoveEventOverlay';
import { uploadFileToS3 } from '@/lib/s3';
import EventDisplay from './EventDisplay';
import { FALLBACK_EVENTS } from '@/utils/fallback';
import { Event } from '@/data/event';

interface Star {
  id: string;
  top: number;
  left: number;
  info: string;
}

interface CVStar {
  id: string;
  top: number;
  left: number;
}

interface CVStar {
  id: string;
  top: number;
  left: number;
}

export default function StarryNight() {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [animationTick, setAnimationTick] = useState(0);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const [events, setEvents] = useState<Event[]>([]);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showCreateEventOverlay, setShowCreateEventOverlay] = useState(false);
  const [showRemoveEventOverlay, setShowRemoveEventOverlay] = useState(false);
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);

  const [fallbackMode, setFallbackMode] = useState(false);

  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const referenceWidth = 400;

  useEffect(() => {
    const handleResize = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [cvStar] = useState<CVStar>({
    id: 'cv',
    top: 50,
    left: 50,
  });
  const [showCV, setShowCV] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // --- handle login/logout toggle on "P"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'p') {
        if (fallbackMode) return;

        if (isLoggedIn) {
          setShowLogoutPrompt((prev) => !prev);
        } else {
          setShowLogin(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoggedIn]);

  // --- fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      // TOOD: uncomment when BE is up
      setEvents(FALLBACK_EVENTS);
      setFallbackMode(true);
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

  const [stars, setStars] = useState<Star[]>([]);

  // --- generate stars from events
  useEffect(() => {
    if (events.length === 0) return;

    const radiusPercent = 40;
    const centerX = cvStar.left;
    const centerY = cvStar.top;

    // Sort events by ID to ensure consistent ordering
    const sortedEvents = [...events].sort((a, b) => a.id - b.id);

    const newStars: Star[] = sortedEvents.map((event, i) => {
      // Start at -90 degrees (12 o'clock) and go clockwise
      // Subtract PI/2 to start at top, use positive angle for clockwise
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / sortedEvents.length;
      const left = centerX + radiusPercent * Math.cos(angle);
      const top = centerY + radiusPercent * Math.sin(angle);

      return {
        id: event.id.toString(),
        left,
        top,
        info: `${event.title} - ${event.description.slice(0, 50)}${
          event.description.length > 50 ? '...' : ''
        }`,
      };
    });
    const radiusPercent = 40;
    const centerX = cvStar.left;
    const centerY = cvStar.top;

    // Sort events by ID to ensure consistent ordering
    const sortedEvents = [...events].sort((a, b) => a.id - b.id);

    const newStars: Star[] = sortedEvents.map((event, i) => {
      // Start at -90 degrees (12 o'clock) and go clockwise
      // Subtract PI/2 to start at top, use positive angle for clockwise
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / sortedEvents.length;
      const left = centerX + radiusPercent * Math.cos(angle);
      const top = centerY + radiusPercent * Math.sin(angle);

      return {
        id: event.id.toString(),
        left,
        top,
        info: `${event.title} - ${event.description.slice(0, 50)}${
          event.description.length > 50 ? '...' : ''
        }`,
      };
    });

    setStars(newStars);
  }, [events]);

  // --- animation tick
  useEffect(() => {
    const interval = setInterval(() => setAnimationTick((t) => t + 0.01), 16);
    return () => clearInterval(interval);
  }, []);

  // --- zoom and drag
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();

    const zoomIntensity = 0.002;

    setScale((prev) => {
      const next = prev * Math.exp(-e.deltaY * zoomIntensity);
      return Math.min(Math.max(next, 0.5), 6);
    });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };
  const handleMouseUp = () => setIsDragging(false);

  const handleCVClick = (cvStar: CVStar) => {
    // Zoom and show read-only event
    const zoomTargetScale = 4;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const starX = (cvStar.left / 100) * window.innerWidth;
    const starY = (cvStar.top / 100) * window.innerHeight;

    const newOffset = {
      x: centerX - starX * zoomTargetScale,
      y: centerY - starY * zoomTargetScale,
    };
    setIsDragging(false);
    setOffset(newOffset);
    setScale(zoomTargetScale);

    setTimeout(() => setShowCV(true), 900);
  };

  const handleCVClose = () => {
    setShowCV(false);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleCVClick = (cvStar: CVStar) => {
    // Zoom and show read-only event
    const zoomTargetScale = 4;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const starX = (cvStar.left / 100) * window.innerWidth;
    const starY = (cvStar.top / 100) * window.innerHeight;

    const newOffset = {
      x: centerX - starX * zoomTargetScale,
      y: centerY - starY * zoomTargetScale,
    };
    setIsDragging(false);
    setOffset(newOffset);
    setScale(zoomTargetScale);

    setTimeout(() => setShowCV(true), 900);
  };

  const handleCVClose = () => {
    setShowCV(false);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  // --- star click
  const handleStarClick = (star: Star) => {
    const event = events.find((e) => e.id === Number(star.id));
    if (!event) return;

    if (isLoggedIn) {
      // Open editable overlay
      setEditingEvent(event);
      setShowCreateEventOverlay(true);
    } else {
      // Zoom and show read-only event
      const zoomTargetScale = 4;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const starX = (star.left / 100) * window.innerWidth;
      const starY = (star.top / 100) * window.innerHeight;

      const newOffset = {
        x: centerX - starX * zoomTargetScale,
        y: centerY - starY * zoomTargetScale,
      };
      setIsDragging(false);
      setOffset(newOffset);
      setScale(zoomTargetScale);

      setTimeout(() => setActiveEvent(event), 900);
      setTimeout(() => setActiveEvent(event), 900);
    }
  };

  const closeEvent = () => {
    setActiveEvent(null);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  // --- close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeOverlay();
      }
      if (e.key === 'Escape') {
        closeOverlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeEvent, showCV]);

  const closeOverlay = () => {
    if (activeEvent) {
      setActiveEvent(null);
    }
    if (showCV) {
      setShowCV(false);
    }
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };
  }, [activeEvent, showCV]);

  const closeOverlay = () => {
    if (activeEvent) {
      setActiveEvent(null);
    }
    if (showCV) {
      setShowCV(false);
    }
    setScale(1);
    setOffset({ x: 0, y: 0 });
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
        // Editing existing event
        const existingEvent = events.find((e) => e.id === data.id)!;

        // Determine image/video URLs
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

        // Update backend
        await updateEvent(data.id, {
          title: data.title,
          description: data.description,
          imageUrl,
          videoUrl,
        });

        // Update frontend state
        setEvents((prev) =>
          prev.map((e) =>
            e.id === data.id
              ? { ...e, title: data.title, description: data.description, imageUrl, videoUrl }
              : e,
          ),
        );
      } else {
        // New event
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

  const [backgroundStars] = useState(() =>
    [...Array(150)].map(() => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.8 + 0.2,
    })),
  );

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    setIsLoggedIn(false);
    setShowLogoutPrompt(false);
  };

  const baseSize = 8;
  const scaledSize = baseSize * (viewport.width / referenceWidth);

  const baseSize = 8;
  const scaledSize = baseSize * (viewport.width / referenceWidth);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-black overflow-hidden cursor-grab"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Background stars */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {backgroundStars.map((star, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: star.size,
              height: star.size,
              top: `${star.top}%`,
              left: `${star.left}%`,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      {/* Moving stars + lines */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full"
        style={{ transformOrigin: 'top left' }}
        animate={{ scale, x: offset.x, y: offset.y }}
        transition={{
          duration: isDragging ? 0 : 1,
          duration: isDragging ? 0 : 1,
          ease: 'linear',
        }}
      >
        {/* <svg className="absolute w-full h-full top-0 left-0">
        {/* <svg className="absolute w-full h-full top-0 left-0">
          {stars.map((star, index) => {
            if (index === stars.length - 1) return null;
            const nextStar = stars[index + 1];
            const y1 = star.top + Math.sin(animationTick + Number(star.id)) * 2;
            const y2 = nextStar.top + Math.sin(animationTick + Number(nextStar.id)) * 2;
            return (
              <line
                key={star.id}
                x1={`${star.left}%`}
                y1={`${y1}%`}
                x2={`${nextStar.left}%`}
                y2={`${y2}%`}
                stroke="white"
                strokeWidth={1.5}
                opacity={0.7}
              />
            );
          })}
        </svg> */}
        </svg> */}

        {stars.map((star) => {
          const y = star.top + Math.sin(animationTick + Number(star.id)) * 2;
          const event = events.find((e) => e.id === Number(star.id));

          return (
            <div
              key={star.id}
              className="absolute"
              style={{
                top: `${y}%`,
                left: `${star.left}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Title label */}
              {event && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-white font-medium pointer-events-none select-none"
                  style={{
                    top: '-1.8rem',
                    fontSize: `${9 * Math.min(viewport.width / referenceWidth, viewport.height / 400)}px`,
                  }}
                >
                <div
                  className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-white font-medium pointer-events-none select-none"
                  style={{
                    top: '-1.8rem',
                    fontSize: `${9 * Math.min(viewport.width / referenceWidth, viewport.height / 400)}px`,
                  }}
                >
                  {event.title}
                </div>
              )}

              {/* Star */}
              <div
                className="bg-white rounded-full cursor-pointer hover:scale-150 transition-transform"
                style={{
                  width: `${scaledSize}px`,
                  height: `${scaledSize}px`,
                }}
                className="bg-white rounded-full cursor-pointer hover:scale-150 transition-transform"
                style={{
                  width: `${scaledSize}px`,
                  height: `${scaledSize}px`,
                }}
                onClick={() => handleStarClick(star)}
              />
            </div>
          );
        })}

        {/* CV Star */}
        <div
          key={cvStar.id}
          className="absolute"
          style={{
            top: `${cvStar.top}%`,
            left: `${cvStar.left}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <motion.div
            className="bg-blue-400 rounded-full cursor-pointer hover:scale-125 transition-transform"
            style={{
              width: `${scaledSize}px`,
              height: `${scaledSize}px`,
            }}
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            onClick={() => handleCVClick(cvStar)}
          />
          <div
            className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-white font-medium opacity-80 select-none italic"
            style={{
              top: '-1.5rem',
              fontSize: `${9 * Math.min(viewport.width / referenceWidth, viewport.height / 400)}px`,
            }}
          >
            Curriculum Vitae
          </div>
        </div>

        {/* CV Star */}
        <div
          key={cvStar.id}
          className="absolute"
          style={{
            top: `${cvStar.top}%`,
            left: `${cvStar.left}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <motion.div
            className="bg-blue-400 rounded-full cursor-pointer hover:scale-125 transition-transform"
            style={{
              width: `${scaledSize}px`,
              height: `${scaledSize}px`,
            }}
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            onClick={() => handleCVClick(cvStar)}
          />
          <div
            className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-white font-medium opacity-80 select-none italic"
            style={{
              top: '-1.5rem',
              fontSize: `${9 * Math.min(viewport.width / referenceWidth, viewport.height / 400)}px`,
            }}
          >
            Curriculum Vitae
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showCV && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
            onClick={() => handleCVClose()}
          >
            <div
              className="bg-white text-black p-6 rounded max-w-4xl w-full h-[90vh] overflow-auto flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">{"CV if you're interested 😎"}</h2>
              <div className="flex-1 flex items-center justify-center overflow-auto">
                <iframe
                  src="/cv.pdf#view=FitV"
                  className="w-full h-full border-0"
                  title="Curriculum Vitae"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Prompt */}
      <AnimatePresence>
        {showLogoutPrompt && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute top-6 right-6 bg-white text-black px-4 py-2 rounded cursor-pointer z-50 shadow-md hover:bg-gray-200 transition"
            onClick={handleLogout}
          >
            Log out
          </motion.div>
        )}
      </AnimatePresence>

      {/* Read-only Active Event Overlay */}
      <AnimatePresence>
        {activeEvent && <EventDisplay event={activeEvent} onClose={closeEvent} />}
      </AnimatePresence>

      {/* Login */}
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

      {/* Create / Edit Event Overlay */}
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

      {/* Remove Event */}
      {showRemoveEventOverlay && (
        <RemoveEventOverlay
          events={events}
          onClose={() => setShowRemoveEventOverlay(false)}
          onRemove={(id) => handleRemoveEvent(id)}
        />
      )}

      {/* Controls */}
      {isLoggedIn &&
        !showLogin &&
        !showCreateEventOverlay &&
        !showRemoveEventOverlay &&
        !activeEvent && (
          <ExpandableControls
            onCreateClick={() => {
              setEditingEvent(null); // new event
              setShowCreateEventOverlay(true);
            }}
            onRemoveClick={() => setShowRemoveEventOverlay(true)}
          />
        )}
    </div>
  );
}
