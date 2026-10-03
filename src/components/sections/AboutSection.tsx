import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Download } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { MagneticHeroHeading } from './MagneticHeroHeading';
import { Character3D } from '../character/Character3D';

interface AboutSectionProps {
  variant?: 'default' | 'home';
}

export const AboutSection: React.FC<AboutSectionProps> = ({ variant = 'default' }) => {
  const { about, settings } = usePortfolio();
  const reduceMotion = useReducedMotion();
  const cvUrl = settings?.resume_download_url || settings?.resume_url || '/Sanjay_M_Resume.pdf';
  if (variant === 'home') {
    return (
      <section id="about" className="home-landing-hero">
        <div className="home-landing-inner">
          <motion.div
            className="home-landing-copy"
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="home-landing-eyebrow"><span aria-hidden="true" /> GRAPHIC DESIGNER <i>·</i> ERODE</p>
            <h1 className="home-landing-heading" aria-label="Hello, I’m Sanjay.">
              <motion.span
                initial={reduceMotion ? false : { opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                aria-hidden="true"
              >
                Hello, I’m
              </motion.span>
              <motion.span
                initial={reduceMotion ? false : { opacity: 0, y: 34, clipPath: 'inset(0 0 100% 0)' }}
                animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
                transition={{ duration: 0.9, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
                aria-hidden="true"
              >
                Sanjay<span className="home-landing-period">.</span>
              </motion.span>
            </h1>
            <p className="home-landing-bio">
              {about?.biography_paragraph_1 || 'I am a Graphic Designer based in Erode with a background in Computer Science Engineering. I combine structured thinking and technical agility with visual design to create impactful brand identities, commercial campaigns, and user interfaces.'}
            </p>
            <p className="home-landing-bio home-landing-bio-secondary">
              {about?.biography_paragraph_2 || 'I create commercial design assets for brands across social media, packaging, and print, with thoughtful AI-assisted workflows that bring ideas to life faster.'}
            </p>
            <div className="home-about-actions home-landing-actions">
              <Link className="home-about-cta" to="/work" data-cursor="link">
                <span>VIEW SELECTED WORKS</span>
                <ArrowUpRight size={16} strokeWidth={2.2} className="home-about-cta-icon" />
              </Link>
              <a
                className="home-about-cta home-about-cta-secondary"
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="link"
              >
                <span>DOWNLOAD CV</span>
                <Download size={16} strokeWidth={2.2} className="home-about-cta-icon" />
              </a>
            </div>
          </motion.div>

          <motion.div
            className="home-landing-art"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            aria-label="Sanjay's 3D character presenting a graphic design concept"
          >
            <div className="home-landing-art-halo" aria-hidden="true" />
            <div className="home-landing-scene-grid" aria-hidden="true" />
            <motion.div
              className="home-landing-design-board"
              aria-hidden="true"
              initial={reduceMotion ? false : { opacity: 0, y: 18, rotate: 7 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: [0, -7, 0], rotate: 4 }}
              transition={reduceMotion ? { duration: 0.2 } : { opacity: { duration: 0.7, delay: 0.45 }, y: { duration: 5.5, delay: 1, repeat: Infinity, ease: 'easeInOut' }, rotate: { duration: 0.8, delay: 0.45 } }}
            >
              <div className="home-landing-board-toolbar"><span /><span /><span /><small>01 / CAMPAIGN</small></div>
              <div className="home-landing-board-canvas">
                <i className="home-landing-board-sun" />
                <span className="home-landing-board-copy">MAKE<br />IT<br /><b>MATTER.</b></span>
                <i className="home-landing-board-line" />
              </div>
              <div className="home-landing-board-palette"><i /><i /><i /><i /><small>VISUAL DIRECTION</small></div>
            </motion.div>
            <motion.div
              className="home-landing-character-stage"
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: [0, -4, 0] }}
              transition={reduceMotion ? { duration: 0.2 } : { opacity: { duration: 0.8, delay: 0.25 }, y: { duration: 5, delay: 1, repeat: Infinity, ease: 'easeInOut' } }}
            >
              <Character3D variant="full" size="hero" enableMouseLook enableTilt />
            </motion.div>
            <div className="home-landing-art-label"><span>DESIGN IN PROGRESS</span><strong>Ideas, made visible.</strong></div>
            <span className="home-landing-art-orbit" aria-hidden="true">TYPE · COLOR · FORM</span>
          </motion.div>
        </div>
        <motion.a
          className="home-landing-scroll"
          href="#skills"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: [0, 5, 0] }}
          transition={reduceMotion ? { duration: 0.2 } : { opacity: { duration: 0.7, delay: 0.8 }, y: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }}
        >
          <span aria-hidden="true" /> SCROLL TO EXPLORE
        </motion.a>
      </section>
    );
  }

  return (
    <section id="about" className="about-simple">
      <div className="about-simple-inner">
        <p className="portfolio-eyebrow">A little about me</p>
        <div>
          <MagneticHeroHeading />
          <p className="about-simple-copy">{about?.biography_paragraph_1 || 'I am a Graphic Designer based in Erode with a background in Computer Science Engineering. I combine structured thinking and technical agility with visual design to create impactful brand identities, commercial campaigns, and user interfaces.'}</p>
          <div className="about-skills" aria-label="Design skills">
            <span>Social media creatives</span>
            <span>Packaging &amp; print</span>
            <span>Brand identity</span>
            <span>UI design</span>
            <span>AI workflows</span>
          </div>
        </div>
      </div>
    </section>
  );
};
