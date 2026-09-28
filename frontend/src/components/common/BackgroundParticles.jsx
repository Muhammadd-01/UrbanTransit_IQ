import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Global interactive state shared between window listeners and Three.js frame
const mouseState = {
  worldX: 0,
  worldZ: 0,
  active: false,
  ripples: [] // [{ x, z, time, radius, maxRadius, intensity }]
};

// Global window event listeners (attached once)
if (typeof window !== 'undefined') {
  window.addEventListener('pointermove', (e) => {
    // Map screen normalized coordinates to 3D ground plane coordinates
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = -(e.clientY / window.innerHeight) * 2 + 1;
    mouseState.worldX = nx * 32;
    mouseState.worldZ = -ny * 22;
    mouseState.active = true;
  }, { passive: true });

  window.addEventListener('pointerleave', () => {
    mouseState.active = false;
  });

  window.addEventListener('pointerdown', (e) => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = -(e.clientY / window.innerHeight) * 2 + 1;
    const wx = nx * 32;
    const wz = -ny * 22;
    
    // Spawn a 3D expanding wave ripple
    mouseState.ripples.push({
      x: wx,
      z: wz,
      time: 0,
      maxRadius: 36,
      intensity: 2.8
    });

    // Keep at most 5 active ripples for maximum performance
    if (mouseState.ripples.length > 5) {
      mouseState.ripples.shift();
    }
  }, { passive: true });
}

const InteractiveParticleWave = ({ isDark }) => {
  const ref = useRef();
  const { scene } = useThree();
  const gridX = 44;
  const gridZ = 34;
  const sep = 1.7;

  // Base coordinates
  const { positions, baseCoords } = useMemo(() => {
    const pos = [];
    const base = [];
    for (let xi = 0; xi < gridX; xi++) {
      for (let zi = 0; zi < gridZ; zi++) {
        const x = sep * (xi - gridX / 2);
        const z = sep * (zi - gridZ / 2);
        pos.push(x, 0, z);
        base.push({ x, z, xi, zi });
      }
    }
    return {
      positions: new Float32Array(pos),
      baseCoords: base
    };
  }, [gridX, gridZ, sep]);

  // Adjust scene fog dynamically on theme change
  useEffect(() => {
    if (scene) {
      scene.fog = new THREE.Fog(isDark ? '#070913' : '#F5F5F7', isDark ? 10 : 20, isDark ? 48 : 65);
    }
  }, [scene, isDark]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const time = state.clock.getElapsedTime() * 0.45;
    const posArray = ref.current.geometry.attributes.position.array;

    // Advance ripples
    for (let r = mouseState.ripples.length - 1; r >= 0; r--) {
      const rip = mouseState.ripples[r];
      rip.time += delta * 18;
      rip.intensity *= 0.94;
      if (rip.time > rip.maxRadius || rip.intensity < 0.05) {
        mouseState.ripples.splice(r, 1);
      }
    }

    const mouseX = mouseState.worldX;
    const mouseZ = mouseState.worldZ;
    const mouseActive = mouseState.active;
    const ripples = mouseState.ripples;
    const rippleCount = ripples.length;

    let idx = 0;
    for (let i = 0; i < baseCoords.length; i++) {
      const { x, z, xi, zi } = baseCoords[i];

      // 1. Natural mathematical ambient wave
      let y = Math.sin((xi + time * 1.2) * 0.3) * 1.4 + Math.cos((zi + time * 0.9) * 0.25) * 1.4 - 5.5;

      // 2. Interactive Mouse Hover Elevation (Magnetic dynamic ripple)
      if (mouseActive) {
        const dx = x - mouseX;
        const dz = z - mouseZ;
        const distSq = dx * dx + dz * dz;
        if (distSq < 120) {
          const dist = Math.sqrt(distSq);
          // Fluid Gaussian crest under cursor
          const hoverBoost = Math.exp(-distSq * 0.035) * 3.8;
          // Fluid circular wake
          const rippleRing = Math.sin(dist * 0.8 - time * 4) * 0.8 * Math.exp(-dist * 0.15);
          y += hoverBoost + rippleRing;
        }
      }

      // 3. Interactive Click Shockwave Ripples
      if (rippleCount > 0) {
        for (let r = 0; r < rippleCount; r++) {
          const rip = ripples[r];
          const rx = x - rip.x;
          const rz = z - rip.z;
          const rDist = Math.sqrt(rx * rx + rz * rz);
          const diff = Math.abs(rDist - rip.time);
          if (diff < 4.5) {
            // Smooth bell wave pulse
            const pulse = Math.cos((diff / 4.5) * (Math.PI / 2)) * rip.intensity;
            y += pulse;
          }
        }
      }

      posArray[idx + 1] = y;
      idx += 3;
    }

    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.rotation.y = time * 0.025;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={isDark ? '#00F0FF' : '#005CE6'}
        size={isDark ? 0.13 : 0.20}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={isDark ? 0.70 : 0.85}
        blending={isDark ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </Points>
  );
};

const BackgroundParticles = React.memo(() => {
  const [isDark, setIsDark] = useState(() => {
    return typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const theme = document.documentElement.getAttribute('data-theme');
      setIsDark(theme === 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      className="three-background-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        background: 'transparent',
        transition: 'opacity 0.6s ease'
      }}
    >
      <Canvas 
        dpr={[1, 1.5]} 
        camera={{ position: [0, 8, 22], fov: 58 }} 
        gl={{ powerPreference: "high-performance", antialias: false, alpha: true }}
      >
        <InteractiveParticleWave isDark={isDark} />
      </Canvas>
    </div>
  );
});

export default BackgroundParticles;

// Global message listener for iframe support
if (typeof window !== 'undefined') {
  window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'IFRAME_POINTER_MOVE') {
      const nx = (e.data.clientX / e.data.innerWidth) * 2 - 1;
      const ny = -(e.data.clientY / e.data.innerHeight) * 2 + 1;
      mouseState.worldX = nx * 32;
      mouseState.worldZ = -ny * 22;
      mouseState.active = true;
    } else if (e.data && e.data.type === 'IFRAME_POINTER_LEAVE') {
      mouseState.active = false;
    } else if (e.data && e.data.type === 'IFRAME_POINTER_DOWN') {
      const nx = (e.data.clientX / e.data.innerWidth) * 2 - 1;
      const ny = -(e.data.clientY / e.data.innerHeight) * 2 + 1;
      const wx = nx * 32;
      const wz = -ny * 22;
      mouseState.ripples.push({
        x: wx,
        z: wz,
        time: 0,
        maxRadius: 36,
        intensity: 2.8
      });
      if (mouseState.ripples.length > 5) mouseState.ripples.shift();
    }
  });
}
