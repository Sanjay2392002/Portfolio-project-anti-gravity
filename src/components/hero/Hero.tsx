import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { Character3D } from '../character/Character3D';

export const Hero: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const characterY = useTransform(scrollYProgress, [0, 1], [0, -56]);
  const characterX = useTransform(scrollYProgress, [0, 1], [0, 28]);
  const characterScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const characterOpacity = useTransform(scrollYProgress, [0, 0.85, 1], [1, 0.92, 0.2]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -28]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 0.92, 0.3]);

  return (
    <section ref={sectionRef} id="top" className="home-hero">
      <div className="home-hero-inner">
        <motion.div className="home-hero-copy" style={{ y: copyY, opacity: copyOpacity }}>
          <motion.p
            className="home-eyebrow home-hero-eyebrow"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
          >
            SANJAY <span>—</span> GRAPHIC DESIGNER
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.16 }}
          >
            <span className="home-hero-line">VISUAL</span>
            <span className="home-hero-line home-hero-accent">DESIGNER.</span>
          </motion.h1>
          <motion.p
            className="home-hero-summary"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28 }}
          >
            I create thoughtful graphic design, social media campaigns, and visual identities for brands.
          </motion.p>
          <motion.a
            href="#about"
            className="home-hero-cta"
            data-cursor="link"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.38 }}
          >
            MORE ABOUT ME <ArrowDown size={15} strokeWidth={1.8} />
          </motion.a>
        </motion.div>

        <motion.div
          className="home-hero-character"
          data-cursor="character"
          style={{
            x: characterX,
            y: characterY,
            scale: characterScale,
            opacity: characterOpacity,
          }}
        >
          <motion.div
            className="home-hero-character-inner"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Character3D variant="full" size="hero" enableMouseLook enableTilt />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
