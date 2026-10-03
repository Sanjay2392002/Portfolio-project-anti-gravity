import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

type CursorMode = 'default' | 'view' | 'link' | 'native';

export const InteractiveCursor: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<CursorMode>('default');
  const [pressed, setPressed] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Raw mouse coordinates
  const targetX = useMotionValue(-100);
  const targetY = useMotionValue(-100);

  // Center dot: high responsiveness for precise tactile aim
  const dotX = useSpring(targetX, { damping: 42, stiffness: 850, mass: 0.12 });
  const dotY = useSpring(targetY, { damping: 42, stiffness: 850, mass: 0.12 });

  // Outer ring / badge: silky fluid trailing spring with subtle organic easing
  const ringX = useSpring(targetX, { damping: 28, stiffness: 240, mass: 0.38 });
  const ringY = useSpring(targetY, { damping: 28, stiffness: 240, mass: 0.38 });

  const isFirstMove = useRef(true);

  useEffect(() => {
    // Only enable on desktop pointer devices with fine pointer (not touch)
    const pointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updateEnabled = () => {
      setEnabled(pointerQuery.matches && !motionQuery.matches);
    };

    updateEnabled();
    pointerQuery.addEventListener('change', updateEnabled);
    motionQuery.addEventListener('change', updateEnabled);

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;

      if (isFirstMove.current) {
        targetX.jump(event.clientX);
        targetY.jump(event.clientY);
        dotX.jump(event.clientX);
        dotY.jump(event.clientY);
        ringX.jump(event.clientX);
        ringY.jump(event.clientY);
        isFirstMove.current = false;
      } else {
        targetX.set(event.clientX);
        targetY.set(event.clientY);
      }

      if (!visible) {
        setVisible(true);
      }
    };

    const handlePointerOver = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      // Dark background detection for adaptive palette
      const darkArea = target.closest(
        '.home-skills-wrapper, .bg-black, [class*="bg-black"], #contact, [data-theme="dark"], .lightbox-backdrop'
      );
      setIsDark(Boolean(darkArea));

      // Native inputs, textareas, contenteditable, select, or native drag zones
      const nativeElement = target.closest(
        'input, textarea, select, [contenteditable="true"], [data-cursor="native"], .magnetic-word'
      );
      if (nativeElement) {
        setMode('native');
        return;
      }

      // Portfolio/work items showing VIEW label
      const viewElement = target.closest('[data-cursor="view"]');
      if (viewElement) {
        setMode('view');
        return;
      }

      // Clickable/link elements: interactive hover state
      const interactiveElement = target.closest(
        'a, button, [role="button"], [data-cursor="link"], [data-cursor="character"], label[for], summary, .cursor-pointer'
      );
      if (interactiveElement) {
        setMode('link');
        return;
      }

      setMode('default');
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button === 0) {
        setPressed(true);
      }
    };

    const handlePointerUp = () => {
      setPressed(false);
    };

    const handleMouseLeave = () => {
      setVisible(false);
      setPressed(false);
      setMode('default');
    };

    const handleMouseEnter = () => {
      setVisible(true);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.addEventListener('pointerover', handlePointerOver, { passive: true });
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('blur', handleMouseLeave);

    return () => {
      pointerQuery.removeEventListener('change', updateEnabled);
      motionQuery.removeEventListener('change', updateEnabled);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointerover', handlePointerOver);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('blur', handleMouseLeave);
    };
  }, [dotX, dotY, ringX, ringY, targetX, targetY, visible]);

  if (!enabled) return null;

  const isHidden = !visible || mode === 'native';
  const showDot = !isHidden && mode !== 'view';
  const themeClass = isDark ? 'cursor--dark' : 'cursor--light';

  return (
    <div className={`designer-cursor-system ${themeClass}`} aria-hidden="true">
      {/* Outer fluid trailing ring / contextual badge */}
      <motion.div
        className="designer-cursor-follower"
        style={{
          x: ringX,
          y: ringY,
          opacity: isHidden ? 0 : 1,
        }}
      >
        <div
          className={`designer-cursor-ring designer-cursor-ring--${mode}${
            pressed ? ' is-pressed' : ''
          }`}
        >
          {mode === 'view' ? (
            <span className="designer-cursor-view-text">VIEW</span>
          ) : (
            <span className="designer-cursor-orbit" />
          )}
        </div>
      </motion.div>

      {/* Crisp, immediate center dot */}
      <motion.div
        className="designer-cursor-lead"
        style={{
          x: dotX,
          y: dotY,
          opacity: showDot ? 1 : 0,
        }}
      >
        <div
          className={`designer-cursor-dot designer-cursor-dot--${mode}${
            pressed ? ' is-pressed' : ''
          }`}
        />
      </motion.div>
    </div>
  );
};
