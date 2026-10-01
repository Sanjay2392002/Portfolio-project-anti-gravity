import React from 'react';
import { motion } from 'framer-motion';
import { Project } from '../../types/project';
import { SectionHeading } from '../common/SectionHeading';
import { ProjectCard } from '../common/ProjectCard';

interface BuildingWorkProps {
  projects: Project[];
}

export const BuildingWork: React.FC<BuildingWorkProps> = ({ projects }) => {
  const buildingProjects = projects.filter(
    (p) =>
      p.category_slug === 'website-design' ||
      p.category_slug === 'building' ||
      p.category_name?.toLowerCase().includes('website') ||
      p.category_name?.toLowerCase().includes('digital')
  );

  if (buildingProjects.length === 0) return null;

  return (
    <section id="building" className="w-full py-24 md:py-32 lg:py-40 bg-white border-t border-[#E5E5E5]">
      <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-12">
        <SectionHeading
          number="03"
          subtitle="WEBSITE DESIGN & DIGITAL EXPERIENCES"
          title="BUILDING"
          description="Beyond visual design, I enjoy turning ideas into working digital experiences."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {buildingProjects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
                delay: idx * 0.1,
              }}
            >
              <ProjectCard project={project} aspectRatio="cinematic" showDescription={true} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
