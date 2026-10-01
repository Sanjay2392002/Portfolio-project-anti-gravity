import React from 'react';
import { motion } from 'framer-motion';

interface SectionHeadingProps {
  number?: string;
  title: string;
  subtitle?: string;
  description?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  number,
  title,
  subtitle,
  description,
}) => {
  const easeApple = [0.22, 1, 0.36, 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: easeApple }}
      className="mb-16 md:mb-24"
    >
      <div className="flex items-center space-x-3 text-[12px] md:text-[13px] font-semibold tracking-[0.1em] text-[#8A8A8A] uppercase mb-4">
        {number && <span>{number}</span>}
        {number && <span>—</span>}
        {subtitle && <span>{subtitle}</span>}
      </div>

      <h2 className="text-[36px] sm:text-[48px] md:text-[64px] font-bold tracking-[-0.035em] leading-[1.0] text-[#111111] uppercase max-w-[900px]">
        {title}
      </h2>

      {description && (
        <p className="mt-6 text-[18px] sm:text-[20px] text-[#6B6B6B] max-w-[680px] leading-[1.5] tracking-[-0.015em]">
          {description}
        </p>
      )}
    </motion.div>
  );
};
