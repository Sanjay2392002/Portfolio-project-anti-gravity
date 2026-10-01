import React, { useRef, useEffect, useCallback, useState } from 'react';

/**
 * WordProfile defines the distinct physical and magnetic personality
 * of each word in the heading.
 *
 * Requirements:
 * 1. "Hello,"   -> Strongest horizontal magnetic response, moves away from cursor,
 *                  max displacement ~12-18px, rotation 2-3°.
 * 2. "I’m"      -> Central balancing element, moves slightly,
 *                  max displacement ~5-8px, rotation 1-2°.
 * 3. "Sanjay."  -> Strongest & most expressive personal identity element, repels from cursor,
 *                  max displacement ~15-22px, rotation 2-4°.
 */
interface WordProfile {
  text: string;
  maxDisplacement: number; // Max displacement in px
  maxRotation: number;     // Max rotation in degrees
  horizontalBias: number;  // Multiplier for X repulsion
  verticalBias: number;    // Multiplier for Y repulsion
}

const WORDS: WordProfile[] = [
  {
    text: 'Hello,',
    maxDisplacement: 16,   // 12-18px
    maxRotation: 2.5,      // 2-3 deg
    horizontalBias: 1.35,  // Strongest horizontal response
    verticalBias: 0.65,
  },
  {
    text: 'I’m',
    maxDisplacement: 7,    // 5-8px
    maxRotation: 1.5,      // 1-2 deg
    horizontalBias: 1.0,   // Central balance
    verticalBias: 0.8,
  },
  {
    text: 'Sanjay.',
    maxDisplacement: 20,   // 15-22px
    maxRotation: 3.5,      // 2-4 deg
    horizontalBias: 1.15,  // Strongest personal identity response
    verticalBias: 0.95,
  },
];

// Spring physics constants: calibrated for refined, weighted editorial physical feel
const SPRING_STIFFNESS = 0.10; // Moderate spring rate
const SPRING_DAMPING = 0.79;   // Smooth damping with subtle micro-overshoot and no oscillation
const INFLUENCE_RADIUS = 210;  // Radius in px within which the cursor exerts magnetic force
const ZONE_PADDING = 120;      // Bounding box padding around heading defining active interaction zone

// Drag constraint limits
const DRAG_MAX_X = 25;   // ±25px
const DRAG_MAX_Y = 15;   // ±15px
const DRAG_MAX_ROT = 4;  // ±4 deg

