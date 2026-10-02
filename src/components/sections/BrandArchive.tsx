import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from 'lucide-react';
import { selectedWorkBrands, selectedWorks, type SelectedWorkCategory, type SelectedWorkItem } from '../../data/selectedWorks';
import { FreelanceWorksSection } from './FreelanceWorksSection';

// Ordered categories: 1. Ads & Posters → 2. Thumbnails → 3. Stories → 4. Mailer → 5. Carousels → 6. Logo Presentation → 7. Other
const topicOrder = ['Ads & Posters', 'Thumbnails', 'Stories', 'Mailer', 'Carousels', 'Logo Presentation', 'Other'];

const getWorkCategory = (work: SelectedWorkItem): string => {
  if (work.category === 'Mailer' || work.title.toLowerCase().includes('mailer')) {
    return 'Mailer';
  }
  if (work.category === 'Posters & Ads' || work.category === 'Ads & Posters') {
    return 'Ads & Posters';
  }
  return work.category;
};

const getTopicDataAttr = (category: string): string => {
  return category.toLowerCase().replace(/[^a-z]+/g, '-');
};

const toSlug = (text: string): string => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

const getWorkThumbnail = (work: SelectedWorkItem): string => {
  if (work.thumbnail) return work.thumbnail;
  if (work.type === 'pdf') {
    return work.image.replace(/\.pdf$/i, '-thumb.webp');
  }
  return work.image;
};

