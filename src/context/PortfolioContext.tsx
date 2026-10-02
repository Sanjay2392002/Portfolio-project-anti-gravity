import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, ProjectCategory } from '../types/project';
import { SiteSettings, AboutContent } from '../types/settings';
import { fallbackProjects, fallbackCategories, fallbackContentBlocks, fallbackSettings } from '../data/portfolioData';

interface PortfolioContextType {
  projects: Project[];
  categories: ProjectCategory[];
  settings: SiteSettings | null;
  about: AboutContent | null;
  loading: boolean;
  error: string | null;
  activeCategory: string | null;
  setActiveCategory: (cat: string | null) => void;
  refreshPortfolio: () => Promise<void>;
  getProjectBySlug: (slug: string) => Promise<Project | null>;
  activeLightboxImage: { url: string; caption?: string } | null;
  openLightbox: (url: string, caption?: string) => void;
  closeLightbox: () => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

const fallbackAbout: AboutContent = {
  headline: 'Visual & Graphic Designer bridging engineering logic and modern brand craft.',
  subheadline: 'Crafting high-converting social media creatives, brand identities, packaging, and digital interfaces.',
  biography_paragraph_1: 'I am a Visual & Graphic Designer based in Coimbatore with a background in Computer Science Engineering (B.E. from Sri Krishna College of Technology). I combine structured thinking and technical agility with visual design to create impactful brand identities, commercial campaigns, and user interfaces.',
  biography_paragraph_2: 'At Bevis, I have designed 100+ social media creatives, ad campaigns, packaging labels, and exhibition stalls for 5+ diverse brands including Kings Coffee, Inthira Foods, T-Car Wash, and V-Make. I also pioneer AI-assisted workflows (Adobe Firefly, Seedream, ChatGPT, Gemini), reducing turnaround by 30% while delivering high-quality commercial visuals, e-commerce jewellery assets, and professional photo retouching.',
  experiences: [
    {
      id: 'exp_1',
      role: 'Visual Designer',
      company: 'Bevis, Coimbatore',
      period: 'April 2025 – Present',
      description: 'Designed 100+ social media creatives, ad campaigns, and packaging labels across 5+ brands. Spearheaded AI-assisted design workflows cutting production time by 30% while maintaining strict brand consistency.',
    },
    {
      id: 'exp_2',
      role: 'Visual Designer & Creative Builder',
      company: 'Independent Practice',
      period: '2024 – Present',
      description: 'Creating comprehensive brand identities, digital product screens, user interfaces, design systems, and AI-driven visual explorations for growing businesses.',
    },
  ],
  capabilities: [
    {
      category: 'SOCIAL MEDIA & CAMPAIGNS',
      skills: ['Posters & Ads', 'Stories', 'Carousels', 'Thumbnails', 'Campaign Identity', 'Performance Creatives'],
    },
    {
      category: 'PACKAGING & PRINT',
      skills: ['Packaging Labels', 'Box Packaging', 'Billboards & Signage', 'Stall Architecture', 'Print Collateral'],
    },
    {
      category: 'BRAND IDENTITY',
      skills: ['Logo Presentations', 'Typography Systems', 'Color Theory', 'Brand Guidelines', 'Editorial Layout'],
    },
    {
      category: 'DIGITAL & UI DESIGN',
      skills: ['User Interfaces', 'Layout & Hierarchy', 'Digital Product Screens', 'Design Systems', 'Responsive Web'],
    },
    {
      category: 'AI PRODUCTION & RETOUCHING',
      skills: ['AI Prompt Engineering', 'Generative Visuals', 'Jewellery Visuals', 'Photo Retouching', 'Adobe Firefly & Seedream'],
    },
  ],
  tools: [
    'Adobe Photoshop',
    'Adobe Illustrator',
    'Adobe InDesign',
    'Figma',
    'Adobe Firefly',
    'Seedream',
    'Vibe coding',
  ],
  availability: 'Available for freelance commissions, brand partnerships, and full-time visual design roles.',
};

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(fallbackSettings);
  const [about, setAbout] = useState<AboutContent | null>(fallbackAbout);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeLightboxImage, setActiveLightboxImage] = useState<{ url: string; caption?: string } | null>(null);

  const fetchPublicData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [projectsRes, categoriesRes, settingsRes, aboutRes] = await Promise.all([
        fetch('/api/projects', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({ success: false })),
        fetch('/api/categories', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({ success: false })),
        fetch('/api/settings/public', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({ success: false })),
        fetch('/api/about', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({ success: false })),
      ]);

      if (projectsRes && projectsRes.success && Array.isArray(projectsRes.data)) {
        setProjects(projectsRes.data);
      } else if (projects.length === 0) {
        // Fallback only if request failed completely on initial load
        setProjects(fallbackProjects);
      }

      if (categoriesRes && categoriesRes.success && Array.isArray(categoriesRes.data)) {
        setCategories(categoriesRes.data);
      } else if (categories.length === 0) {
        setCategories(fallbackCategories);
      }

      if (settingsRes && settingsRes.success && settingsRes.data) {
        setSettings(settingsRes.data);
      } else if (!settings) {
        setSettings(fallbackSettings);
      }

      if (aboutRes && aboutRes.success && aboutRes.data) {
        setAbout(aboutRes.data);
      } else if (!about) {
        setAbout(fallbackAbout);
      }
    } catch (err: any) {
      console.warn('[PortfolioContext] Failed to fetch live data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicData();

    // Re-fetch live data whenever window gains focus (e.g. returning from CMS)
    const handleFocus = () => {
      fetchPublicData();
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const getProjectBySlug = async (slug: string): Promise<Project | null> => {
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(slug)}`, { cache: 'no-store' });
      if (res.status === 404) {
        return null;
      }
      const data = await res.json().catch(() => null);
      if (data && data.success && data.data) {
        return data.data;
      }
      return null;
    } catch (err) {
      console.warn('[PortfolioContext] API fetch error:', err);
      return null;
    }
  };

  const openLightbox = (url: string, caption?: string) => {
    setActiveLightboxImage({ url, caption });
  };

  const closeLightbox = () => {
    setActiveLightboxImage(null);
  };

  return (
    <PortfolioContext.Provider
      value={{
        projects,
        categories,
        settings,
        about,
        loading,
        error,
        activeCategory,
        setActiveCategory,
        refreshPortfolio: fetchPublicData,
        getProjectBySlug,
        activeLightboxImage,
        openLightbox,
        closeLightbox,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
