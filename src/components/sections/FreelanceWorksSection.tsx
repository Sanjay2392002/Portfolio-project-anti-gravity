import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import {
  freelanceWorks,
  type FreelanceWorkItem,
} from '../../data/freelanceWorks';

/* ─── Freelance data groupings ───────────────────────────────────────── */

const logofolio1Works = freelanceWorks.filter(
  (w) => w.subgroup === 'Identity System 01'
);
const logofolio2Works = freelanceWorks.filter(
  (w) => w.subgroup === 'Identity System 02'
);
const posterWorks = freelanceWorks.filter(
  (w) => w.category === 'Posters & Flyers'
);
const logoWorks = [...logofolio1Works, ...logofolio2Works];

interface LogoProject {
  id: 'logofolio-1' | 'logofolio-2';
  title: string;
  category: string;
  cover: string;
  works: FreelanceWorkItem[];
}

const LOGO_PROJECTS: LogoProject[] = [
  {
    id: 'logofolio-1',
    title: 'LOGOFOLIO 01',
    category: 'Brand Identity System',
    cover: '/freelance-works/logos/logo-1-01.webp',
    works: logofolio1Works,
  },
  {
    id: 'logofolio-2',
    title: 'LOGOFOLIO 02',
    category: 'Brand Identity System',
    cover: '/freelance-works/logos/logo-2-01.webp',
    works: logofolio2Works,
  },
];

/* ─── Component ──────────────────────────────────────────────────────── */

