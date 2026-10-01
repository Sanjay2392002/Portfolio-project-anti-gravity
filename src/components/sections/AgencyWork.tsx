import React from 'react';
import { motion } from 'framer-motion';
import { Project } from '../../types/project';
import { SectionHeading } from '../common/SectionHeading';
import { ProjectCard } from '../common/ProjectCard';

interface AgencyWorkProps {
  projects: Project[];
}

export const AgencyWork: React.FC<AgencyWorkProps> = ({ projects }) => {
  // All agency projects across disciplines (posters, thumbnails, stall, logo, packaging, print)
  const agencyProjects = projects.filter(
    (p) => p.slug !== 'kings' && p.category_slug !== 'website-design'
  );

  if (agencyProjects.length === 0) return null;

  return (
    <section id="agency-work" className="w-full py-24 md:py-32 lg:py-40 bg-white border-t border-[#E5E5E5]">
      <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-12">
        <SectionHeading
          number="01"
          subtitle="AGENCY WORK · 1.5 YEARS"
          title="VISUAL COMMUNICATION & CAMPAIGNS"
          description="Visual communication, stall architecture, posters, thumbnails, logos, and packaging created across multiple brands during my agency experience."
        />

        {/* Agency Grid with Editorial Rhythm */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {agencyProjects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
                delay: (idx % 3) * 0.1,
              }}
            >
              <ProjectCard project={project} aspectRatio="editorial" showDescription={true} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
