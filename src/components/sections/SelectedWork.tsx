import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Project } from '../../types/project';
import { ProjectCard } from '../common/ProjectCard';

interface SelectedWorkProps {
  projects: Project[];
}

export const SelectedWork: React.FC<SelectedWorkProps> = ({ projects }) => {
  if (!projects || projects.length === 0) {
    return null;
  }

  // Curate 4 strongest headline projects representing the 4 requested disciplines:
  // 01 — Brand / Campaign
  // 02 — Brand / Packaging
  // 03 — Brand / Social Media
  // 04 — Digital / Web

  const campaignProject =
    projects.find((p) => p.slug === 'loft-cinema-culture') ||
    projects.find((p) => p.slug === 'bakers-social-campaigns') ||
    projects.find((p) => p.category_slug === 'campaigns') ||
    projects[0];

  const packagingProject =
    projects.find((p) => p.slug === 'bakers-crush-packaging') ||
    projects.find((p) => p.slug === 'bevis-mineral-water') ||
    projects.find((p) => p.category_slug === 'packaging') ||
    projects[1];

  const socialProject =
    projects.find((p) => p.slug === 'sms-educational-branding') ||
    projects.find((p) => p.slug === 'bro-knows-tech-carousels') ||
    projects.find((p) => p.category_slug === 'social-media') ||
    projects[2];

  const digitalProject =
    projects.find((p) => p.slug === 'kings') ||
    projects.find((p) => p.category_slug === 'digital-web') ||
    projects[3];

  const featuredItems = [
    {
      num: '01',
      discipline: 'Brand / Campaign',
      project: campaignProject,
    },
    {
      num: '02',
      discipline: 'Brand / Packaging',
      project: packagingProject,
    },
    {
      num: '03',
      discipline: 'Brand / Social Media',
      project: socialProject,
    },
    {
      num: '04',
      discipline: 'Digital / Web',
      project: digitalProject,
    },
  ].filter((item) => Boolean(item.project));

  const easeApple = [0.22, 1, 0.36, 1];

  return (
    <section id="selected-work" className="w-full py-24 md:py-32 lg:py-40 bg-white border-t border-[#E5E5E5]">
      <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-24 gap-6">
          <div>
            <div className="text-[12px] md:text-[13px] font-semibold tracking-[0.12em] text-[#8A8A8A] uppercase mb-4">
              CURATED SELECTION
            </div>
            <h2 className="text-[36px] sm:text-[48px] md:text-[64px] font-bold text-[#111111] tracking-[-0.035em] leading-[1.0] uppercase">
              SELECTED WORK
            </h2>
          </div>

          <div className="max-w-[440px]">
            <p className="text-[16px] sm:text-[18px] text-[#6B6B6B] leading-[1.5] tracking-tight">
              A curated selection of visual identities, continuous social campaigns, structural packaging, and digital experiences.
            </p>
          </div>
        </div>

        {/* 4 Curated Projects in Alternating Editorial Rhythm */}
        <div className="space-y-24 md:space-y-36">
          {featuredItems.map(({ num, discipline, project }, idx) => {
            const isReversed = idx % 2 === 1;

            return (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.8, ease: easeApple }}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center ${
                  isReversed ? 'lg:grid-flow-dense' : ''
                }`}
              >
                {/* Media Container (7 cols) */}
                <div className={`lg:col-span-7 ${isReversed ? 'lg:col-start-6' : ''}`}>
                  <ProjectCard
                    project={project}
                    aspectRatio="preserve"
                    showDescription={false}
                    priority={idx === 0}
                  />
                </div>

                {/* Project Narrative (5 cols) */}
                <div className={`lg:col-span-5 ${isReversed ? 'lg:col-start-1' : ''} space-y-6`}>
                  <div className="flex items-center space-x-3 text-[13px] font-semibold tracking-wider text-[#8A8A8A] uppercase">
                    <span className="text-[#111111] text-[15px] font-mono">{num}</span>
                    <span>—</span>
                    <span>{discipline}</span>
                  </div>

                  <h3 className="text-[28px] sm:text-[36px] md:text-[42px] font-bold text-[#111111] tracking-[-0.03em] leading-[1.05] uppercase">
                    {project.title}
                  </h3>

                  <p className="text-[16px] sm:text-[18px] text-[#6B6B6B] leading-[1.6] tracking-[-0.01em]">
                    {project.description}
                  </p>

                  {/* Meta details */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#EAEAEA] text-[13px]">
                    <div>
                      <span className="text-[#8A8A8A] uppercase font-semibold text-[11px] block">CLIENT</span>
                      <span className="text-[#111111] font-medium">{project.client || 'Commission'}</span>
                    </div>
                    <div>
                      <span className="text-[#8A8A8A] uppercase font-semibold text-[11px] block">SERVICES</span>
                      <span className="text-[#111111] font-medium">
                        {project.services?.slice(0, 2).join(' · ') || 'Art Direction'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      to={`/project/${project.slug}`}
                      className="inline-flex items-center space-x-2 text-[14px] font-semibold text-[#111111] hover:text-black group border-b border-[#111111] pb-0.5"
                    >
                      <span>Explore Case Study</span>
                      <ArrowRight
                        size={15}
                        className="transform transition-transform group-hover:translate-x-1 duration-200"
                      />
                    </Link>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* View All Work CTA Bar */}
        <div className="mt-28 md:mt-36 pt-12 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-[12px] font-semibold text-[#8A8A8A] uppercase tracking-wider">
              ARCHIVE
            </div>
            <div className="text-[20px] sm:text-[24px] font-bold text-[#111111] tracking-tight uppercase mt-1">
              Explore the full portfolio archive
            </div>
          </div>

          <Link
            to="/work"
            className="inline-flex items-center space-x-3 px-8 py-4 rounded-[8px] bg-black text-white text-[14px] font-semibold hover:bg-black/85 transition-colors shadow-xs"
          >
            <span>View all work</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};
