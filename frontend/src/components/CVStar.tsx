'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { CVData } from '@/types/portfolio';
import { PORTFOLIO_CONFIG } from '@/constants/portfolio';

interface CVStarProps {
  cv: CVData;
  viewport: { width: number; height: number };
  onClick: () => void;
}

export default function CVStar({ cv, viewport, onClick }: CVStarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    renderer?: THREE.WebGLRenderer;
    star?: THREE.Mesh;
    glow1?: THREE.Mesh;
    glow2?: THREE.Mesh;
    light?: THREE.PointLight;
    animationId?: number;
  }>({});

  const baseSize = PORTFOLIO_CONFIG.VISUAL.CV_STAR_SIZE;
  const MIN_SIZE = 10;
  const MAX_SIZE = 40;

  const scaleFactor = Math.min(
    viewport.width / PORTFOLIO_CONFIG.REFERENCE_WIDTH,
    viewport.height / PORTFOLIO_CONFIG.REFERENCE_HEIGHT,
  );

  const scaledSize = Math.max(
    MIN_SIZE,
    Math.min(MAX_SIZE, baseSize * scaleFactor * PORTFOLIO_CONFIG.VISUAL.NEBULA_SIZE_MULTIPLIER),
  );

  const fontSize =
    12 * Math.min(viewport.width / PORTFOLIO_CONFIG.REFERENCE_WIDTH, viewport.height / 400);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any existing canvas first
    if (containerRef.current.firstChild) {
      containerRef.current.innerHTML = '';
    }

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    renderer.setSize(scaledSize, scaledSize);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    // Create star core
    const starGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const starMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });
    const star = new THREE.Mesh(starGeometry, starMaterial);
    scene.add(star);

    // Create glow layer 1
    const glowGeometry1 = new THREE.SphereGeometry(0.7, 32, 32);
    const glowMaterial1 = new THREE.MeshBasicMaterial({
      color: 0xffa500,
      transparent: true,
      opacity: 0.4,
      side: THREE.BackSide,
    });
    const glow1 = new THREE.Mesh(glowGeometry1, glowMaterial1);
    scene.add(glow1);

    // Create glow layer 2
    const glowGeometry2 = new THREE.SphereGeometry(0.9, 32, 32);
    const glowMaterial2 = new THREE.MeshBasicMaterial({
      color: 0xffa500,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide,
    });
    const glow2 = new THREE.Mesh(glowGeometry2, glowMaterial2);
    scene.add(glow2);

    // Add point light
    const light = new THREE.PointLight(0xffffaa, 1.5, 10);
    light.position.set(0, 0, 0);
    scene.add(light);

    camera.position.z = 2;

    // Animation
    let time = 0;
    let animationId: number;

    function animate() {
      animationId = requestAnimationFrame(animate);
      time += 0.01;

      // Rotate star slowly
      star.rotation.y += 0.005;
      glow1.rotation.y += 0.003;
      glow2.rotation.y += 0.002;

      // Subtle pulse effect
      const pulse = Math.sin(time * 2) * 0.05 + 1;
      star.scale.set(pulse, pulse, pulse);
      glow1.scale.set(pulse * 1.05, pulse * 1.05, pulse * 1.05);
      glow2.scale.set(pulse * 1.1, pulse * 1.1, pulse * 1.1);

      // Vary light intensity
      light.intensity = 1.5 + Math.sin(time * 3) * 0.3;

      renderer.render(scene, camera);
    }
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);

      // Remove canvas element
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }

      // Dispose of Three.js resources
      renderer.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      glowGeometry1.dispose();
      glowMaterial1.dispose();
      glowGeometry2.dispose();
      glowMaterial2.dispose();
    };
  }, [scaledSize]);

  return (
    <div
      className="absolute"
      style={{
        top: '52%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <motion.button
        className="pointer-events-auto focus:outline-none"
        style={{
          width: `${scaledSize}px`,
          height: `${scaledSize}px`,
          background: 'transparent',
          padding: 0,
          border: 'none',
        }}
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.95, 1, 0.95],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: [0.4, 0, 0.6, 1],
        }}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        aria-label={`View ${cv.title}`}
      >
        {/* Three.js Star */}
        <div ref={containerRef} style={{ width: scaledSize, height: scaledSize }} />
      </motion.button>

      <div
        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-white font-medium opacity-80 select-none"
        style={{
          top: '-1.7rem',
          fontSize: `${fontSize}px`,
        }}
      >
        {cv.title}
      </div>
    </div>
  );
}
