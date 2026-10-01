import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Download } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { MagneticHeroHeading } from './MagneticHeroHeading';

interface AboutSectionProps {
  variant?: 'default' | 'home';
}

export const AboutSection: React.FC<AboutSectionProps> = ({ variant = 'default' }) => {
  const { about } = usePortfolio();
  if (variant === 'home') {
    return (
      <section id="about" className="about-simple home-about-preview">
        <div className="home-about-inner">
          <motion.div
            className="home-about-copy"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="home-eyebrow">A LITTLE ABOUT ME</p>
            <MagneticHeroHeading />
            <p className="about-simple-copy">
              {about?.biography_paragraph_1 || 'I create social media posters and clear user interfaces for brands and digital products.'}
            </p>
            <p className="about-simple-copy home-about-second">
              {about?.biography_paragraph_2 || 'My work focuses on strong layout, clear typography, and making each message easy to understand.'}
            </p>
            <div className="home-about-actions">
              <Link className="home-about-cta" to="/work" data-cursor="link">
                <span>VIEW SELECTED WORKS</span>
                <ArrowUpRight size={16} strokeWidth={2.2} className="home-about-cta-icon" />
              </Link>
              <a
                className="home-about-cta home-about-cta-secondary"
                href="/Sanjay_M_Resume.pdf"
                download="Sanjay_M_Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="link"
              >
                <span>DOWNLOAD CV</span>
                <Download size={16} strokeWidth={2.2} className="home-about-cta-icon" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="about-simple">
      <div className="about-simple-inner">
        <p className="portfolio-eyebrow">A little about me</p>
        <div>
          <MagneticHeroHeading />
          <p className="about-simple-copy">{about?.biography_paragraph_1 || 'I’m a graphic designer focused on social media design and user interface design. I like making ideas clear, useful and visually memorable.'}</p>
          <div className="about-skills" aria-label="Design skills">
            <span>Social media design</span>
            <span>UI design</span>
          </div>
        </div>
      </div>
    </section>
  );
};
