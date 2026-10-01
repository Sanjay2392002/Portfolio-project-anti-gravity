import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Maximize2, Sparkles } from 'lucide-react';
import { Project } from '../../types/project';
import { usePortfolio } from '../../context/PortfolioContext';

interface ProjectCardProps {
  project: Project;
  aspectRatio?: 'cinematic' | 'editorial' | 'portrait' | 'square' | 'auto' | 'preserve';
  className?: string;
  showDescription?: boolean;
  variant?: 'standard' | 'featured' | 'editorial';
  priority?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  aspectRatio = 'auto',
  className = '',
  showDescription = false,
  variant = 'standard',
  priority = false,
}) => {
  const { openLightbox } = usePortfolio();

  const handleLightboxClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openLightbox(
      project.hero_image,
      `${project.title} — ${project.role} (${project.year})`
    );
  };

  // Determine aspect class if explicitly requested, otherwise let artwork preserve natural ratio
  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'cinematic':
        return 'aspect-[16/9]';
      case 'editorial':
        return 'aspect-[4/3]';
      case 'portrait':
        return 'aspect-[4/5]';
      case 'square':
        return 'aspect-square';
      case 'auto':
      case 'preserve':
      default:
        return 'min-h-[260px] sm:min-h-[300px] max-h-[540px]';
    }
  };

  const isPreserved = aspectRatio === 'auto' || aspectRatio === 'preserve';

  return (
    <div className={`group block select-none ${className}`}>
      <Link to={`/project/${project.slug}`} className="block">
        {/* Media Container — Never stretches, never distorts, preserves artwork ratio */}
        <div
          className={`relative w-full ${getAspectClass()} overflow-hidden rounded-[14px] bg-[#F7F7F7] border border-[#E5E5E5]/90 transition-all duration-300 group-hover:border-[#CCCCCC] group-hover:shadow-md flex items-center justify-center`}
        >
          <img
            src={project.hero_image}
            alt={project.title}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className={`w-full h-full ${
              isPreserved ? 'object-contain max-h-[540px]' : 'object-cover object-center'
            } transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]`}
          />

          {/* Featured Badge */}
          {project.featured && (
            <div className="absolute top-3.5 left-3.5 z-10 inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-black/85 backdrop-blur-md text-white text-[11px] font-semibold tracking-wider uppercase shadow-xs">
              <Sparkles size={11} className="text-amber-400" />
              <span>FEATURED</span>
            </div>
          )}

          {/* Discipline Badge (bottom-left overlay on hover) */}
          <div className="absolute bottom-3 left-3 z-10 px-2.5 py-1 rounded-[6px] bg-white/95 backdrop-blur-md text-[#111111] text-[11px] font-semibold tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xs border border-[#E5E5E5]/60">
            {project.category_name || 'Design'}
          </div>

          {/* Lightbox Quick Action (top-right overlay on hover) */}
          <button
            type="button"
            onClick={handleLightboxClick}
            className="absolute top-3.5 right-3.5 z-10 p-2.5 rounded-full bg-white/95 text-[#111111] opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-105 shadow-sm border border-[#E5E5E5]/60"
            aria-label="Expand image in lightbox"
          >
            <Maximize2 size={15} />
          </button>
        </div>

        {/* Project Meta Info */}
        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Client & Year */}
            <div className="flex items-center space-x-2 text-[12px] text-[#8A8A8A] font-semibold tracking-wider uppercase mb-1">
              <span className="truncate">{project.client || project.category_name || 'Commission'}</span>
              <span>·</span>
              <span>{project.year}</span>
            </div>

            {/* Title */}
            <h3 className="text-[18px] sm:text-[20px] font-bold text-[#111111] tracking-[-0.025em] leading-tight uppercase group-hover:text-black transition-colors line-clamp-1">
              {project.title}
            </h3>

            {/* Description */}
            {showDescription && project.description && (
              <p className="mt-2 text-[13.5px] text-[#6B6B6B] line-clamp-2 leading-relaxed">
                {project.description}
              </p>
            )}

            {/* Services Tags */}
            {project.services && project.services.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {project.services.slice(0, 3).map((srv, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-2 py-0.5 rounded-[4px] bg-[#F5F5F5] text-[#707070] text-[11px] font-medium tracking-tight"
                  >
                    {srv}
                  </span>
                ))}
                {project.services.length > 3 && (
                  <span className="inline-block px-1.5 py-0.5 text-[#9E9E9E] text-[11px]">
                    +{project.services.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Minimal Arrow */}
          <div className="mt-2 text-[#9E9E9E] group-hover:text-[#111111] transition-colors flex-shrink-0">
            <span className="inline-block transform transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1">
              <ArrowRight size={17} />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};
