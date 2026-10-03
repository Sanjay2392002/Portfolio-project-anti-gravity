import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Download } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { MagneticHeroHeading } from './MagneticHeroHeading';
import { selectedWorks } from '../../data/selectedWorks';

const heroWorks = ['BAKERS', 'Bro Knows Tech', 'PAVIZHAM']
  .map((brand) => {
    const brandWorks = selectedWorks.filter((work) => work.brand.toLowerCase() === brand.toLowerCase() && work.type === 'image');
    const posters = brandWorks.filter((work) => work.category === 'Posters & Ads');
    return posters.length ? posters : brandWorks;
  })
  .filter((works) => works.length > 0);

interface AboutSectionProps {
  variant?: 'default' | 'home';
}

export const AboutSection: React.FC<AboutSectionProps> = ({ variant = 'default' }) => {
  const { about, settings } = usePortfolio();
  const reduceMotion = useReducedMotion();
  const [presentationIndex, setPresentationIndex] = useState(0);
  const cvUrl = settings?.resume_download_url || settings?.resume_url || '/Sanjay_M_Resume.pdf';

  useEffect(() => {
    if (variant !== 'home' || reduceMotion || !heroWorks.some((works) => works.length > 1)) return;
    const interval = window.setInterval(() => setPresentationIndex((index) => index + 1), 5000);
    return () => window.clearInterval(interval);
  }, [variant, reduceMotion]);
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
            aria-label="Selected portfolio projects"
          >
            <div className="home-landing-art-halo" aria-hidden="true" />
            {heroWorks.map((slides, index) => {
              const work = slides[presentationIndex % slides.length];
              return (
                <motion.figure
                  key={work.id}
                  className={`home-landing-art-card home-landing-art-card-${index + 1}`}
                  initial={reduceMotion ? false : { opacity: 0, y: 28, rotate: index === 1 ? 9 : index === 2 ? -8 : 0 }}
                  animate={reduceMotion ? { opacity: 1 } : {
                    opacity: 1,
                    y: index === 0 ? [0, -7, 0] : 0,
                    rotate: index === 1 ? 7 : index === 2 ? -6 : 0,
                  }}
                  transition={reduceMotion
                    ? { duration: 0.2 }
                    : index === 0
                      ? { opacity: { duration: 0.7, delay: 0.35 }, y: { duration: 6, delay: 1.2, repeat: Infinity, ease: 'easeInOut' } }
                      : { duration: 0.8, delay: 0.3 + index * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={reduceMotion ? undefined : { y: -8, rotate: index === 0 ? -2 : index === 1 ? 10 : -9, scale: 1.02 }}
                >
                  <img
                    src={work.thumbnail || work.image}
                    alt={`${work.brand} — ${work.title}`}
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                  <figcaption><span>0{index + 1}</span><strong>{work.brand}</strong></figcaption>
                </motion.figure>
              );
            })}
            <div className="home-landing-art-note"><span>SELECTED WORKS</span><strong>Built to be seen.</strong></div>
            <span className="home-landing-art-orbit" aria-hidden="true">DESIGN · BRAND · DIGITAL</span>
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
