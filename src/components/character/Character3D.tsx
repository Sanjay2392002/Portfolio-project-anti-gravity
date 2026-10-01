import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface Character3DProps {
  variant?: 'full' | 'bust';
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  enableMouseLook?: boolean;
  enableTilt?: boolean;
}

const POSES = {
  sideLeft: '/assets/character/character-90-left.png',
  quarterLeft: '/assets/character/character-45-left.png',
  front: '/assets/character/character-front.png',
  quarterRight: '/assets/character/character-45-right.png',
  sideRight: '/assets/character/character-90-right.png',
};

export const Character3D: React.FC<Character3DProps> = ({
  variant = 'full',
  size = 'hero',
  className = '',
  enableMouseLook = true,
  enableTilt = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Continuous rotation angle clamped between -90 and +90 degrees (0 = front)
  const [angle, setAngle] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartAngleRef = useRef<number>(0);
  const returnTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Preload all 5 turnaround images on mount for instant zero-flicker transitions
  useEffect(() => {
    Object.values(POSES).forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Motion values for smooth 3D tilt & parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 26, stiffness: 190, mass: 0.45 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Subtle 3D pitch/roll tilt
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [4, -4]);
  const translateX = useTransform(smoothX, [-0.5, 0.5], [-8, 8]);
  const translateY = useTransform(smoothY, [-0.5, 0.5], [-4, 4]);

  // Inverse lighting shadow parallax (real-world studio physics)
  const shadowOffsetX = useTransform(smoothX, [-0.5, 0.5], [8, -8]);
  const shadowOffsetY = useTransform(smoothY, [-0.5, 0.5], [2, -2]);

  // Window-wide cursor tracking when hovering and not actively dragging
  useEffect(() => {
    if (reducedMotion || !enableMouseLook) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) return;
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Normalized coordinates from -0.5 to 0.5
      const normX = (e.clientX - centerX) / window.innerWidth;
      const normY = (e.clientY - centerY) / window.innerHeight;

      const clampedX = Math.max(-0.5, Math.min(0.5, normX));
      const clampedY = Math.max(-0.5, Math.min(0.5, normY));

      mouseX.set(clampedX);
      mouseY.set(clampedY);

      // Follow cursor rotation across full -90 to +90 spectrum
      const targetAngle = clampedX * 130;
      const clampedAngle = Math.max(-90, Math.min(90, targetAngle));
      setAngle(clampedAngle);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [reducedMotion, enableMouseLook, isDragging, mouseX, mouseY]);

  // Pointer drag interaction handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    if (returnTimerRef.current) {
      clearTimeout(returnTimerRef.current);
      returnTimerRef.current = null;
    }

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    dragStartAngleRef.current = angle;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartXRef.current;
    // ~160px drag = 90 degrees rotation
    const calculatedAngle = dragStartAngleRef.current + deltaX * (90 / 160);
    const clampedAngle = Math.max(-90, Math.min(90, calculatedAngle));
    setAngle(clampedAngle);
  };

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    // After user finishes dragging, gently ease back to center after a comfortable pause
    if (returnTimerRef.current) clearTimeout(returnTimerRef.current);
    returnTimerRef.current = setTimeout(() => {
      const startAngle = angle;
      const startTime = performance.now();
      const duration = 550; // ms

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = startAngle * (1 - ease);
        setAngle(current);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          setAngle(0);
        }
      };

      requestAnimationFrame(step);
    }, 2200);
  }, [isDragging, angle]);

  // Determine active turnaround frame from angle [-90 to +90]
  const getCurrentPose = () => {
    if (angle <= -65) return { src: POSES.sideLeft, base: -90, type: 'sideLeft' as const };
    if (angle <= -20) return { src: POSES.quarterLeft, base: -45, type: 'quarterLeft' as const };
    if (angle < 20) return { src: POSES.front, base: 0, type: 'front' as const };
    if (angle < 65) return { src: POSES.quarterRight, base: 45, type: 'quarterRight' as const };
    return { src: POSES.sideRight, base: 90, type: 'sideRight' as const };
  };

  const currentPose = getCurrentPose();

  // Continuous micro 3D perspective rotation within each bracket for seamless turnaround
  const microRotation = (angle - currentPose.base) * 0.35;

  return (
    <div
      ref={containerRef}
      className={`hero-character-wrapper relative inline-flex flex-col items-center justify-center select-none ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!reducedMotion && !isDragging) {
          mouseX.set(0);
          mouseY.set(0);
        }
      }}
      style={{
        touchAction: 'pan-y',
        cursor: isDragging ? 'grabbing' : 'grab',
        width: '100%',
        maxWidth: '360px',
      }}
      aria-label="Interactive 3D character of Sanjay. Drag horizontally or move cursor to turn left and right."
      role="region"
    >
      {/* Complete Full-Body Character Container (Directly on Floor) */}
      <div
        className="relative flex items-center justify-center"
        style={{
          width: 'clamp(240px, 28vw, 340px)',
          aspectRatio: '400 / 680',
          perspective: 1200,
        }}
      >
        <motion.div
          className="relative w-full h-full flex items-center justify-center"
          style={
            reducedMotion || !enableTilt
              ? undefined
              : {
                  rotateX,
                  x: translateX,
                  y: translateY,
                  transformStyle: 'preserve-3d',
                }
          }
          animate={reducedMotion ? undefined : { scale: isHovered ? 1.015 : 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src={currentPose.src}
            alt="Sanjay — 3D Character turning left and right"
            draggable={false}
            className="w-full h-full object-contain pointer-events-none transition-opacity duration-150"
            style={{
              transform: `rotateY(${microRotation}deg)`,
              transformOrigin: '50% 95%',
              filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.06))',
            }}
          />
        </motion.div>
      </div>

      {/* ULTRAREALISTIC DIRECT-FLOOR SHADOWS (NO PODIUM) */}
      <motion.div
        className="relative pointer-events-none -mt-7 sm:-mt-8 flex flex-col items-center justify-center"
        style={{
          width: 'clamp(240px, 28vw, 340px)',
          x: shadowOffsetX,
          y: shadowOffsetY,
        }}
      >
        <svg
          viewBox="0 0 400 90"
          className="w-full h-auto overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Soft diffuse floor ambient halo */}
            <radialGradient id="floorAmbient" cx="50%" cy="45%" r="50%">
              <stop offset="0%" stopColor="#141a16" stopOpacity="0.16" />
              <stop offset="55%" stopColor="#141a16" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#141a16" stopOpacity="0" />
            </radialGradient>
            {/* Directional key-light drop shadow */}
            <radialGradient id="floorKeyDrop" cx="49%" cy="42%" r="50%">
              <stop offset="0%" stopColor="#121814" stopOpacity="0.28" />
              <stop offset="50%" stopColor="#121814" stopOpacity="0.10" />
              <stop offset="85%" stopColor="#121814" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#121814" stopOpacity="0" />
            </radialGradient>

            {/* Natural penumbra Gaussian blurs */}
            <filter id="blurTight" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.5" />
            </filter>
            <filter id="blurMed" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="5.5" />
            </filter>
            <filter id="blurWide" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="14" />
            </filter>
          </defs>

          {/* 1. Broad Diffuse Ambient Floor Shadow */}
          <ellipse cx="200" cy="28" rx="160" ry="24" fill="url(#floorAmbient)" filter="url(#blurWide)" />

          {/* 2. Directional Key Drop Shadow */}
          <ellipse cx="198" cy="24" rx="120" ry="18" fill="url(#floorKeyDrop)" filter="url(#blurMed)" />

          {/* 3. Soft Body Ambient Bridge connecting feet */}
          <ellipse cx="200" cy="18" rx="60" ry="11" fill="#161e18" opacity="0.16" filter="url(#blurMed)" />

          {/* 4. Dynamic Sneaker Sole Contact Occlusion (Adapts to Angle) */}
          {currentPose.type === 'front' && (
            <g className="transition-opacity duration-200">
              {/* Left Sole Contact Crevice & Penumbra */}
              <ellipse cx="242" cy="16" rx="23" ry="5.5" fill="#0e1410" opacity="0.72" filter="url(#blurTight)" />
              <ellipse cx="244" cy="18" rx="30" ry="8.5" fill="#121814" opacity="0.36" filter="url(#blurMed)" />

              {/* Right Sole Contact Crevice & Penumbra */}
              <ellipse cx="158" cy="16" rx="23" ry="5.5" fill="#0e1410" opacity="0.72" filter="url(#blurTight)" />
              <ellipse cx="156" cy="18" rx="30" ry="8.5" fill="#121814" opacity="0.36" filter="url(#blurMed)" />
            </g>
          )}

          {currentPose.type === 'quarterLeft' && (
            <g className="transition-opacity duration-200">
              {/* Left Foot Forward */}
              <ellipse cx="178" cy="17" rx="25" ry="6" fill="#0e1410" opacity="0.74" filter="url(#blurTight)" />
              <ellipse cx="176" cy="19" rx="32" ry="9" fill="#121814" opacity="0.38" filter="url(#blurMed)" />
              {/* Right Foot Behind */}
              <ellipse cx="236" cy="15" rx="21" ry="5" fill="#0e1410" opacity="0.64" filter="url(#blurTight)" />
              <ellipse cx="238" cy="17" rx="27" ry="8" fill="#121814" opacity="0.30" filter="url(#blurMed)" />
            </g>
          )}

          {currentPose.type === 'sideLeft' && (
            <g className="transition-opacity duration-200">
              {/* Profile Sole Footprint */}
              <ellipse cx="198" cy="16" rx="32" ry="6.5" fill="#0e1410" opacity="0.76" filter="url(#blurTight)" />
              <ellipse cx="196" cy="18" rx="42" ry="10" fill="#121814" opacity="0.40" filter="url(#blurMed)" />
            </g>
          )}

          {currentPose.type === 'quarterRight' && (
            <g className="transition-opacity duration-200">
              {/* Right Foot Forward */}
              <ellipse cx="222" cy="17" rx="25" ry="6" fill="#0e1410" opacity="0.74" filter="url(#blurTight)" />
              <ellipse cx="224" cy="19" rx="32" ry="9" fill="#121814" opacity="0.38" filter="url(#blurMed)" />
              {/* Left Foot Behind */}
              <ellipse cx="164" cy="15" rx="21" ry="5" fill="#0e1410" opacity="0.64" filter="url(#blurTight)" />
              <ellipse cx="162" cy="17" rx="27" ry="8" fill="#121814" opacity="0.30" filter="url(#blurMed)" />
            </g>
          )}

          {currentPose.type === 'sideRight' && (
            <g className="transition-opacity duration-200">
              {/* Profile Sole Footprint */}
              <ellipse cx="202" cy="16" rx="32" ry="6.5" fill="#0e1410" opacity="0.76" filter="url(#blurTight)" />
              <ellipse cx="204" cy="18" rx="42" ry="10" fill="#121814" opacity="0.40" filter="url(#blurMed)" />
            </g>
          )}
        </svg>
      </motion.div>
    </div>
  );
};
