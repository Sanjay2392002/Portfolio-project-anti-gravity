import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

type CursorMode = 'default' | 'view' | 'link' | 'native';

export const InteractiveCursor: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<CursorMode>('default');
  const targetX = useMotionValue(-100);
  const targetY = useMotionValue(-100);
  const x = useSpring(targetX, { damping: 28, stiffness: 260, mass: 0.35 });
  const y = useSpring(targetY, { damping: 28, stiffness: 260, mass: 0.35 });

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
      setMode(interactive?.dataset.cursor === 'view' ? 'view' : interactive ? 'link' : 'default');
    };
    const handleLeave = () => {
      setVisible(false);
      setMode('default');
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    document.addEventListener('pointerover', handleOver, { passive: true });
    document.documentElement.addEventListener('pointerleave', handleLeave);
    return () => {
      pointerQuery.removeEventListener('change', updateEnabled);
      motionQuery.removeEventListener('change', updateEnabled);
      window.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerover', handleOver);
      document.documentElement.removeEventListener('pointerleave', handleLeave);
    };
  }, [targetX, targetY]);

  if (!enabled) return null;

  return (
    <motion.div
      className={`site-cursor site-cursor--${mode}${visible ? ' is-visible' : ''}`}
      style={{ left: x, top: y }}
      aria-hidden="true"
    >
      {mode === 'view' && <span>VIEW</span>}
    </motion.div>
  );
};
