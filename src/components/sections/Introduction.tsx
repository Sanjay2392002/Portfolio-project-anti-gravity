import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePortfolio } from '../../context/PortfolioContext';

export const Introduction: React.FC = () => {
  const { categories } = usePortfolio();
  const easeApple = [0.22, 1, 0.36, 1];

  return (
    <section id="intro" className="w-full py-24 md:py-32 lg:py-40 bg-white border-t border-[#E5E5E5]">
      <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: easeApple }}
          className="max-w-[900px]"
        >
          <div className="text-[12px] md:text-[13px] font-semibold tracking-[0.1em] uppercase text-[#8A8A8A] mb-6">
            DISCIPLINES & SELECTED WORK
          </div>
          <h2 className="text-[32px] sm:text-[44px] md:text-[56px] font-bold text-[#111111] tracking-[-0.035em] leading-[1.05] uppercase mb-6">
            SELECTED WORK
          </h2>
          <p className="text-[20px] sm:text-[24px] md:text-[26px] font-normal text-[#6B6B6B] tracking-[-0.02em] leading-[1.45] mb-12">
            A collection of visual work created across agency campaigns, independent brand systems, and tactile digital products.
          </p>

          {/* 8 Category Discipline Navigation Pills */}
          <div className="flex flex-wrap items-center gap-2.5 pt-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/work?category=${cat.slug}`}
                className="px-3.5 py-1.5 rounded-full border border-[#E5E5E5] bg-white text-[13px] font-medium text-[#111111] hover:border-black hover:bg-black hover:text-white transition-all duration-200"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
