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

// All freelance works in unified order for lightbox navigation
const allFreelanceWorks: FreelanceWorkItem[] = [
  ...logofolio1Works,
  ...logofolio2Works,
  ...posterWorks,
];

const FREELANCE_SECTIONS = [
  {
    id: 'logofolio-01',
    num: '01',
    title: 'LOGOFOLIO 01',
    subtitle: 'Brand Identity System',
    gridClass: 'freelance-grid--logos',
    works: logofolio1Works,
  },
  {
    id: 'logofolio-02',
    num: '02',
    title: 'LOGOFOLIO 02',
    subtitle: 'Brand Identity System',
    gridClass: 'freelance-grid--logos',
    works: logofolio2Works,
  },
  {
    id: 'posters-flyers',
    num: '03',
    title: 'POSTERS & FLYERS',
    subtitle: 'Promotional & Event Creatives',
    gridClass: 'freelance-grid--posters',
    works: posterWorks,
  },
];

/* ─── Component ──────────────────────────────────────────────────────── */

export const FreelanceWorksSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Lightbox keyboard controls
  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveIndex(null);
      if (event.key === 'ArrowRight') {
        setActiveIndex((idx) =>
          idx === null ? null : (idx + 1) % allFreelanceWorks.length
        );
      }
      if (event.key === 'ArrowLeft') {
        setActiveIndex((idx) =>
          idx === null
            ? null
            : (idx - 1 + allFreelanceWorks.length) % allFreelanceWorks.length
        );
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeIndex]);

  const activeWork: FreelanceWorkItem | null =
    activeIndex !== null ? allFreelanceWorks[activeIndex] ?? null : null;

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
          Independent client identity systems, logomark presentations, and promotional posters &amp; flyers.
        </p>
      </div>

      {/* Open Folders: Logofolio 01, Logofolio 02, and Posters & Flyers */}
      <div className="freelance-open-folders mt-10 md:mt-14">
        {FREELANCE_SECTIONS.map((section) => (
          <div key={section.id} id={section.id} className="freelance-group">
            <header className="freelance-group-header">
              <div className="freelance-group-title-wrap">
                <span className="freelance-group-number">{section.num}</span>
                <h3>{section.title}</h3>
              </div>
              <span className="freelance-group-count">
                {section.works.length} {section.works.length === 1 ? 'piece' : 'pieces'}
              </span>
            </header>

            <div className={`freelance-grid ${section.gridClass}`}>
              {section.works.map((work) => {
                const globalIndex = allFreelanceWorks.findIndex((item) => item.id === work.id);
                const isPoster = section.id === 'posters-flyers';
                const aspectRatio = work.width && work.height
                  ? isPoster && work.width > work.height
                    ? '1 / 1'
                    : `${work.width} / ${work.height}`
                  : undefined;

                return (
                  <motion.button
                    key={work.id}
                    type="button"
                    className="freelance-tile"
                    data-cursor="view"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.35 }}
                    onClick={() => setActiveIndex(globalIndex)}
                    aria-label={`View ${work.title}`}
                  >
                    <span
                      className="freelance-image-wrap"
                      style={{ aspectRatio }}
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
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeWork && activeIndex !== null && (
          <motion.div
            className="work-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={`${activeWork.title} - ${activeWork.category}`}
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
              onClick={(event) => {
                event.stopPropagation();
                setActiveIndex((activeIndex - 1 + allFreelanceWorks.length) % allFreelanceWorks.length);
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
              onClick={(event) => event.stopPropagation()}
            >
              <img
                src={activeWork.image}
                alt={activeWork.title}
                width={activeWork.width}
                height={activeWork.height}
              />
              <div className="lightbox-caption">
                <span>{activeWork.subgroup || activeWork.category}</span>
                <strong>{activeWork.title}</strong>
                <small>
                  {activeWork.width && activeWork.height
                    ? `${activeWork.width} × ${activeWork.height}`
                    : ''}{' '}
                  · {String(activeIndex + 1).padStart(2, '0')} / {String(allFreelanceWorks.length).padStart(2, '0')}
                </small>
              </div>
            </motion.div>
            <button
              className="lightbox-arrow lightbox-next"
              onClick={(event) => {
                event.stopPropagation();
                setActiveIndex((activeIndex + 1) % allFreelanceWorks.length);
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
