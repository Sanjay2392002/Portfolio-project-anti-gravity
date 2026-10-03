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
  const { about, settings } = usePortfolio();
  const cvUrl = settings?.resume_download_url || settings?.resume_url || '/Sanjay_M_Resume.pdf';
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
              {about?.biography_paragraph_1 || 'I am a Graphic and Visual Designer with a background in Computer Science Engineering (B.E. from SKCT). I combine structured thinking and technical agility with visual design to create impactful brand identities, commercial campaigns, and user interfaces.'}
            </p>
            <p className="about-simple-copy home-about-second">
              {about?.biography_paragraph_2 || 'At Bevis, I have designed 100+ social media creatives, ad campaigns, packaging labels, and exhibition stalls for diverse brands including BAKERS, Pavizham Jewellers, Bro Knows Tech, LOFT, SIGGIS, Woneten Luxe, Wallfit, and Zen Spaces. I also pioneer AI-assisted workflows, reducing turnaround by 30% while delivering high-grade commercial visuals.'}
            </p>
            <div className="home-about-actions">
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
          <p className="about-simple-copy">{about?.biography_paragraph_1 || 'I am a Graphic and Visual Designer based in Coimbatore with a background in Computer Science Engineering. I combine structured thinking and technical agility with visual design to create impactful brand identities, commercial campaigns, and user interfaces.'}</p>
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