export const BrandArchive: React.FC = () => {
  const [works, setWorks] = useState(selectedWorks);
  const [brands, setBrands] = useState(selectedWorkBrands);
  const [searchParams] = useSearchParams();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Fetch remote selected works
  useEffect(() => {
    let cancelled = false;
    fetch('/api/selected-works')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Could not load selected works')))
      .then((result) => {
        if (cancelled || !result?.success || !Array.isArray(result.data)) return;
        const remoteWorks = result.data as SelectedWorkItem[];
        const brandOrder = new Map(selectedWorkBrands.map((brand, index) => [brand, index]));
        const nextBrands = [...new Set(remoteWorks.map((work) => work.brand))]
          .sort((left, right) => (brandOrder.get(left) ?? Number.MAX_SAFE_INTEGER) - (brandOrder.get(right) ?? Number.MAX_SAFE_INTEGER) || left.localeCompare(right));
        setWorks(remoteWorks);
        setBrands(nextBrands);
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  // Build brand-wise organized sections data
  const brandSectionsData = useMemo(() => {
    return brands.map((brand) => {
      const allBrandWorks = works.filter((work) => work.brand === brand);

      const topicGroups = topicOrder.map((category) => {
        const categoryWorks = allBrandWorks.filter((work) => getWorkCategory(work) === category);
        const collectionGroups = category === 'Carousels'
          ? [...new Set(categoryWorks.map((work) => work.collection || work.title))].map((collection) => ({
              collection,
              works: categoryWorks.filter((work) => (work.collection || work.title) === collection),
            }))
          : [{ collection: '', works: categoryWorks }];

        return {
          category,
          works: categoryWorks,
          collectionGroups,
        };
      }).filter((group) => group.works.length > 0);

      const displayedBrandWorks = topicGroups.flatMap((group) =>
        group.collectionGroups.flatMap((cg) => cg.works)
      );

      return {
        brand,
        slug: toSlug(brand),
        topicGroups,
        displayedBrandWorks,
        totalWorks: allBrandWorks.length,
      };
    }).filter((section) => section.displayedBrandWorks.length > 0);
  }, [brands, works]);

  // Flattened list of displayed works for global lightbox navigation
  const displayedWorks = useMemo(() => {
    return brandSectionsData.flatMap((section) => section.displayedBrandWorks);
  }, [brandSectionsData]);

  // Deep-link to brand via URL param e.g. /work?brand=loft
  useEffect(() => {
    const rawBrandParam = searchParams.get('brand');
    if (rawBrandParam) {
      const slug = toSlug(rawBrandParam);
      const timer = setTimeout(() => {
        const el = document.getElementById(`brand-${slug}`);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Lightbox keyboard navigation
  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveIndex(null);
      if (event.key === 'ArrowRight') setActiveIndex((index) => index === null ? null : (index + 1) % displayedWorks.length);
      if (event.key === 'ArrowLeft') setActiveIndex((index) => index === null ? null : (index - 1 + displayedWorks.length) % displayedWorks.length);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeIndex, displayedWorks.length]);

  const activeWork = activeIndex === null ? null : displayedWorks[activeIndex];

  const tiltWork = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--tilt-x', `${-((event.clientY - bounds.top) / bounds.height - 0.5) * 4}deg`);
    event.currentTarget.style.setProperty('--tilt-y', `${((event.clientX - bounds.left) / bounds.width - 0.5) * 4}deg`);
  };

  const resetTilt = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.style.setProperty('--tilt-x', '0deg');
    event.currentTarget.style.setProperty('--tilt-y', '0deg');
  };

  return (
    <main className="brand-archive" id="selected-work">
      {/* Page Header */}
      <div className="archive-heading">
        <div>
          <span className="archive-kicker">PORTFOLIO ARCHIVE</span>
          <h1>Selected works<span className="archive-period">.</span></h1>
        </div>
        <p>A comprehensive brand-wise archive of commercial design, advertising campaigns, and visual identities.</p>
      </div>

      {/* Brand-Wise Works List */}
      <div className="brand-directory-list">
        {brandSectionsData.map((section) => (
          <section
            key={section.brand}
            id={`brand-${section.slug}`}
            className="brand-section scroll-mt-28 pt-10 md:pt-16 pb-12 mb-8 border-t border-[#E5E5E5] first:border-t-0 first:pt-2"
          >
            {/* Brand Header: Only Brand Name */}
            <div className="mb-8 md:mb-12 pb-4 border-b border-[#E5E5E5]">
              <h2 className="text-[32px] sm:text-[44px] md:text-[54px] font-bold text-[#111111] tracking-[-0.04em] leading-[1.0] uppercase m-0">
                {section.brand}<span className="archive-period">.</span>
              </h2>
            </div>

            {/* Brand Topic Groups */}
            <div className="brand-topic-list">
              {section.topicGroups.map((group) => {
                const topicSlug = getTopicDataAttr(group.category);
                const topicId = `brand-${section.slug}-${topicSlug}`;

                return (
                  <div
                    id={topicId}
                    key={group.category}
                    className="brand-topic"
                    data-topic={topicSlug}
                  >
                    <header>
                      <h3>{group.category}</h3>
                      <span>{group.works.length} {group.works.length === 1 ? 'item' : 'items'}</span>
                    </header>

                    {group.collectionGroups.map((collectionGroup) => (
                      <div
                        className={collectionGroup.collection ? 'carousel-project-group' : undefined}
                        key={collectionGroup.collection || group.category}
                      >
                        {collectionGroup.collection && (
                          <div className="carousel-project-heading">
                            <h4>{collectionGroup.collection}</h4>
                            <span>{collectionGroup.works.length} {collectionGroup.works.length === 1 ? 'slide' : 'slides'}</span>
                          </div>
                        )}

                        <div className="work-masonry">
                          {collectionGroup.works.map((work) => {
                            const index = displayedWorks.findIndex((item) => item.id === work.id);
                            const tileVariant = (Number(work.id) || 0) % 5;
                            return (
                              <button
                                key={work.id}
                                type="button"
                                data-cursor="view"
                                className={`work-tile work-tile-${tileVariant}`}
                                onClick={() => setActiveIndex(index)}
                                onPointerMove={tiltWork}
                                onPointerLeave={resetTilt}
                                aria-label={`View ${work.title}`}
                              >
                                <span className={`work-image-wrap${work.type === 'pdf' ? ' work-pdf-wrap' : ''}`}>
                                  <img
                                    src={getWorkThumbnail(work)}
                                    alt={work.title}
                                    loading={index < 8 ? 'eager' : 'lazy'}
                                    decoding="async"
                                  />
                                  {work.type === 'pdf' && (
                                    <span className="pdf-badge" aria-label="PDF Document">
                                      PDF
                                    </span>
                                  )}
                                </span>
                                <span className="work-caption">
                                  <span>
                                    <strong>{work.title}</strong>
                                    <small>{work.brand}</small>
                                  </span>
                                  <span className="work-open">
                                    <ArrowRight size={16} />
                                  </span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {brandSectionsData.length === 0 && (
          <p className="archive-empty">No works available.</p>
        )}
      </div>

      {/* Freelance works section */}
      <FreelanceWorksSection />

      {/* Back to top button */}
      <a
        href="#selected-work"
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="archive-back-top"
      >
        <span>Back to top</span>
        <ArrowRight size={16} />
      </a>

      {/* Global Lightbox */}
      <AnimatePresence>
        {activeWork && activeIndex !== null && (
          <motion.div
            className="work-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={`${activeWork.title} by ${activeWork.brand}`}
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
                setActiveIndex((activeIndex - 1 + displayedWorks.length) % displayedWorks.length);
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
              {activeWork.type === 'pdf' ? (
                <div className="pdf-lightbox-viewer w-full flex flex-col items-center">
                  <div className="pdf-viewer-bar w-full flex items-center justify-between mb-2 px-1">
                    <span className="text-[12px] text-[#aaa] font-medium tracking-wide">
                      DOCUMENT VIEWER · {activeWork.brand}
                    </span>
                    <a
                      href={activeWork.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-black text-[12px] font-semibold hover:bg-[#e0e0e0] transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>Open in New Tab</span>
                      <ArrowUpRight size={14} />
                    </a>
                  </div>
                  <iframe
                    title={`${activeWork.title} PDF presentation`}
                    src={`${activeWork.image}#toolbar=1&navpanes=0`}
                    className="w-full h-[70vh] md:h-[76vh] border-0 rounded-lg bg-white"
                  />
                </div>
              ) : (
                <img src={activeWork.image} alt={activeWork.title} />
              )}
              <div className="lightbox-caption">
                <span>{activeWork.brand}</span>
                <strong>{activeWork.title}</strong>
                <small>
                  {activeWork.type === 'pdf'
                    ? 'PDF Presentation'
                    : activeWork.width && activeWork.height
                    ? `${activeWork.width} × ${activeWork.height}`
                    : ''}{' '}
                  · {String(activeIndex + 1).padStart(2, '0')} / {String(displayedWorks.length).padStart(2, '0')}
                </small>
              </div>
            </motion.div>
            <button
              className="lightbox-arrow lightbox-next"
              onClick={(event) => {
                event.stopPropagation();
                setActiveIndex((activeIndex + 1) % displayedWorks.length);
              }}
              aria-label="Next work"
            >
              <ArrowRight size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};
