import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, Search, X } from 'lucide-react';
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

const BRAND_LOGOS: Record<string, string> = {
  anivom: '/logos/anivom.png',
  bakers: '/logos/bakers.png',
  bea: '/logos/bea.png',
  bevis: '/logos/bevis.png',
  'bro knows tech': '/logos/bkt.png',
  bkt: '/logos/bkt.png',
  loft: '/logos/loft.png',
  pavizham: '/logos/pavizham.png',
  siggis: '/logos/siggis.png',
  sms: '/logos/sms.png',
  'senthil metric school': '/logos/sms.png',
  'senthil matric school': '/logos/sms.png',
  subiksham: '/logos/subiksham.png',
  thriveni: '/logos/thriveni.svg',
  tmg: '/logos/tmg.png',
};

const getBrandLogo = (brand: string): string | undefined => {
  return BRAND_LOGOS[brand.trim().toLowerCase()];
};

const BRAND_CATEGORIES: Record<string, string> = {
  anivom: 'Clothing Brand',
  bakers: 'FMCG',
  bea: 'Consumer Electronics',
  bevis: 'Advertising Agency',
  'bro knows tech': 'Tech & Media',
  bkt: 'Tech & Media',
  loft: 'Private Screening Theatre',
  pavizham: 'Jewellery Brand',
  siggis: 'FMCG',
  sms: 'Matriculation School',
  'senthil metric school': 'Matriculation School',
  'senthil matric school': 'Matriculation School',
  subiksham: 'Clothing Brand',
  tarangi: 'Jewellery Brand',
  thriveni: 'Mining & Earthmovers',
  tmg: 'Clothing Brand',
  woneten: 'Clothing Brand',
  yaazhi: 'Jewellery Brand',
  zen: 'Office & Workspace Solutions',
};

const getBrandCategory = (brand: string): string => {
  return BRAND_CATEGORIES[brand.trim().toLowerCase()] || 'Creative Works';
};