export const FreelanceWorksSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'logos' | 'posters'>('logos');
  const [activeLogofolio, setActiveLogofolio] = useState<'logofolio-1' | 'logofolio-2' | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Active works for lightbox
  const currentWorks = useMemo(() => {
    if (activeCategory === 'posters') return posterWorks;
    if (activeLogofolio === 'logofolio-1') return logofolio1Works;
    if (activeLogofolio === 'logofolio-2') return logofolio2Works;
    return logoWorks;
  }, [activeCategory, activeLogofolio]);

  // Lightbox keyboard controls
  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveIndex(null);
      if (event.key === 'ArrowRight') {
        setActiveIndex((idx) =>
          idx === null ? null : (idx + 1) % currentWorks.length
        );
      }
      if (event.key === 'ArrowLeft') {
        setActiveIndex((idx) =>
          idx === null
            ? null
            : (idx - 1 + currentWorks.length) % currentWorks.length
        );
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeIndex, currentWorks.length]);

  const activeWork: FreelanceWorkItem | null =
    activeIndex !== null ? currentWorks[activeIndex] ?? null : null;

  return (
    <section className="freelance-section" id="freelance-works" aria-label="Freelance Works">
      <div className="freelance-divider" aria-hidden="true" />

      {/* Section Header */}
      <div className="freelance-heading">
        <div>
          <h2>
            Freelance Works<span className="freelance-period">.</span>
          </h2>
        </div>
        <p>
          Independent client identity systems, logomark presentations, and promotional posters &amp;
          flyers.
        </p>
      </div>

      {/* Toggle CTAs: Only Posters and Flyers & Logo Designs */}
      <div className="freelance-controls">
        <div className="freelance-tabs" role="tablist" aria-label="Freelance categories">
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === 'logos'}
            className={`freelance-tab ${activeCategory === 'logos' ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory('logos');
              setActiveLogofolio(null);
              setActiveIndex(null);
            }}
          >
            Logo Designs <span>{logoWorks.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === 'posters'}
            className={`freelance-tab ${activeCategory === 'posters' ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory('posters');
              setActiveLogofolio(null);
              setActiveIndex(null);
            }}
          >
            Posters &amp; Flyers <span>{posterWorks.length}</span>
          </button>
        </div>
      </div>

      {/* ── Category: Logo Designs ──────────────────────────────────── */}
      {activeCategory === 'logos' && (
        <>
          {/* Logo Projects 2-Card Overview */}
          {activeLogofolio === null && (
            <div className="freelance-card-grid">
              {LOGO_PROJECTS.map((project, index) => (
                <motion.button
                  key={project.id}
                  type="button"
                  className="brand-card"
                  data-cursor="view"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => {
                    setActiveLogofolio(project.id);
                    setActiveIndex(null);
                  }}
                  aria-label={`View ${project.title}`}
                >
                  <span className="brand-card-media">
                    <span className="brand-card-media-inner">
                      <span className="brand-card-single">
                        <img
                          src={project.cover}
                          alt=""
                          loading={index < 2 ? 'eager' : 'lazy'}
                          decoding="async"
                          className="brand-card-img"
                        />
                      </span>
                    </span>

                    <span className="brand-card-overlay">
                      <span className="brand-card-view-cta">
                        View work <ArrowRight size={13} aria-hidden="true" />
                      </span>
                    </span>
                  </span>

                  <span className="brand-card-caption">
                    <strong className="brand-card-title">{project.title}</strong>
                    <span className="brand-card-category">{project.category}</span>
                    <span className="brand-card-count">
                      {project.works.length}{' '}
                      {project.works.length === 1 ? 'piece' : 'pieces'}
                    </span>
                  </span>
                </motion.button>
              ))}
            </div>
          )}

          {/* Drill-down: Logofolio 01 or Logofolio 02 Gallery */}
          {activeLogofolio !== null && (() => {
            const currentProj = LOGO_PROJECTS.find((p) => p.id === activeLogofolio);
            if (!currentProj) return null;
            return (
              <>
                <div className="freelance-drilldown-controls">
                  <button
                    className="brand-back"
                    type="button"
                    onClick={() => {
                      setActiveLogofolio(null);
                      setActiveIndex(null);
                    }}
                  >
                    <ArrowLeft size={15} /> Back to Logo Designs
                  </button>
                </div>

                <div className="freelance-drilldown-header">
                  <h3>{currentProj.title}</h3>
                  <span>
                    {currentProj.works.length}{' '}
                    {currentProj.works.length === 1 ? 'piece' : 'pieces'}
                  </span>
                </div>

                <motion.div
                  className="freelance-drilldown-grid freelance-drilldown-grid--logos"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentProj.works.map((work, workIndex) => (
                    <motion.button
                      key={work.id}
                      type="button"
                      className="freelance-tile"
                      data-cursor="view"
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{ duration: 0.35 }}
                      onClick={() => setActiveIndex(workIndex)}
                      aria-label={`View ${work.title}`}
                    >
                      <span
                        className="freelance-image-wrap"
                        style={{
                          aspectRatio: work.width && work.height ? `${work.width} / ${work.height}` : undefined,
                        }}
                      >
                        <img
                          src={work.image}
                          alt={work.title}
                          width={work.width}
                          height={work.height}
                          loading="lazy"
                          decoding="async"
                        />
                      </span>

                      <span className="freelance-caption">
                        <span>
                          <strong>{work.title}</strong>
                          <small>{work.subgroup || work.category}</small>
                        </span>
                        <span className="freelance-open" aria-hidden="true">
                          <ArrowRight size={15} />
                        </span>
                      </span>
                    </motion.button>
                  ))}
                </motion.div>
              </>
            );
          })()}
        </>
      )}

      {/* ── Category: Posters & Flyers (3 images per row) ──────────── */}
      {activeCategory === 'posters' && (
        <>
          <div className="freelance-drilldown-header">
            <h3>POSTERS &amp; FLYERS</h3>
            <span>
              {posterWorks.length} {posterWorks.length === 1 ? 'piece' : 'pieces'}
            </span>
          </div>

          <motion.div
            className="freelance-drilldown-grid freelance-drilldown-grid--posters"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {posterWorks.map((work, workIndex) => (
              <motion.button
                key={work.id}
                type="button"
                className="freelance-tile"
                data-cursor="view"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35 }}
                onClick={() => setActiveIndex(workIndex)}
                aria-label={`View ${work.title}`}
              >
                <span
                  className="freelance-image-wrap"
                  style={{
                    aspectRatio:
                      work.width && work.height
                        ? work.width > work.height
                          ? '1 / 1'
                          : `${work.width} / ${work.height}`
                        : undefined,
                  }}
                >
                  <img
                    src={work.image}
                    alt={work.title}
                    width={work.width}
                    height={work.height}
                    loading="lazy"
                    decoding="async"
                  />
                </span>

                <span className="freelance-caption">
                  <span>
                    <strong>{work.title}</strong>
                    <small>{work.subgroup || work.category}</small>
                  </span>
                  <span className="freelance-open" aria-hidden="true">
                    <ArrowRight size={15} />
                  </span>
                </span>
              </motion.button>
            ))}
          </motion.div>
        </>
      )}

      {/* ── Lightbox Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {activeWork && activeIndex !== null && (
          <motion.div
            className="work-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={activeWork.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveIndex(null)}
          >
            <button
              className="lightbox-close"
              onClick={() => setActiveIndex(null)}
              aria-label="Close preview"
            >
              <X size={22} />
            </button>

            <button
              className="lightbox-arrow lightbox-previous"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(
                  (activeIndex - 1 + currentWorks.length) % currentWorks.length
                );
              }}
              aria-label="Previous work"
            >
              <ArrowLeft size={20} />
            </button>

            <motion.div
              key={activeWork.id}
              className="lightbox-content"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img src={activeWork.image} alt={activeWork.title} />
              <div className="lightbox-caption">
                <span>{activeWork.category}</span>
                <strong>{activeWork.title}</strong>
                <small>
                  {String(activeIndex + 1).padStart(2, '0')} /{' '}
                  {String(currentWorks.length).padStart(2, '0')}
                </small>
              </div>
            </motion.div>

            <button
              className="lightbox-arrow lightbox-next"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex((activeIndex + 1) % currentWorks.length);
              }}
              aria-label="Next work"
            >
              <ArrowRight size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
