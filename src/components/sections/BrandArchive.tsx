import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, Search, X } from 'lucide-react';
import { selectedWorkBrands, selectedWorks, type SelectedWorkCategory, type SelectedWorkItem } from '../../data/selectedWorks';
import { FreelanceWorksSection } from './FreelanceWorksSection';

// Reordered categories: 1. Ads & Posters → 2. Thumbnails → 3. Stories → 4. Mailer
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

const BRAND_LOGOS: Record<string, string> = {
  anivom: '/logos/anivom.png',
  bakers: '/logos/bakers.png',
  bea: '/logos/bea.png',
  bevis: '/logos/bevis.png',
  'bro knows tech': '/logos/bkt.png',
  bkt: '/logos/bkt.png',
  loft: '/logos/loft.png',
  pavizham: '/logos/pavizham-white.png',
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

const BRAND_HERO_PICKS: Record<string, string[]> = {
  bakers: ['Bakers Apple CIder vinegar', 'Bakers Blue Coraco Syrup'],
  loft: ['Loft Anime Carousel 1', 'Loft Book 1 Get 1 2'],
  pavizham: ['Pavizham Emerald Necklace', 'Pavizham Diwali Poster'],
  tmg: ['TMG Kangeyam Exclusive', 'TMG Valentines Wishes'],
  bea: ['BEA Panasonic 8 in 1 Convertible AC Thumbnail', 'BEA Samsung Windfree AC Thumbnail'],
  'bro knows tech': ['BKT Bravia 2 II Launch', 'Bro knows tech Revealing poster v1'],
  bkt: ['BKT Bravia 2 II Launch', 'Bro knows tech Revealing poster v1'],
};

const getBrandCuratedWorks = (brand: string, allWorks: SelectedWorkItem[]): SelectedWorkItem[] => {
  const brandWorks = allWorks.filter((w) => w.brand === brand && w.type === 'image');
  if (brandWorks.length === 0) return [];

  const key = brand.trim().toLowerCase();
  const preferredTitles = BRAND_HERO_PICKS[key];
  if (preferredTitles) {
    const matched = preferredTitles
      .map((title) => brandWorks.find((w) => w.title.toLowerCase().includes(title.toLowerCase())))
      .filter((w): w is SelectedWorkItem => Boolean(w));
    if (matched.length > 0) {
      const remaining = brandWorks.filter((w) => !matched.some((m) => m.id === w.id));
      return [...matched, ...remaining].slice(0, 2);
    }
  }

  const priority = (cat: string) => {
    if (cat === 'Posters & Ads' || cat === 'Ads & Posters') return 1;
    if (cat === 'Thumbnails') return 2;
    if (cat === 'Carousels') return 3;
    if (cat === 'Stories') return 4;
    return 5;
  };
  const sorted = [...brandWorks].sort((a, b) => priority(a.category) - priority(b.category));
  return sorted.slice(0, 2);
};

export const BrandArchive: React.FC = () => {
  const [works, setWorks] = useState(selectedWorks);
  const [brands, setBrands] = useState(selectedWorkBrands);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

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

  const brandWorks = useMemo(() => works.filter((work) =>
    work.brand === activeBrand && `${work.brand} ${work.title}`.toLowerCase().includes(query.trim().toLowerCase())
  ), [activeBrand, query, works]);

  const topicGroups = useMemo(() => topicOrder.map((category) => ({
    category,
    works: brandWorks.filter((work) => getWorkCategory(work) === category),
  })).filter((group) => group.works.length > 0), [brandWorks]);
  const displayedWorks = useMemo(() => topicGroups.flatMap((group) => group.works), [topicGroups]);

  const visibleBrands = useMemo(() => brands.filter((brand) =>
    `${brand} ${works.filter((work) => work.brand === brand).map((work) => work.title).join(' ')}`
      .toLowerCase().includes(query.trim().toLowerCase())
  ), [brands, query, works]);

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
      <div className="archive-controls">
        {activeBrand ? (
          <button className="brand-back" type="button" onClick={() => { setActiveBrand(null); setActiveIndex(null); setQuery(''); }}><ArrowLeft size={15} /> All brands</button>
        ) : (
          <div className="archive-controls-left">
            <span className="brand-list-label">Brand Works · {brands.length}</span>
          </div>
        )}
        <label className="archive-search">
          <Search size={16} aria-hidden="true" />
          <input value={query} onChange={(event) => { setQuery(event.target.value); setActiveIndex(null); }} placeholder={activeBrand ? 'Search this brand' : 'Find a brand or project'} aria-label={activeBrand ? 'Search this brand' : 'Search brands and projects'} />
          {query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')}><X size={15} /></button>}
        </label>
      </div>

      <div className="archive-heading">
        <div>
          <span className="archive-kicker">Portfolio</span>
          <h1>{activeBrand || 'My works'}<span className="archive-period">.</span></h1>
        </div>
        <p>{activeBrand ? `${brandWorks.length} pieces for ${activeBrand}.` : 'Choose a brand to see its work.'}</p>
      </div>

      {!activeBrand ? (
        <>
          <div className="brand-directory">
          {visibleBrands.map((brand, index) => {
            const curatedWorks = getBrandCuratedWorks(brand, works);
            const count = works.filter((work) => work.brand === brand).length;
            const primary = curatedWorks[0];
            const secondary = curatedWorks[1];

            return (
              <motion.button
                key={brand}
                type="button"
                className="brand-card"
                data-cursor="view"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index, 7) * .025 }}
                onClick={() => { setActiveBrand(brand); setQuery(''); }}
                aria-label={`View ${brand} work`}
              >
                <span className="brand-card-media">
                  <span className="brand-card-media-inner">
                    {secondary ? (
                      <span className="brand-card-diptych">
                        <span className="brand-card-diptych-pane brand-card-diptych-pane--main">
                          <img
                            src={primary.image}
                            alt=""
                            loading={index < 6 ? 'eager' : 'lazy'}
                            decoding="async"
                            className="brand-card-img"
                          />
                        </span>
                        <span className="brand-card-diptych-divider" aria-hidden="true" />
                        <span className="brand-card-diptych-pane brand-card-diptych-pane--sub">
                          <img
                            src={secondary.image}
                            alt=""
                            loading={index < 6 ? 'eager' : 'lazy'}
                            decoding="async"
                            className="brand-card-img"
                          />
                        </span>
                      </span>
                    ) : primary ? (
                      <span className="brand-card-single">
                        <img
                          src={primary.image}
                          alt=""
                          loading={index < 6 ? 'eager' : 'lazy'}
                          decoding="async"
                          className="brand-card-img"
                        />
                      </span>
                    ) : (
                      <span className="brand-card-fallback" />
                    )}
                  </span>


                  <span className="brand-card-overlay">
                    <span className="brand-card-view-cta">
                      View work <ArrowRight size={13} aria-hidden="true" />
                    </span>
                  </span>
                </span>

                <span className="brand-card-caption">
                  <strong className="brand-card-title">{brand}</strong>
                  <span className="brand-card-category">{getBrandCategory(brand)}</span>
                  <span className="brand-card-count">{count} {count === 1 ? 'project' : 'projects'}</span>
                </span>
              </motion.button>
            );
          })}
          {visibleBrands.length === 0 && <p className="archive-empty">No brands or projects match that search.</p>}
        </div>
        {!query && <FreelanceWorksSection />}
      </>
      ) : (
        <>
          <div className="archive-result-count">{brandWorks.length} {brandWorks.length === 1 ? 'piece' : 'pieces'} <span>·</span> {activeBrand}</div>
          <nav className="topic-index" aria-label="Creative types">
            {topicGroups.map((group) => <a key={group.category} href={`#brand-topic-${group.category.toLowerCase().replace(/[^a-z]+/g, '-')}`}>{group.category}<span>{group.works.length}</span></a>)}
          </nav>
          <div className="brand-topic-list">
            {topicGroups.map((group) => {
              const topicId = `brand-topic-${group.category.toLowerCase().replace(/[^a-z]+/g, '-')}`;
              const collectionGroups = group.category === 'Carousels'
                ? [...new Set(group.works.map((work) => work.collection || work.title))].map((collection) => ({
                  collection,
                  works: group.works.filter((work) => (work.collection || work.title) === collection),
                }))
                : [{ collection: '', works: group.works }];
              return (
                <section id={topicId} key={group.category} className="brand-topic" data-topic={group.category.toLowerCase().replace(/[^a-z]+/g, '-')}>
                  <header><h2>{group.category}</h2><span>{group.works.length} {group.works.length === 1 ? 'piece' : 'pieces'}</span></header>
                  {collectionGroups.map((collectionGroup) => (
                    <div className={collectionGroup.collection ? 'carousel-project-group' : undefined} key={collectionGroup.collection || group.category}>
                      {collectionGroup.collection && <div className="carousel-project-heading"><h3>{collectionGroup.collection}</h3><span>{collectionGroup.works.length} {collectionGroup.works.length === 1 ? 'slide' : 'slides'}</span></div>}
                      <motion.div layout className="work-masonry">
                        <AnimatePresence mode="popLayout">
                          {collectionGroup.works.map((work) => {
                            const index = displayedWorks.findIndex((item) => item.id === work.id);
                            return (
                              <motion.button layout key={work.id} type="button" data-cursor="view" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .96 }} transition={{ duration: .25 }} className={`work-tile work-tile-${work.id % 5}`} onClick={() => setActiveIndex(index)} onPointerMove={tiltWork} onPointerLeave={resetTilt} aria-label={`View ${work.title}`}>
                                <span className={`work-image-wrap${work.type === 'pdf' ? ' work-document' : ''}`}>{work.type === 'pdf' ? <span className="document-card"><span>PDF · PRESENTATION</span><strong>{work.brand}</strong><small>{work.title}</small><span className="document-open">View presentation <ArrowRight size={14} /></span></span> : <img src={work.image} alt={work.title} loading={index < 8 ? 'eager' : 'lazy'} />}</span>
                                <span className="work-caption"><span><strong>{work.title}</strong><small>{work.brand}</small></span><span className="work-open"><ArrowRight size={16} /></span></span>
                              </motion.button>
                            );
                          })}
                        </AnimatePresence>
                      </motion.div>
                    </div>
                  ))}
                </section>
              );
            })}
          </div>
          {brandWorks.length === 0 && <div className="archive-empty">No projects match that search.</div>}
        </>
      )}

      <AnimatePresence>
        {activeWork && activeIndex !== null && (
          <motion.div className="work-lightbox" role="dialog" aria-modal="true" aria-label={`${activeWork.title} by ${activeWork.brand}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveIndex(null)}>
            <button className="lightbox-close" onClick={() => setActiveIndex(null)} aria-label="Close preview"><X size={22} /></button>
            <button className="lightbox-arrow lightbox-previous" onClick={(event) => { event.stopPropagation(); setActiveIndex((activeIndex - 1 + displayedWorks.length) % displayedWorks.length); }} aria-label="Previous work"><ArrowLeft size={20} /></button>
            <motion.div key={activeWork.id} className="lightbox-content" initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} onClick={(event) => event.stopPropagation()}>
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
                  {activeWork.type === 'pdf' ? 'PDF Presentation' : activeWork.width && activeWork.height ? `${activeWork.width} × ${activeWork.height}` : ''} · {String(activeIndex + 1).padStart(2, '0')} / {String(displayedWorks.length).padStart(2, '0')}
                </small>
              </div>
            </motion.div>
            <button className="lightbox-arrow lightbox-next" onClick={(event) => { event.stopPropagation(); setActiveIndex((activeIndex + 1) % displayedWorks.length); }} aria-label="Next work"><ArrowRight size={20} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};