export const MagneticHeroHeading: React.FC<{ className?: string }> = ({ className = '' }) => {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const wordRefs = [
    useRef<HTMLSpanElement>(null),
    useRef<HTMLSpanElement>(null),
    useRef<HTMLSpanElement>(null),
  ];

  // Motion physics state for the 3 words
  const physicsState = useRef([
    { currentX: 0, currentY: 0, currentRot: 0, vx: 0, vy: 0, vRot: 0, targetX: 0, targetY: 0, targetRot: 0 },
    { currentX: 0, currentY: 0, currentRot: 0, vx: 0, vy: 0, vRot: 0, targetX: 0, targetY: 0, targetRot: 0 },
    { currentX: 0, currentY: 0, currentRot: 0, vx: 0, vy: 0, vRot: 0, targetX: 0, targetY: 0, targetRot: 0 },
  ]);

  // Drag interaction state
  const dragRef = useRef<{
    activeWordIndex: number | null;
    startX: number;
    startY: number;
    currentOffsetX: number;
    currentOffsetY: number;
    currentOffsetRot: number;
  }>({
    activeWordIndex: null,
    startX: 0,
    startY: 0,
    currentOffsetX: 0,
    currentOffsetY: 0,
    currentOffsetRot: 0,
  });

  const mouseInZoneRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const isFinePointerRef = useRef(true);
  const [activeDragIndex, setActiveDragIndex] = useState<number | null>(null);

  // Helper to trigger requestAnimationFrame loop
  const ensureAnimationLoop = useCallback(() => {
    if (!isAnimatingRef.current) {
      isAnimatingRef.current = true;
      rafIdRef.current = requestAnimationFrame(physicsTick);
    }
  }, []);

  /**
   * Physics loop running at 60fps via requestAnimationFrame.
   * Directly updates DOM styles without causing any React re-renders.
   */
  const physicsTick = useCallback(() => {
    const states = physicsState.current;
    const drag = dragRef.current;
    let totalKineticEnergy = 0;

    // Physical neighbor coupling:
    // When one word moves, neighbors feel a subtle sympathetic shift
    const coup0X = 0.14 * states[1].currentX;
    const coup0Y = 0.12 * states[1].currentY;

    const coup1X = 0.18 * states[0].currentX + 0.18 * states[2].currentX;
    const coup1Y = 0.15 * states[0].currentY + 0.15 * states[2].currentY;

    const coup2X = 0.14 * states[1].currentX;
    const coup2Y = 0.12 * states[1].currentY;

    const couplingOffsets = [
      { x: coup0X, y: coup0Y },
      { x: coup1X, y: coup1Y },
      { x: coup2X, y: coup2Y },
    ];

    for (let i = 0; i < 3; i++) {
      const s = states[i];
      const isWordDragged = drag.activeWordIndex === i;

      let effectiveTargetX = s.targetX + couplingOffsets[i].x;
      let effectiveTargetY = s.targetY + couplingOffsets[i].y;
      let effectiveTargetRot = s.targetRot;

      if (isWordDragged) {
        // Dragged word directly adopts constrained drag offsets
        effectiveTargetX = drag.currentOffsetX;
        effectiveTargetY = drag.currentOffsetY;
        effectiveTargetRot = drag.currentOffsetRot;
      }

      // Spring acceleration toward target
      const ax = (effectiveTargetX - s.currentX) * SPRING_STIFFNESS;
      const ay = (effectiveTargetY - s.currentY) * SPRING_STIFFNESS;
      const aRot = (effectiveTargetRot - s.currentRot) * SPRING_STIFFNESS;

      // Integrate velocity with damping
      s.vx = (s.vx + ax) * SPRING_DAMPING;
      s.vy = (s.vy + ay) * SPRING_DAMPING;
      s.vRot = (s.vRot + aRot) * SPRING_DAMPING;

      // Integrate position
      s.currentX += s.vx;
      s.currentY += s.vy;
      s.currentRot += s.vRot;

      // Energy calculation for sleep settling
      totalKineticEnergy += Math.abs(s.vx) + Math.abs(s.vy) + Math.abs(s.vRot) +
        Math.abs(s.currentX) + Math.abs(s.currentY) + Math.abs(s.currentRot);

      // Apply transform directly to GPU-accelerated layer
      const el = wordRefs[i].current;
      if (el) {
        el.style.transform = `translate3d(${s.currentX.toFixed(2)}px, ${s.currentY.toFixed(2)}px, 0px) rotate(${s.currentRot.toFixed(2)}deg)`;
      }
    }

    // Settling check: when idle and kinetic energy is near zero, sleep the rAF loop
    const isDragging = drag.activeWordIndex !== null;
    if (!mouseInZoneRef.current && !isDragging && totalKineticEnergy < 0.04) {
      for (let i = 0; i < 3; i++) {
        const s = states[i];
        s.currentX = 0;
        s.currentY = 0;
        s.currentRot = 0;
        s.vx = 0;
        s.vy = 0;
        s.vRot = 0;
        s.targetX = 0;
        s.targetY = 0;
        s.targetRot = 0;
        const el = wordRefs[i].current;
        if (el) {
          el.style.transform = 'translate3d(0px, 0px, 0px) rotate(0deg)';
        }
      }
      isAnimatingRef.current = false;
      rafIdRef.current = null;
      return;
    }

    // Continue loop
    rafIdRef.current = requestAnimationFrame(physicsTick);
  }, []);

  /**
   * Pointer move handler calculates cursor distance & repulsion for each word.
   */
  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isFinePointerRef.current || !containerRef.current) return;

    // Handle ongoing drag first
    const drag = dragRef.current;
    if (drag.activeWordIndex !== null) {
      const rawDeltaX = e.clientX - drag.startX;
      const rawDeltaY = e.clientY - drag.startY;

      // Constrain drag strictly to specified limits
      drag.currentOffsetX = Math.max(-DRAG_MAX_X, Math.min(DRAG_MAX_X, rawDeltaX));
      drag.currentOffsetY = Math.max(-DRAG_MAX_Y, Math.min(DRAG_MAX_Y, rawDeltaY));
      drag.currentOffsetRot = Math.max(-DRAG_MAX_ROT, Math.min(DRAG_MAX_ROT, (drag.currentOffsetX / DRAG_MAX_X) * DRAG_MAX_ROT));

      ensureAnimationLoop();
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const inZone = (
      e.clientX >= containerRect.left - ZONE_PADDING &&
      e.clientX <= containerRect.right + ZONE_PADDING &&
      e.clientY >= containerRect.top - ZONE_PADDING &&
      e.clientY <= containerRect.bottom + ZONE_PADDING
    );

    mouseInZoneRef.current = inZone;

    if (!inZone) {
      // Return targets to 0 when cursor exits zone
      for (let i = 0; i < 3; i++) {
        physicsState.current[i].targetX = 0;
        physicsState.current[i].targetY = 0;
        physicsState.current[i].targetRot = 0;
      }
      ensureAnimationLoop();
      return;
    }

    // Calculate magnetic repulsion for each word independently
    for (let i = 0; i < 3; i++) {
      const el = wordRefs[i].current;
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const distance = Math.hypot(dx, dy);

      const profile = WORDS[i];

      if (distance < INFLUENCE_RADIUS) {
        // Normalized proximity from 0 (edge) to 1 (center)
        const proximity = 1 - distance / INFLUENCE_RADIUS;

        // Progressive curve: power 2.2 produces subtle response at medium distance
        // and gentle physical push away when very close
        const progressiveRepulsion = Math.pow(proximity, 2.2);

        // Repulsion unit vector pointing away from cursor
        const repelX = -dx / (distance + 0.001);
        const repelY = -dy / (distance + 0.001);

        // Word-specific displacement with horizontal/vertical biases
        const rawDispX = repelX * profile.maxDisplacement * profile.horizontalBias * progressiveRepulsion;
        const rawDispY = repelY * profile.maxDisplacement * profile.verticalBias * progressiveRepulsion;

        // Subtle rotation proportional to horizontal offset
        const rotCurve = Math.pow(proximity, 1.4);
        const rawRot = (-dx / INFLUENCE_RADIUS) * profile.maxRotation * rotCurve;

        // Clamp to word-specific limits
        physicsState.current[i].targetX = Math.max(-profile.maxDisplacement, Math.min(profile.maxDisplacement, rawDispX));
        physicsState.current[i].targetY = Math.max(-profile.maxDisplacement * 0.85, Math.min(profile.maxDisplacement * 0.85, rawDispY));
        physicsState.current[i].targetRot = Math.max(-profile.maxRotation, Math.min(profile.maxRotation, rawRot));
      } else {
        physicsState.current[i].targetX = 0;
        physicsState.current[i].targetY = 0;
        physicsState.current[i].targetRot = 0;
      }
    }

    ensureAnimationLoop();
  }, [ensureAnimationLoop]);

  /**
   * Start dragging a word (Desktop only)
   */
  const handleWordPointerDown = (index: number, e: React.PointerEvent<HTMLSpanElement>) => {
    // Only drag with primary mouse button on fine pointer devices
    if (!isFinePointerRef.current || e.button !== 0) return;

    e.preventDefault();
    dragRef.current = {
      activeWordIndex: index,
      startX: e.clientX,
      startY: e.clientY,
      currentOffsetX: physicsState.current[index].currentX,
      currentOffsetY: physicsState.current[index].currentY,
      currentOffsetRot: physicsState.current[index].currentRot,
    };
    setActiveDragIndex(index);
    ensureAnimationLoop();
  };

  /**
   * Release drag and let physics return word smoothly to original position
   */
  const handlePointerUp = useCallback(() => {
    if (dragRef.current.activeWordIndex !== null) {
      dragRef.current.activeWordIndex = null;
      dragRef.current.currentOffsetX = 0;
      dragRef.current.currentOffsetY = 0;
      dragRef.current.currentOffsetRot = 0;
      setActiveDragIndex(null);
      ensureAnimationLoop();
    }
  }, [ensureAnimationLoop]);

  // Window-level event listener attachment
  useEffect(() => {
    const pointerQuery = window.matchMedia('(pointer: fine)');
    const updatePointerType = () => {
      isFinePointerRef.current = pointerQuery.matches;
    };
    updatePointerType();
    const handleMouseLeaveWindow = () => {
      mouseInZoneRef.current = false;
      for (let i = 0; i < 3; i++) {
        physicsState.current[i].targetX = 0;
        physicsState.current[i].targetY = 0;
        physicsState.current[i].targetRot = 0;
      }
      ensureAnimationLoop();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('pointercancel', handlePointerUp, { passive: true });
    document.documentElement.addEventListener('pointerleave', handleMouseLeaveWindow);

    return () => {
      pointerQuery.removeEventListener('change', updatePointerType);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      document.documentElement.removeEventListener('pointerleave', handleMouseLeaveWindow);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [handlePointerMove, handlePointerUp]);

  return (
    <h2
      ref={containerRef}
      className={`magnetic-hero-heading ${className}`}
      aria-label="Hello, I’m Sanjay."
    >
      {WORDS.map((word, index) => {
        const isDragging = activeDragIndex === index;
        return (
          <React.Fragment key={word.text}>
            <span
              ref={wordRefs[index]}
              className={`magnetic-word magnetic-word-${index} ${isDragging ? 'is-dragging' : ''}`}
              onPointerDown={(e) => handleWordPointerDown(index, e)}
              data-cursor="native"
            >
              {word.text}
            </span>
            {index < WORDS.length - 1 && ' '}
          </React.Fragment>
        );
      })}
    </h2>
  );
};
