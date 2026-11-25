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
  const dotX = useSpring(targetX, { damping: 45, stiffness: 1000, mass: 0.08 });
  const dotY = useSpring(targetY, { damping: 45, stiffness: 1000, mass: 0.08 });

  // Outer ring / badge: silky fluid trailing spring with subtle organic easing
  const ringX = useSpring(targetX, { damping: 28, stiffness: 280, mass: 0.32 });
  const ringY = useSpring(targetY, { damping: 28, stiffness: 280, mass: 0.32 });

  const isFirstMove = useRef(true);

  useEffect(() => {
    // Only disable if device is purely touch with no fine pointer, or user reduced motion
    const isTouchOnly = () => {
      return (
        window.matchMedia('(pointer: coarse)').matches &&
        !window.matchMedia('(any-pointer: fine)').matches
      );
    };

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updateEnabled = () => {
      setEnabled(!isTouchOnly() && !motionQuery.matches);
    };

    updateEnabled();
    motionQuery.addEventListener('change', updateEnabled);

    const isDarkBackground = (el: Element | null): boolean => {
      let curr = el;
      while (curr && curr !== document.body && curr !== document.documentElement) {
        if (
          curr.matches(
            '.home-skills-wrapper, .bg-black, [class*="bg-black"], [class*="bg-[#000000]"], [class*="bg-[#111111]"], #contact, [data-theme="dark"], .lightbox-backdrop, .home-about-cta:not(.home-about-cta-secondary)'
          )
        ) {
          return true;
        }
        const style = window.getComputedStyle(curr);
        const bg = style.backgroundColor;
        if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
          const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (match) {
            const r = parseInt(match[1], 10);
            const g = parseInt(match[2], 10);
            const b = parseInt(match[3], 10);
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            return brightness < 128;
          }
        }
        curr = curr.parentElement;
      }
      return false;
    };

    const handlePointerMove = (event: PointerEvent | MouseEvent) => {
      // Exclude pure touch screen taps
      if ('pointerType' in event && event.pointerType === 'touch') return;

      if (!enabled && !motionQuery.matches) {
        setEnabled(true);
      }

      if (isFirstMove.current) {
        try {
          targetX.jump(event.clientX);
          targetY.jump(event.clientY);
          dotX.jump(event.clientX);
          dotY.jump(event.clientY);
          ringX.jump(event.clientX);
          ringY.jump(event.clientY);
        } catch {
          targetX.set(event.clientX);
          targetY.set(event.clientY);
        }
        isFirstMove.current = false;
      } else {
        targetX.set(event.clientX);
        targetY.set(event.clientY);
      }

      if (!visible) {
        setVisible(true);
      }
    };

    const handlePointerOver = (event: Event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      // Detect whether backdrop is dark or light
      setIsDark(isDarkBackground(target));

      // Native inputs, textareas, contenteditable, select, or native drag zones
      const nativeElement = target.closest(
        'input, textarea, select, [contenteditable="true"], [data-cursor="native"], .magnetic-word'
      );
      if (nativeElement) {
        setMode('native');
        return;
      }

      // Portfolio/work items showing VIEW label
      const viewElement = target.closest('[data-cursor="view"], .home-landing-art-card');
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

    const handlePointerDown = (event: PointerEvent | MouseEvent) => {
      if ('pointerType' in event && event.pointerType === 'touch') return;
      if (event.button === 0) {
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
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('mousedown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('mouseup', handlePointerUp, { passive: true });
    document.addEventListener('pointerover', handlePointerOver, { passive: true });
    document.addEventListener('mouseover', handlePointerOver, { passive: true });
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('blur', handleMouseLeave);

    return () => {
      motionQuery.removeEventListener('change', updateEnabled);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('mouseup', handlePointerUp);
      document.removeEventListener('pointerover', handlePointerOver);
      document.removeEventListener('mouseover', handlePointerOver);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('blur', handleMouseLeave);
    };
  }, [dotX, dotY, enabled, ringX, ringY, targetX, targetY, visible]);

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
