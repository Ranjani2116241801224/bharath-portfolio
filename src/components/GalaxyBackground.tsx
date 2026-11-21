import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * GALAXY BACKGROUND: MOVING PEACOCK GREEN & BLACK CLOUDS WITH SMALL DOT SNOW / STAR EFFECT
 * 
 * Features:
 * - High-contrast PEACOCK GREEN & DEEP BLACK moving cloud effect.
 * - Dynamic continuous drifting: clouds actively move horizontally and undulate vertically.
 * - Multi-layered atmospheric depth:
 *   1. Glowing Peacock Emerald (0, 220, 150), Teal (4, 190, 170), Aqua (25, 240, 210) (AdditiveBlending).
 *   2. Dark Black Smoke, Shadow Clouds & Cosmic Dust Rifts (NormalBlending) that roll, billow, and occlude.
 * - SMALL DOT SNOW & STAR EFFECT:
 *   Hundreds of tiny glowing dot particles acting as twinkling deep space stars and gentle falling micro snow sparkles.
 *   Multi-depth perspective (pinpoint distant stars, gentle drifting midground snow dots, near sparkling crystals).
 *   Delicate downward drift, horizontal wave swaying, and subtle sparkling shimmer.
 * - Full-page continuous coverage across all sections from Home down to the Footer (5 vertical height zones).
 * - Interactive mouse parallax and continuous camera scroll gliding.
 * - Pitch-black deep space void (#000000) for maximum dramatic contrast.
 */

interface MovingCloudItem {
  sprite: THREE.Sprite;
  baseX: number;
  baseY: number;
  speedX: number;
  floatSpeedY: number;
  floatAmpY: number;
  phase: number;
  rotSpeed: number;
}

export const GalaxyBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check accessibility & device capacity
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    // 1. SCENE & CAMERA SETUP
    const scene = new THREE.Scene();
    // Pitch-black deep space fog
    scene.fog = new THREE.FogExp2(0x000000, 0.00028);

    const camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      4000
    );
    camera.position.z = 450;
    camera.position.y = 0;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);
    container.appendChild(renderer.domElement);

    // 2. PROCEDURAL TEXTURE GENERATION
    
    // A. Luminous Billowy Peacock Green Cloud Texture (3 overlapping feathered lobes)
    const createPeacockCloudTexture = (r: number, g: number, b: number, peakAlpha: number) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.Texture();

      const drawLobe = (cx: number, cy: number, radius: number, alphaMultiplier: number) => {
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        const alpha = peakAlpha * alphaMultiplier;
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`);
        gradient.addColorStop(0.24, `rgba(${r}, ${g}, ${b}, ${(alpha * 0.86).toFixed(3)})`);
        gradient.addColorStop(0.48, `rgba(${r}, ${g}, ${b}, ${(alpha * 0.56).toFixed(3)})`);
        gradient.addColorStop(0.76, `rgba(${r}, ${g}, ${b}, ${(alpha * 0.22).toFixed(3)})`);
        gradient.addColorStop(0.92, `rgba(${r}, ${g}, ${b}, ${(alpha * 0.05).toFixed(3)})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      };

      drawLobe(128, 128, 115, 1.0);
      drawLobe(100, 116, 92, 0.85);
      drawLobe(155, 138, 88, 0.82);

      return new THREE.CanvasTexture(canvas);
    };

    // B. Soft Feathered Peacock Mist Texture
    const createPeacockMistTexture = (r: number, g: number, b: number, peakAlpha: number) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.Texture();

      const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 124);
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${peakAlpha.toFixed(3)})`);
      gradient.addColorStop(0.25, `rgba(${r}, ${g}, ${b}, ${(peakAlpha * 0.85).toFixed(3)})`);
      gradient.addColorStop(0.50, `rgba(${r}, ${g}, ${b}, ${(peakAlpha * 0.55).toFixed(3)})`);
      gradient.addColorStop(0.75, `rgba(${r}, ${g}, ${b}, ${(peakAlpha * 0.24).toFixed(3)})`);
      gradient.addColorStop(0.92, `rgba(${r}, ${g}, ${b}, ${(peakAlpha * 0.06).toFixed(3)})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 256, 256);

      return new THREE.CanvasTexture(canvas);
    };

    // C. Dark Black Smoke & Cosmic Shadow Texture (Feathered dark silhouettes for NormalBlending)
    const createBlackSmokeTexture = (peakAlpha: number) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.Texture();

      const drawDarkLobe = (cx: number, cy: number, radius: number, alphaMultiplier: number) => {
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        const alpha = peakAlpha * alphaMultiplier;
        gradient.addColorStop(0, `rgba(0, 0, 0, ${alpha.toFixed(3)})`);
        gradient.addColorStop(0.28, `rgba(2, 4, 5, ${(alpha * 0.90).toFixed(3)})`);
        gradient.addColorStop(0.55, `rgba(3, 7, 8, ${(alpha * 0.60).toFixed(3)})`);
        gradient.addColorStop(0.80, `rgba(2, 5, 6, ${(alpha * 0.26).toFixed(3)})`);
        gradient.addColorStop(0.95, `rgba(0, 0, 0, ${(alpha * 0.06).toFixed(3)})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      };

      drawDarkLobe(128, 128, 118, 1.0);
      drawDarkLobe(96, 114, 94, 0.88);
      drawDarkLobe(158, 140, 90, 0.85);

      return new THREE.CanvasTexture(canvas);
    };

    // D. Small Glowing Dot Snow & Star Texture (Crisp glowing core with delicate micro halo)
    const createGlowingDotTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.Texture();

      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 28);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      gradient.addColorStop(0.20, 'rgba(240, 255, 255, 0.95)');
      gradient.addColorStop(0.42, 'rgba(180, 245, 255, 0.60)');
      gradient.addColorStop(0.72, 'rgba(45, 225, 205, 0.20)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);

      return new THREE.CanvasTexture(canvas);
    };

    // Peacock Green Spectrum Textures:
    const peacockEmeraldTex = createPeacockCloudTexture(0, 220, 150, 0.38);   // Vibrant peacock emerald
    const peacockTealTex = createPeacockCloudTexture(4, 190, 170, 0.35);      // Deep peacock teal
    const peacockAquaTex = createPeacockCloudTexture(25, 240, 210, 0.32);     // Radiant peacock aqua
    const deepPeacockJadeTex = createPeacockCloudTexture(2, 130, 115, 0.42);  // Rich peacock jade
    const electricPeacockTex = createPeacockCloudTexture(10, 230, 195, 0.36); // Electric peacock neon

    const peacockMistTex = createPeacockMistTexture(0, 210, 150, 0.28);
    const peacockAquaMistTex = createPeacockMistTexture(25, 235, 205, 0.24);

    // Dark Black Smoke & Shadow Textures:
    const deepBlackSmokeTex = createBlackSmokeTexture(0.75); // Dense black cosmic smoke
    const softBlackShadowTex = createBlackSmokeTexture(0.55); // Billowing dark shadow cloud

    const peacockTextures = [
      peacockEmeraldTex,
      peacockTealTex,
      peacockAquaTex,
      deepPeacockJadeTex,
      electricPeacockTex
    ];

    const blackTextures = [
      deepBlackSmokeTex,
      softBlackShadowTex
    ];

    // 3. LAYER: 3D MOVING CLOUD FORMATIONS
    // 5 distinct height zones ensuring full website coverage from Home to Footer:
    const cloudsContainer = new THREE.Group();
    scene.add(cloudsContainer);

    const movingCloudsList: MovingCloudItem[] = [];
    const zoneCenters = [350, -550, -1400, -2300, -3200];

    // Cloud distribution per zone
    const peacockBgCount = isMobile ? 8 : 16;
    const peacockFgCount = isMobile ? 8 : 16;
    const blackCloudCount = isMobile ? 8 : 16;

    zoneCenters.forEach((zoneY, zIdx) => {
      // A. Glowing Peacock Green Background Clouds (Drifting smoothly rightward)
      for (let i = 0; i < peacockBgCount; i++) {
        const tex = peacockTextures[(i + zIdx) % peacockTextures.length];
        const scale = 700 + Math.random() * 550;
        const opacity = 0.18 + Math.random() * 0.18;

        const mat = new THREE.SpriteMaterial({
          map: tex,
          transparent: true,
          opacity: opacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          rotation: Math.random() * Math.PI * 2
        });

        const sprite = new THREE.Sprite(mat);
        const baseX = (Math.random() - 0.5) * 2600;
        const baseY = zoneY + (Math.random() - 0.5) * 650;
        const baseZ = -300 - Math.random() * 350;

        sprite.position.set(baseX, baseY, baseZ);
        sprite.scale.set(scale, scale, 1);
        cloudsContainer.add(sprite);

        movingCloudsList.push({
          sprite,
          baseX,
          baseY,
          speedX: 9 + Math.random() * 12, // Drifting right at 9-21 units/sec
          floatSpeedY: 0.25 + Math.random() * 0.35,
          floatAmpY: 25 + Math.random() * 30,
          phase: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.0008
        });
      }

      // B. Dark Black Smoke & Shadow Clouds (Interspersed, drifting leftward for dramatic contrast)
      for (let i = 0; i < blackCloudCount; i++) {
        const tex = blackTextures[(i + zIdx) % blackTextures.length];
        const scale = 650 + Math.random() * 500;
        const opacity = 0.40 + Math.random() * 0.35; // Dense black shadow occlusion

        const mat = new THREE.SpriteMaterial({
          map: tex,
          transparent: true,
          opacity: opacity,
          blending: THREE.NormalBlending, // NormalBlending darkens and occludes the peacock green
          depthWrite: false,
          rotation: Math.random() * Math.PI * 2
        });

        const sprite = new THREE.Sprite(mat);
        const baseX = (Math.random() - 0.5) * 2600;
        const baseY = zoneY + (Math.random() - 0.5) * 600;
        const baseZ = -200 + (Math.random() - 0.5) * 280;

        sprite.position.set(baseX, baseY, baseZ);
        sprite.scale.set(scale, scale, 1);
        cloudsContainer.add(sprite);

        movingCloudsList.push({
          sprite,
          baseX,
          baseY,
          speedX: -(10 + Math.random() * 14), // Drifting left at 10-24 units/sec
          floatSpeedY: 0.20 + Math.random() * 0.30,
          floatAmpY: 30 + Math.random() * 35,
          phase: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.0010
        });
      }

      // C. Foreground Peacock Green & Aqua Luminous Clouds & Mist (Drifting rightward)
      for (let i = 0; i < peacockFgCount; i++) {
        const tex = i % 2 === 0 ? peacockAquaTex : (i % 3 === 0 ? peacockMistTex : peacockAquaMistTex);
        const scale = 500 + Math.random() * 420;
        const opacity = 0.14 + Math.random() * 0.16;

        const mat = new THREE.SpriteMaterial({
          map: tex,
          transparent: true,
          opacity: opacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          rotation: Math.random() * Math.PI * 2
        });

        const sprite = new THREE.Sprite(mat);
        const baseX = (Math.random() - 0.5) * 2600;
        const baseY = zoneY + (Math.random() - 0.5) * 580;
        const baseZ = -50 + (Math.random() - 0.5) * 220;

        sprite.position.set(baseX, baseY, baseZ);
        sprite.scale.set(scale, scale, 1);
        cloudsContainer.add(sprite);

        movingCloudsList.push({
          sprite,
          baseX,
          baseY,
          speedX: 12 + Math.random() * 16, // Drifting right at 12-28 units/sec
          floatSpeedY: 0.30 + Math.random() * 0.40,
          floatAmpY: 20 + Math.random() * 25,
          phase: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.0012
        });
      }
    });

    // 4. LAYER: SMALL DOT SNOW & STAR EFFECT
    // Hundreds of tiny glowing star dots & micro falling snow crystals
    const dotCount = isMobile ? 550 : 1100;
    const DOT_TOP = 900;
    const DOT_BOTTOM = -3850;
    const DOT_HEIGHT = DOT_TOP - DOT_BOTTOM;

    const dotGeometry = new THREE.BufferGeometry();
    const dotPositions = new Float32Array(dotCount * 3);
    const dotColors = new Float32Array(dotCount * 3);
    const dotFallSpeeds = new Float32Array(dotCount);
    const dotSwayFreq = new Float32Array(dotCount);
    const dotPhases = new Float32Array(dotCount);

    // Color palette: Diamond White, Ice Blue, Soft Peacock Aqua, and Mint
    const colorWhite = new THREE.Color(1.0, 1.0, 1.0);
    const colorIceBlue = new THREE.Color(0.80, 0.95, 1.0);
    const colorPeacockAqua = new THREE.Color(0.40, 0.95, 0.85);
    const colorSoftMint = new THREE.Color(0.85, 1.0, 0.92);
    const dotColorChoices = [colorWhite, colorWhite, colorIceBlue, colorPeacockAqua, colorSoftMint];

    for (let i = 0; i < dotCount; i++) {
      // Spatial distribution across the entire website
      dotPositions[i * 3] = (Math.random() - 0.5) * 2600; // X
      dotPositions[i * 3 + 1] = DOT_BOTTOM + Math.random() * DOT_HEIGHT; // Y
      dotPositions[i * 3 + 2] = -450 + Math.random() * 750; // Z (-450 to +300 for 3D depth)

      // Vertex color
      const chosenColor = dotColorChoices[Math.floor(Math.random() * dotColorChoices.length)];
      dotColors[i * 3] = chosenColor.r;
      dotColors[i * 3 + 1] = chosenColor.g;
      dotColors[i * 3 + 2] = chosenColor.b;

      // Speeds: Mix of slow twinkling star drift and gentle snow falling
      dotFallSpeeds[i] = 8 + Math.random() * 22; // Gentle downward speed
      dotSwayFreq[i] = 0.4 + Math.random() * 0.7; // Horizontal sway frequency
      dotPhases[i] = Math.random() * Math.PI * 2;
    }

    dotGeometry.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3));
    dotGeometry.setAttribute('color', new THREE.BufferAttribute(dotColors, 3));

    const dotTexture = createGlowingDotTexture();
    const dotMaterial = new THREE.PointsMaterial({
      size: isMobile ? 4.2 : 6.0, // Small glowing dot particles
      map: dotTexture,
      transparent: true,
      opacity: 0.82,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    const dotParticles = new THREE.Points(dotGeometry, dotMaterial);
    scene.add(dotParticles);

    // 5. INTERACTIVE 3D PARALLAX & CONTINUOUS SCROLL TRACKING
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let scrollY = 0;
    let targetScrollY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      mouseX = x * 75;
      mouseY = y * 55;
    };

    const handleScroll = () => {
      targetScrollY = window.scrollY || window.pageYOffset;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Handle Window Resize
    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);

    // 6. ANIMATION LOOP: FLUID MOVING CLOUDS, SMALL DOT SNOW / STARS & 3D PARALLAX
    let animationFrameId: number;
    const clock = new THREE.Clock();
    let lastTime = 0;
    const DRIFT_BOUND_X = 1600; // Continuous wrap boundaries [-1600, +1600]
    const DRIFT_WIDTH_X = DRIFT_BOUND_X * 2;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (document.hidden) return;

      const elapsedTime = clock.getElapsedTime();
      const delta = Math.min(Math.max(elapsedTime - lastTime, 0.001), 0.1);
      lastTime = elapsedTime;

      // A. Fluid Cloud Drift & Undulation Animation
      for (let i = 0; i < movingCloudsList.length; i++) {
        const item = movingCloudsList[i];
        
        if (!prefersReducedMotion) {
          // Continuous horizontal wrapping drift
          const rawX = item.baseX + elapsedTime * item.speedX;
          const wrappedX = ((rawX + DRIFT_BOUND_X) % DRIFT_WIDTH_X + DRIFT_WIDTH_X) % DRIFT_WIDTH_X - DRIFT_BOUND_X;
          item.sprite.position.x = wrappedX;

          // Gentle organic vertical wave undulation
          item.sprite.position.y = item.baseY + Math.sin(elapsedTime * item.floatSpeedY + item.phase) * item.floatAmpY;

          // Slow individual cloud rotation
          item.sprite.material.rotation += item.rotSpeed;
        }
      }

      // B. Small Dot Snow & Star Particle Drift & Sparkling
      if (!prefersReducedMotion && dotGeometry) {
        const posArr = dotGeometry.attributes.position.array as Float32Array;

        for (let i = 0; i < dotCount; i++) {
          // Gentle downward fall
          posArr[i * 3 + 1] -= dotFallSpeeds[i] * delta;

          // Delicate horizontal swaying
          posArr[i * 3] += Math.sin(elapsedTime * dotSwayFreq[i] + dotPhases[i]) * 0.22;

          // Continuous vertical wrap when falling below the footer zone
          if (posArr[i * 3 + 1] < DOT_BOTTOM) {
            posArr[i * 3 + 1] = DOT_TOP;
            posArr[i * 3] = (Math.random() - 0.5) * 2600;
          }
        }
        dotGeometry.attributes.position.needsUpdate = true;
      }

      // C. 3D Camera Flythrough & Mouse Parallax
      if (!prefersReducedMotion) {
        // Smooth mouse damping
        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;

        // Smooth scroll damping
        scrollY += (targetScrollY - scrollY) * 0.08;

        // Total scrollable height calculation
        const maxScroll = Math.max(
          1,
          document.documentElement.scrollHeight - window.innerHeight
        );
        const scrollRatio = Math.min(Math.max(scrollY / maxScroll, 0), 1);

        // Continuous Camera Flythrough:
        // Moves camera seamlessly down to Y: -3200 across the full scrollable page
        const baseCamY = -scrollRatio * 3200;
        camera.position.x = targetX * 0.85;
        camera.position.y = baseCamY + targetY * 0.65;
        
        // Dynamic depth oscillation keeps 3D perspective lively throughout every section
        camera.position.z = 450 + Math.sin(scrollRatio * Math.PI * 4) * 45;

        // Dynamic 3D rotational tilt
        camera.rotation.y = -targetX * 0.0006;
        camera.rotation.x = -targetY * 0.0006;
        camera.rotation.z = Math.sin(elapsedTime * 0.12) * 0.008 - targetX * 0.0002;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. CLEANUP
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      dotGeometry.dispose();
      dotMaterial.dispose();
      dotTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
      style={{
        background: 'radial-gradient(ellipse at 50% 25%, #021a17 0%, #010f0e 35%, #000607 70%, #000000 100%)'
      }}
    >
      {/* 3D Moving Peacock Green & Black Clouds with Small Dot Snow / Star Effect */}
      <div ref={mountRef} className="absolute inset-0" />
    </div>
  );
};
