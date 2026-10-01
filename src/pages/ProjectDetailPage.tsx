import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ExternalLink, Maximize2 } from 'lucide-react';
import { Project } from '../types/project';
import { usePortfolio } from '../context/PortfolioContext';
import { BlockRenderer } from '../components/blocks/BlockRenderer';

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { getProjectBySlug, projects, openLightbox } = usePortfolio();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadProject = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);
      const data = await getProjectBySlug(slug);
      if (data) {
        setProject(data);
      } else {
        setError('Project not found');
      }
      setLoading(false);
    };

    loadProject();
  }, [slug]);

  if (loading) {
    return (
      <div className="w-full min-h-[70vh] flex items-center justify-center bg-white">
        <div className="text-[14px] font-medium text-[#8A8A8A] tracking-wider uppercase animate-pulse">
          Loading Project...
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-white px-5 text-center">
        <h2 className="text-[36px] font-bold text-[#111111] uppercase tracking-tight mb-4">
          Project Not Found
        </h2>
        <p className="text-[16px] text-[#6B6B6B] mb-8">
          The project you are looking for does not exist or is not yet published.
        </p>
        <Link
          to="/work"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-[8px] bg-black text-white text-[14px] font-medium hover:bg-black/80 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Selected Works</span>
        </Link>
      </div>
    );
  }

  // Calculate Next Project
  const currentIndex = projects.findIndex((p) => p.slug === slug);
  const nextProject =
    currentIndex !== -1 && currentIndex < projects.length - 1
      ? projects[currentIndex + 1]
      : projects[0];

  const easeApple = [0.22, 1, 0.36, 1];

  return (
    <article className="w-full bg-white pb-32">
      {/* Top Back Navigation Bar */}
      <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-12 pt-8 pb-4">
        <Link
          to="/work"
          className="inline-flex items-center space-x-2 text-[13px] font-medium text-[#6B6B6B] hover:text-[#111111] transition-colors group"
        >
          <span className="transform transition-transform group-hover:-translate-x-1 duration-200">
            <ArrowLeft size={14} />
          </span>
          <span>SELECTED WORKS</span>
        </Link>
      </div>

      {/* Project Hero Section */}
      <section className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-12 pt-10 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easeApple }}
          className="max-w-[1100px] mb-12"
        >
          <div className="flex items-center space-x-3 text-[12px] md:text-[13px] font-semibold tracking-[0.1em] text-[#8A8A8A] uppercase mb-4">
            <span>{project.category_name || 'Design'}</span>
            <span>·</span>
            <span>{project.year}</span>
          </div>

          <h1 className="text-[44px] sm:text-[64px] md:text-[84px] font-bold text-[#111111] tracking-[-0.04em] leading-[0.98] uppercase">
            {project.title}
          </h1>

          <p className="mt-6 text-[20px] sm:text-[24px] text-[#6B6B6B] max-w-[800px] leading-[1.45] tracking-[-0.015em]">
            {project.description}
          </p>
        </motion.div>

        {/* Project Metadata Grid */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easeApple, delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-8 py-8 border-y border-[#E5E5E5] text-[14px] mb-12"
        >
          <div>
            <div className="text-[12px] font-semibold text-[#8A8A8A] uppercase tracking-wider">ROLE</div>
            <div className="text-[#111111] font-medium mt-1">{project.role}</div>
          </div>
          <div>
            <div className="text-[12px] font-semibold text-[#8A8A8A] uppercase tracking-wider">YEAR</div>
            <div className="text-[#111111] font-medium mt-1">{project.year}</div>
          </div>
          <div>
            <div className="text-[12px] font-semibold text-[#8A8A8A] uppercase tracking-wider">CATEGORY</div>
            <div className="text-[#111111] font-medium mt-1">{project.category_name || 'Design'}</div>
          </div>
          <div>
            <div className="text-[12px] font-semibold text-[#8A8A8A] uppercase tracking-wider">SERVICES</div>
            <div className="text-[#111111] font-medium mt-1">
              {project.services && project.services.length > 0
                ? project.services.join(' · ')
                : 'Art Direction · Visual Design'}
            </div>
          </div>
        </motion.div>

        {/* Hero Artwork Showcase — Preserves exact original ratio without cropping */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: easeApple, delay: 0.15 }}
          className="relative w-full min-h-[380px] max-h-[85vh] rounded-[16px] overflow-hidden bg-[#F7F7F7] border border-[#E5E5E5]/80 flex items-center justify-center cursor-pointer group p-4 sm:p-8"
          onClick={() => openLightbox(project.hero_image, `${project.title} Hero Showcase`)}
        >
          <img
            src={project.hero_image}
            alt={project.title}
            className="max-h-[80vh] w-auto max-w-full object-contain mx-auto group-hover:scale-[1.01] transition-transform duration-700"
          />
          <button
            type="button"
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/95 text-[#111111] opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-[#E5E5E5]/60"
            aria-label="Enlarge image"
          >
            <Maximize2 size={18} />
          </button>
        </motion.div>
      </section>

      {/* Dynamic Content Blocks Section */}
      <section className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-12">
        {project.blocks && project.blocks.length > 0 ? (
          <div className="w-full">
            {project.blocks.map((block, idx) => (
              <BlockRenderer key={block.id || idx} block={block} index={idx} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-[#8A8A8A] text-[15px]">
            Additional editorial visuals are being compiled.
          </div>
        )}

        {/* Live Project External Link (if available) */}
        {project.live_url && (
          <div className="my-16 pt-12 border-t border-[#E5E5E5] flex items-center justify-between">
            <div>
              <div className="text-[12px] font-semibold text-[#8A8A8A] uppercase tracking-wider">LIVE EXPERIENCE</div>
              <div className="text-[18px] font-semibold text-[#111111] mt-0.5">Visit the live platform</div>
            </div>
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-[8px] bg-black text-white text-[14px] font-medium hover:bg-black/90 transition-colors"
            >
              <span>EXPLORE LIVE</span>
              <ExternalLink size={15} />
            </a>
          </div>
        )}
      </section>

      {/* Next Project Footer Bar */}
      {nextProject && nextProject.id !== project.id && (
        <section className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-12 mt-28 pt-16 border-t border-[#E5E5E5]">
          <div className="text-[12px] font-semibold text-[#8A8A8A] uppercase tracking-[0.1em] mb-4">
            NEXT PROJECT
          </div>
          <Link
            to={`/project/${nextProject.slug}`}
            className="group flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <div>
              <h3 className="text-[36px] sm:text-[48px] md:text-[60px] font-bold text-[#111111] tracking-tight uppercase group-hover:text-black transition-colors">
                {nextProject.title}
              </h3>
              <div className="text-[15px] text-[#6B6B6B] mt-1">
                {nextProject.category_name} · {nextProject.year}
              </div>
            </div>

            <div className="inline-flex items-center space-x-3 text-[18px] font-semibold text-[#111111] group-hover:translate-x-2 transition-transform duration-300">
              <span>VIEW CASE STUDY</span>
              <ArrowRight size={20} />
            </div>
          </Link>
        </section>
      )}
    </article>
  );
};
