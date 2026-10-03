import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

type CursorMode = 'default' | 'view' | 'link' | 'native';

export const InteractiveCursor: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<CursorMode>('default');
  const [pressed, setPressed] = useState(false);
  const targetX = useMotionValue(-100);
  const targetY = useMotionValue(-100);
  const x = useSpring(targetX, { damping: 30, stiffness: 280, mass: 0.32 });
  const y = useSpring(targetY, { damping: 30, stiffness: 280, mass: 0.32 });

  useEffect(() => {
    const pointerQuery = window.matchMedia('(pointer: fine)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateEnabled = () => setEnabled(pointerQuery.matches && !motionQuery.matches);

    updateEnabled();
    pointerQuery.addEventListener('change', updateEnabled);
    motionQuery.addEventListener('change', updateEnabled);

    const handleMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      targetX.set(event.clientX);
      targetY.set(event.clientY);
      setVisible(true);
    };

    const handleOver = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const textEntry = target?.closest('input, textarea, select, [contenteditable="true"]');

      if (textEntry) {
        setMode('native');
        return;
      }

      const interactive = target?.closest<HTMLElement>('[data-cursor], a, button');
      setMode(
        interactive?.dataset.cursor === 'view'
          ? 'view'
          : interactive
            ? 'link'
            : 'default',
      );
    };

    const handleLeave = () => {
      setVisible(false);
      setMode('default');
    };

    const handleDown = () => setPressed(true);
    const handleUp = () => setPressed(false);

    window.addEventListener('pointermove', handleMove, { passive: true });
    window.addEventListener('pointerdown', handleDown, { passive: true });
    window.addEventListener('pointerup', handleUp, { passive: true });
    document.addEventListener('pointerover', handleOver, { passive: true });
    document.documentElement.addEventListener('pointerleave', handleLeave);

    return () => {
      pointerQuery.removeEventListener('change', updateEnabled);
      motionQuery.removeEventListener('change', updateEnabled);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerdown', handleDown);
      window.removeEventListener('pointerup', handleUp);
      document.removeEventListener('pointerover', handleOver);
      document.documentElement.removeEventListener('pointerleave', handleLeave);
    };
  }, [targetX, targetY]);

  if (!enabled) return null;

  return (
    <motion.div
      className={`designer-cursor designer-cursor--${mode}${visible ? ' is-visible' : ''}${pressed ? ' is-pressed' : ''}`}
      style={{ left: x, top: y }}
      aria-hidden="true"
    >
      <span className="designer-cursor-orbit" />
      <span className="designer-cursor-cross designer-cursor-cross--top" />
      <span className="designer-cursor-cross designer-cursor-cross--right" />
      <span className="designer-cursor-cross designer-cursor-cross--bottom" />
      <span className="designer-cursor-cross designer-cursor-cross--left" />
      <span className="designer-cursor-dot" />
      {mode === 'view' && <span className="designer-cursor-label">VIEW</span>}
      {mode === 'link' && <span className="designer-cursor-label">OPEN</span>}
    </motion.div>
  );
};
