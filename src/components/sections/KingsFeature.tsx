import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePortfolio } from '../../context/PortfolioContext';

export const KingsFeature: React.FC = () => {
  const { openLightbox } = usePortfolio();

  return (
    <section className="home-kings" id="kings">
      <div className="home-kings-inner">
        <div className="home-section-heading"><div><p className="home-eyebrow">FEATURED PROJECT</p><h2>KINGS</h2></div><Link to="/project/kings" className="home-text-link" data-cursor="link">View project <ArrowUpRight size={17} /></Link></div>
        <motion.button type="button" className="home-kings-image" whileHover={{ scale: 1.01 }} onClick={() => openLightbox('/assets/kings/kings-box-model.jpg', 'KINGS — Featured case study')} aria-label="Preview the KINGS case study">
          <img src="/assets/kings/kings-box-model.jpg" alt="KINGS brand packaging and visual identity" loading="lazy" />
        </motion.button>
        <div className="home-kings-caption"><strong>Shirts for a higher standard.</strong><span>Brand · Product · Digital</span></div>
      </div>
    </section>
  );
};