export const BrandArchive: React.FC = () => {
  const [works, setWorks] = useState(selectedWorks);
  const [brands, setBrands] = useState(selectedWorkBrands);
  const [searchParams] = useSearchParams();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNavBrand, setActiveNavBrand] = useState<string>('all');
  const navContainerRef = useRef<HTMLDivElement>(null);

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
    const q = searchQuery.trim().toLowerCase();

    return brands.map((brand) => {
      const allBrandWorks = works.filter((work) => work.brand === brand);
      const filteredBrandWorks = q
        ? allBrandWorks.filter((work) => (
            work.title.toLowerCase().includes(q) ||
            work.brand.toLowerCase().includes(q) ||
            work.category.toLowerCase().includes(q) ||
            (work.collection && work.collection.toLowerCase().includes(q))
          ))
        : allBrandWorks;

      const topicGroups = topicOrder.map((category) => {
        const categoryWorks = filteredBrandWorks.filter((work) => getWorkCategory(work) === category);
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
        category: getBrandCategory(brand),
        logo: getBrandLogo(brand),
        topicGroups,
        displayedBrandWorks,
        totalWorks: allBrandWorks.length,
      };
    }).filter((section) => section.displayedBrandWorks.length > 0);
  }, [brands, works, searchQuery]);

  // Flattened list of displayed works for global lightbox navigation
  const displayedWorks = useMemo(() => {
    return brandSectionsData.flatMap((section) => section.displayedBrandWorks);
  }, [brandSectionsData]);

  // Smooth scroll to a brand section
  const scrollToBrand = (slug: string) => {
    const element = document.getElementById(`brand-${slug}`);
    if (element) {
      const yOffset = -135;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveNavBrand(slug);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveNavBrand('all');
  };

  // Scroll spy to update active brand pill in sticky navigation
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 120) {
        setActiveNavBrand('all');
        return;
      }
      const scrollPosition = window.scrollY + 180;
      for (const section of brandSectionsData) {
        const el = document.getElementById(`brand-${section.slug}`);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveNavBrand(section.slug);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [brandSectionsData]);

  // Deep-link to brand via URL param e.g. /work?brand=loft
  useEffect(() => {
    const rawBrandParam = searchParams.get('brand');
    if (rawBrandParam) {
      const slug = toSlug(rawBrandParam);
      const timer = setTimeout(() => {
        scrollToBrand(slug);
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

      {/* Sticky Brand Jump Navigation Bar */}
      <div className="sticky top-[68px] z-30 bg-white/95 backdrop-blur-[16px] border-b border-[#E5E5E5] py-3 -mx-5 sm:-mx-8 md:-mx-12 px-5 sm:px-8 md:px-12 mb-8 transition-all">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
          {/* Scrollable brand jump buttons */}
          <div
            ref={navContainerRef}
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full"
          >
            <button
              type="button"
              onClick={scrollToTop}
              className={`px-3.5 py-1.5 rounded-full text-[12px] md:text-[13px] font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                activeNavBrand === 'all'
                  ? 'bg-[#111111] text-white shadow-xs'
                  : 'bg-[#F4F4F4] text-[#666666] hover:bg-[#EAEAEA] hover:text-[#111111]'
              }`}
            >
              All Brands <span className="opacity-60 text-[11px] ml-1">({displayedWorks.length})</span>
            </button>

            {brandSectionsData.map((section) => {
              const isActive = activeNavBrand === section.slug;
              return (
                <button
                  key={section.brand}
                  type="button"
                  onClick={() => scrollToBrand(section.slug)}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] md:text-[13px] font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#111111] text-white shadow-xs'
                      : 'bg-[#F4F4F4] text-[#666666] hover:bg-[#EAEAEA] hover:text-[#111111]'
                  }`}
                >
                  {section.brand}
                  <span className="opacity-60 text-[11px] ml-1">({section.displayedBrandWorks.length})</span>
                </button>
              );
            })}
          </div>

          {/* Quick search input */}
          <div className="hidden sm:flex items-center gap-2 border-b border-[#D0D0D0] pb-1 min-w-[170px] lg:min-w-[210px] shrink-0">
            <Search size={14} className="text-[#888888] shrink-0" />
            <input
              type="text"
              placeholder="Search works..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-[12px] bg-transparent outline-none text-[#111111] placeholder:text-[#999999]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[#888888] hover:text-[#111111] cursor-pointer"
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Brand-Wise Works List */}
      <div className="brand-directory-list">
        {brandSectionsData.map((section) => (
          <section
            key={section.brand}
            id={`brand-${section.slug}`}
            className="brand-section scroll-mt-36 pt-10 md:pt-16 pb-12 mb-8 border-t border-[#E5E5E5] first:border-t-0 first:pt-2"
          >
            {/* Brand Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 md:mb-10 pb-5 border-b border-[#EAEAEA]">
              <div>
                <div className="flex items-center gap-3.5 flex-wrap">
                  {section.logo && (
                    <div className="h-10 md:h-12 w-auto max-w-[120px] px-2 py-1 bg-[#F9F9F8] rounded-[6px] border border-[#EBEBEB] flex items-center justify-center shrink-0">
                      <img
                        src={section.logo}
                        alt={`${section.brand} logo`}
                        className="max-h-full max-w-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                        onError={(e) => {
                          (e.currentTarget.parentElement as HTMLElement)?.style.setProperty('display', 'none');
                        }}
                      />
                    </div>
                  )}
                  <h2 className="text-[28px] sm:text-[38px] md:text-[46px] font-bold text-[#111111] tracking-[-0.035em] leading-[1.0] uppercase m-0">
                    {section.brand}<span className="text-[#888888]">.</span>
                  </h2>
                </div>
                <div className="flex items-center gap-2 mt-2 text-[13px] md:text-[14px] text-[#6B6B6B]">
                  <span className="font-semibold text-[#111111]">{section.category}</span>
                  <span>·</span>
                  <span>{section.totalWorks} {section.totalWorks === 1 ? 'project' : 'projects'}</span>
                </div>
              </div>

              {/* Category tags for this brand */}
              {section.topicGroups.length > 1 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {section.topicGroups.map((g) => (
                    <a
                      key={g.category}
                      href={`#brand-${section.slug}-${getTopicDataAttr(g.category)}`}
                      className="text-[11px] md:text-[12px] font-medium px-2.5 py-1 rounded-full border border-[#DFE2D9] text-[#555555] hover:border-[#111111] hover:text-[#111111] transition-colors"
                    >
                      {g.category} ({g.works.length})
                    </a>
                  ))}
                </div>
              )}
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
                                <span className={`work-image-wrap${work.type === 'pdf' ? ' work-document' : ''}`}>
                                  {work.type === 'pdf' ? (
                                    <span className="document-card">
                                      <span>PDF · PRESENTATION</span>
                                      <strong>{work.brand}</strong>
                                      <small>{work.title}</small>
                                      <span className="document-open">
                                        View presentation <ArrowRight size={14} />
                                      </span>
                                    </span>
                                  ) : (
                                    <img
                                      src={work.image}
                                      alt={work.title}
                                      loading={index < 8 ? 'eager' : 'lazy'}
                                      decoding="async"
                                    />
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
          <p className="archive-empty">
            {searchQuery ? `No works matching "${searchQuery}".` : 'No works available.'}
          </p>
        )}
      </div>

      {/* Freelance works section */}
      <FreelanceWorksSection />

      {/* Back to top button */}
      <a
        href="#selected-work"
        onClick={(e) => {
          e.preventDefault();
          scrollToTop();
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
