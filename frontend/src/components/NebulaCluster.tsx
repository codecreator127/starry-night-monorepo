'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { NebulaCluster as NebulaClusterType } from '@/types/portfolio';
import { PORTFOLIO_CONFIG } from '@/constants/portfolio';
import { Orbitron } from 'next/font/google';

// Import Orbitron font with weight 700
const orbitron = Orbitron({ weight: '700', subsets: ['latin'] });

interface NebulaClusterProps {
  nebula: NebulaClusterType;
  viewport: { width: number; height: number };
  onClick: () => void;
  isActive: boolean;
}

/* ===================== SEEDED RANDOM ===================== */
function hashStringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number) {
  let s = seed % 2147483647;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function getNebulaPalette(name: string) {
  return {
    // Shifted toward purple / magenta
    ha: new THREE.Color('#c77dff'), // Magenta H-alpha
    oiii: new THREE.Color('#5a7dff'), // Blue-violet oxygen
    sii: new THREE.Color('#ffb703'), // Very limited sulfur accent
    core: new THREE.Color('#f2ecff'), // Cool white
    void: new THREE.Color('#0b0f1a'), // Deep space dust
  };
}

/* ===================== COMPONENT ===================== */
export default function NebulaCluster({ nebula, viewport, onClick, isActive }: NebulaClusterProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);

  const baseSize = PORTFOLIO_CONFIG.VISUAL.CV_STAR_SIZE * 1.35;
  const scaledSize =
    baseSize *
    (viewport.width / PORTFOLIO_CONFIG.REFERENCE_WIDTH) *
    PORTFOLIO_CONFIG.VISUAL.NEBULA_SIZE_MULTIPLIER;

  const palette = getNebulaPalette(nebula.name);

  useEffect(() => {
    if (!canvasRef.current) return;

    const seed = hashStringToSeed(nebula.name);
    const rand = seededRandom(seed);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-11, 11, 11, -11, 0.1, 10);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(scaledSize, scaledSize, false);

    /* ===================== ELLIPTICAL SPIRAL ===================== */
    const ellipseX = 1 + (rand() - 0.5) * 0.4;
    const ellipseY = 1 + (rand() - 0.5) * 0.4;

    const ARM_COUNT = Math.floor(11 + rand() * 6);
    const ARM_PARTICLES = Math.floor(3000 + rand() * 2000);
    const ARM_TIGHTNESS = 0.6 + rand() * 0.5;
    const ARM_WIDTH = 0.18 + rand() * 0.15;
    const MAX_RADIUS = 8.5;

    const armPositions = new Float32Array(ARM_PARTICLES * 3);
    const armColors = new Float32Array(ARM_PARTICLES * 3);

    for (let i = 0; i < ARM_PARTICLES; i++) {
      const i3 = i * 3;
      const r = Math.pow(rand(), 1.6) * MAX_RADIUS;
      const armIndex = Math.floor(rand() * ARM_COUNT);
      const armAngle = (armIndex / ARM_COUNT) * Math.PI * 2;
      const theta = armAngle + r * ARM_TIGHTNESS + (rand() - 0.5) * ARM_WIDTH;

      const noise = Math.sin(theta * 6 + r * 2.5) * 0.15 + Math.cos(theta * 3 - r * 1.8) * 0.12;

      const distortedR = r + noise;

      armPositions[i3] = Math.cos(theta) * distortedR * ellipseX;
      armPositions[i3 + 1] = Math.sin(theta) * distortedR * ellipseY;

      const mix = rand();
      const emissionMix = rand();
      const color = new THREE.Color();

      if (emissionMix < 0.55) {
        color.copy(palette.oiii);
      } else if (emissionMix < 0.9) {
        color.copy(palette.ha);
      } else {
        color.copy(palette.sii); // rare accent only
      }

      // Ionization gradient (hot center → cooler outer filaments)
      color.lerp(palette.core, Math.exp(-r * 0.6));

      const fade = Math.exp(-r * 0.18);

      armColors[i3] = color.r * fade;
      armColors[i3 + 1] = color.g * fade;
      armColors[i3 + 2] = color.b * fade;
    }

    const armGeometry = new THREE.BufferGeometry();
    armGeometry.setAttribute('position', new THREE.BufferAttribute(armPositions, 3));
    armGeometry.setAttribute('color', new THREE.BufferAttribute(armColors, 3));

    const armMaterial = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    const spiralArms = new THREE.Points(armGeometry, armMaterial);
    scene.add(spiralArms);

    /* ===================== CORE ===================== */
    const coreGeometry = new THREE.BufferGeometry();
    const coreCount = 900;
    const corePositions = new Float32Array(coreCount * 3);
    const coreColors = new Float32Array(coreCount * 3);

    for (let i = 0; i < coreCount; i++) {
      const i3 = i * 3;
      const r = Math.pow(rand(), 2.6) * 2.2;
      const t = rand() * Math.PI * 2;

      corePositions[i3] = Math.cos(t) * r * ellipseX;
      corePositions[i3 + 1] = Math.sin(t) * r * ellipseY;
      corePositions[i3 + 2] = 0;

      coreColors[i3] = palette.core.r;
      coreColors[i3 + 1] = palette.core.g;
      coreColors[i3 + 2] = palette.core.b;
    }

    coreGeometry.setAttribute('position', new THREE.BufferAttribute(corePositions, 3));
    coreGeometry.setAttribute('color', new THREE.BufferAttribute(coreColors, 3));

    const coreMaterial = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const core = new THREE.Points(coreGeometry, coreMaterial);
    scene.add(core);

    /* ===================== BACKGROUND STARS ===================== */
    const BG_COUNT = Math.floor(2000 + rand() * 2000);
    const bgPositions = new Float32Array(BG_COUNT * 3);
    const bgColors = new Float32Array(BG_COUNT * 3);

    for (let i = 0; i < BG_COUNT; i++) {
      const i3 = i * 3;
      const r = Math.pow(rand(), 1.1) * 11;
      const t = rand() * Math.PI * 2;

      const emissionMix = rand();
      const color = new THREE.Color();

      if (emissionMix < 0.6) {
        color.copy(palette.oiii);
      } else {
        color.copy(palette.ha);
      }

      color.multiplyScalar(0.35);

      bgPositions[i3] = Math.cos(t) * r * ellipseX;
      bgPositions[i3 + 1] = Math.sin(t) * r * ellipseY;
      bgPositions[i3 + 2] = 0;

      const fade = Math.exp(-r * 0.32);

      color.multiplyScalar(1.25);

      bgColors[i3] = color.r * 0.4 * fade;
      bgColors[i3 + 1] = color.g * 0.4 * fade;
      bgColors[i3 + 2] = color.b * 0.4 * fade;
    }

    const bgGeometry = new THREE.BufferGeometry();
    bgGeometry.setAttribute('position', new THREE.BufferAttribute(bgPositions, 3));
    bgGeometry.setAttribute('color', new THREE.BufferAttribute(bgColors, 3));

    const bgMaterial = new THREE.PointsMaterial({
      size: 0.45,
      vertexColors: true,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const background = new THREE.Points(bgGeometry, bgMaterial);
    scene.add(background);

    const dustCount = 2500;
    const dustPositions = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      const i3 = i * 3;
      const r = Math.pow(rand(), 1.3) * 9.5;
      const t = rand() * Math.PI * 2;

      dustPositions[i3] = Math.cos(t) * r * ellipseX;
      dustPositions[i3 + 1] = Math.sin(t) * r * ellipseY;
      dustPositions[i3 + 2] = 0;

      const fade = Math.exp(-r * 0.12);
      dustColors[i3] = palette.void.r * fade;
      dustColors[i3 + 1] = palette.void.g * fade;
      dustColors[i3 + 2] = palette.void.b * fade;
    }

    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    dustGeometry.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));

    const dustMaterial = new THREE.PointsMaterial({
      size: 0.9,
      vertexColors: true,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    scene.add(new THREE.Points(dustGeometry, dustMaterial));

    /* ===================== ANIMATION ===================== */
    const armSpeed = 0.0015 + rand() * 0.0015;
    const bgSpeed = armSpeed * 0.25;
    let pulse = 0;

    const animate = () => {
      pulse += 0.02;
      const p = 1 + Math.sin(pulse) * 0.035;

      core.scale.set(p, p, 1);
      core.material.opacity = 0.85 + Math.sin(pulse) * 0.1;

      spiralArms.rotation.z += armSpeed;
      background.rotation.z += bgSpeed;

      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      armGeometry.dispose();
      armMaterial.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      bgGeometry.dispose();
      bgMaterial.dispose();
      renderer.dispose();
    };
  }, [scaledSize, nebula.name]);

  return (
    <button
      className="absolute rounded-full cursor-pointer focus:outline-none sm:left-[50%] sm:top-[50%]"
      style={{
        width: `${scaledSize}px`,
        height: `${scaledSize}px`,
        top: `${nebula.position.top}%`,
        left: `${nebula.position.left}%`,
        transform: 'translate(-50%, -50%)',
      }}
      onClick={onClick}
      aria-label={`View ${nebula.name}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 rounded-full" />

      {/* ===================== ALWAYS-VISIBLE TITLE ===================== */}
      <div
        className={`absolute text-center pointer-events-none select-none ${orbitron.className}`}
        style={{
          top: '50%',
          left: '95%',
          transform: 'translateX(-50%)',
          color: 'white',
          fontSize: '1.2rem',
        }}
      >
        {nebula.name}
      </div>
    </button>
  );
}
