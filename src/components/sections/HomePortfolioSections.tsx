import React from 'react';
import { ArrowRight, ArrowUpRight, Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { selectedWorks } from '../../data/selectedWorks';
import { usePortfolio } from '../../context/PortfolioContext';

type BrandPreview = { brand: string; title: string; image: string; category: string };

function previewForBrand(brand: string): BrandPreview | undefined {
  const work = selectedWorks.find((item) => item.brand === brand && item.type === 'image' && item.category === 'Posters & Ads')
    || selectedWorks.find((item) => item.brand === brand && item.type === 'image');
  return work ? { brand, title: work.title, image: work.image, category: work.category } : undefined;
}

const featuredBrands = ['BAKERS', 'Bro Knows Tech', 'LOFT', 'BEVIS', 'PAVIZHAM', 'SIGGIS'];

function ProjectCard({ project, index, size = '' }: { project: BrandPreview; index: number; size?: string }) {
  return (
    <Link to="/work" className={`landing-project-card ${size}`} data-cursor="view">
      <div className="landing-project-image">
        <img src={project.image} alt={`${project.brand} — ${project.title}`} loading="lazy" />
        <span className="landing-project-hover">VIEW PROJECT <ArrowUpRight size={14} /></span>
      </div>
      <div className="landing-project-info">
        <span className="landing-project-number">PROJECT 0{index + 1}</span>
        <span className="landing-project-title"><strong>{project.brand}</strong><small>{project.category}</small></span>
        <i aria-hidden="true"><ArrowUpRight size={18} /></i>
      </div>
    </Link>
  );
}

export const HomeSelectedWorks: React.FC = () => {
  const projects = featuredBrands
    .map(previewForBrand)
    .filter((item): item is BrandPreview => Boolean(item));

  return (
    <section className="home-selected" id="selected-works">
      <div className="home-section-heading">
        <div>
          <p className="home-eyebrow">SELECTED WORKS</p>
          <h2>A selection of visual identities,<br className="desktop-break" /> campaigns & digital work.</h2>
        </div>
        <Link to="/work" className="home-text-link" data-cursor="link">All work <ArrowRight size={16} /></Link>
      </div>
      <div className="home-project-grid">
        {projects[0] && <ProjectCard project={projects[0]} index={0} size="project-large" />}
        <div className="project-pair">
          {projects[1] && <ProjectCard project={projects[1]} index={1} />}
          {projects[2] && <ProjectCard project={projects[2]} index={2} />}
        </div>
        {projects[3] && <ProjectCard project={projects[3]} index={3} size="project-large" />}
        <div className="project-pair">
          {projects[4] && <ProjectCard project={projects[4]} index={4} />}
          {projects[5] && <ProjectCard project={projects[5]} index={5} />}
        </div>
      </div>
      <Link to="/work" className="more-projects" data-cursor="link">
        <span><small>EXPLORE THE BRAND ARCHIVE</small><strong>More projects</strong></span>
        <i aria-hidden="true"><ArrowRight size={19} /></i>
      </Link>
    </section>
  );
};

export const CapabilitiesSection: React.FC = () => {
  const { about } = usePortfolio();
  const capabilities = about ? about.capabilities : [
    { category: 'SOCIAL MEDIA', skills: ['Posters & ads', 'Stories', 'Carousels'] },
    { category: 'UI DESIGN', skills: ['User interfaces', 'Layout & hierarchy', 'Digital product screens'] },
  ];
  if (!capabilities.length) return null;
  return (
    <section className="home-info-section home-capabilities" id="capabilities">
      <div className="home-info-title"><p className="home-eyebrow">WHAT I DO</p><h2>Capabilities</h2></div>
      <div className="capability-grid">
        {capabilities.slice(0, 4).map((group, index) => <article key={`${group.category}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><h3>{group.category}</h3><p>{group.skills.join(' · ')}</p></article>)}
      </div>
    </section>
  );
};

export const ProcessSection: React.FC = () => (
  <section className="home-info-section home-process" id="process">
    <div className="home-info-title"><p className="home-eyebrow">HOW I WORK</p><h2>Process</h2></div>
    <ol className="process-steps">
      {['Understand', 'Explore', 'Create', 'Deliver'].map((step, index) => <li key={step}><span>0{index + 1}</span><strong>{step}</strong>{index < 3 && <ArrowRight size={17} />}</li>)}
    </ol>
  </section>
);

export const ExperienceSection: React.FC = () => {
  const { about } = usePortfolio();
  const experience = about ? about.experiences?.[0] : { company: 'Bevis Creatives', role: 'Graphic Designer', period: '' };
  const areas = about ? about.capabilities?.flatMap((group) => group.skills).slice(0, 7) || [] : ['Social media posters', 'Stories', 'Carousels', 'Thumbnails', 'UI design'];
  if (!experience) return null;
  return (
    <section className="home-experience" id="experience">
      <div className="home-experience-heading"><p className="home-eyebrow">EXPERIENCE</p><h2>{experience?.company || 'Bevis Creatives'}</h2><span>{experience ? [experience.role, experience.period].filter(Boolean).join(' · ') : 'Graphic Designer'}</span></div>
      <ul aria-label="Areas of experience">
        {areas.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
};

export const SoftwareIcon: React.FC<{ name: string; size?: number }> = ({ name, size = 26 }) => {
  const normalized = name.toLowerCase();

  if (normalized.includes('photoshop')) {
    return (
      <span
        className="inline-flex items-center justify-center shrink-0 rounded-[6px] font-bold select-none shadow-sm"
        style={{
          width: size,
          height: size,
          backgroundColor: '#001e36',
          border: '1.5px solid #31a8ff',
          color: '#31a8ff',
          fontSize: Math.round(size * 0.44),
          letterSpacing: '-0.02em',
          lineHeight: 1,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
        title="Adobe Photoshop"
        aria-label="Adobe Photoshop icon"
      >
        Ps
      </span>
    );
  }

  if (normalized.includes('illustrator')) {
    return (
      <span
        className="inline-flex items-center justify-center shrink-0 rounded-[6px] font-bold select-none shadow-sm"
        style={{
          width: size,
          height: size,
          backgroundColor: '#330000',
          border: '1.5px solid #ff9a00',
          color: '#ff9a00',
          fontSize: Math.round(size * 0.44),
          letterSpacing: '-0.02em',
          lineHeight: 1,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
        title="Adobe Illustrator"
        aria-label="Adobe Illustrator icon"
      >
        Ai
      </span>
    );
  }

  if (normalized.includes('indesign')) {
    return (
      <span
        className="inline-flex items-center justify-center shrink-0 rounded-[6px] font-bold select-none shadow-sm"
        style={{
          width: size,
          height: size,
          backgroundColor: '#49021f',
          border: '1.5px solid #ff3366',
          color: '#ff3366',
          fontSize: Math.round(size * 0.44),
          letterSpacing: '-0.02em',
          lineHeight: 1,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
        title="Adobe InDesign"
        aria-label="Adobe InDesign icon"
      >
        Id
      </span>
    );
  }

  if (normalized.includes('figma')) {
    return (
      <span
        className="inline-flex items-center justify-center shrink-0 rounded-[6px] bg-[#1e1e1e] p-[4px] shadow-sm select-none"
        style={{ width: size, height: size }}
        title="Figma"
        aria-label="Figma icon"
      >
        <svg width="100%" height="100%" viewBox="0 0 38 57" fill="none">
          <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE" />
          <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83" />
          <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262" />
          <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E" />
          <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF" />
        </svg>
      </span>
    );
  }

  if (normalized.includes('vibe') || normalized.includes('coding') || normalized.includes('code')) {
    return (
      <span
        className="inline-flex items-center justify-center shrink-0 rounded-[6px] bg-[#18251f] border border-[#2d4437] text-[#4ade80] shadow-sm select-none"
        style={{ width: size, height: size }}
        title="Vibe Coding"
        aria-label="Vibe coding icon"
      >
        <Code2 size={Math.round(size * 0.58)} strokeWidth={2.2} />
      </span>
    );
  }

  if (normalized.includes('after effects')) {
    return (
      <span
        className="inline-flex items-center justify-center shrink-0 rounded-[6px] font-bold select-none shadow-sm"
        style={{
          width: size,
          height: size,
          backgroundColor: '#00005b',
          border: '1.5px solid #9999ff',
          color: '#9999ff',
          fontSize: Math.round(size * 0.44),
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}
        title="Adobe After Effects"
        aria-label="Adobe After Effects icon"
      >
        Ae
      </span>
    );
  }

  if (normalized.includes('premiere')) {
    return (
      <span
        className="inline-flex items-center justify-center shrink-0 rounded-[6px] font-bold select-none shadow-sm"
        style={{
          width: size,
          height: size,
          backgroundColor: '#000055',
          border: '1.5px solid #ea77ff',
          color: '#ea77ff',
          fontSize: Math.round(size * 0.44),
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}
        title="Adobe Premiere Pro"
        aria-label="Adobe Premiere Pro icon"
      >
        Pr
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center shrink-0 rounded-[6px] bg-[#222e26] border border-[#3b4c40] text-[#cfd5ce] font-semibold text-[11px] shadow-sm select-none"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
};

export const SkillsSoftwareSection: React.FC = () => {
  const { about } = usePortfolio();
  const tools = about ? about.tools : ['Adobe Photoshop', 'Adobe Illustrator', 'Adobe InDesign', 'Figma', 'Vibe coding'];
  if (!tools.length) return null;
  return (
    <section className="home-info-section home-skills" id="skills">
      <div className="home-info-title"><p className="home-eyebrow">TOOLS &amp; SKILLS</p><h2>Skills &amp; Software</h2></div>
      <ul className="home-skills-list">
        {tools.map((skill, index) => (
          <li key={`${skill}-${index}`}>
            <span className="home-skills-number">{String(index + 1).padStart(2, '0')}</span>
            <div className="home-skills-item-content">
              <SoftwareIcon name={skill} size={28} />
              <strong>{skill}</strong>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
