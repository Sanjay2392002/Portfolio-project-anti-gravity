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
  headline: 'Hello, I’m Sanjay.',
  subheadline: 'Graphic designer focused on social media posters, packaging design, and UI design.',
  biography_paragraph_1: 'I create social media posters and clear user interfaces for brands and digital products.',
  biography_paragraph_2: 'My work focuses on strong layout, clear typography, and making each message easy to understand.',
  experiences: [
    {
      id: 'exp_1',
      role: 'Graphic Designer',
      company: 'Bevis Creatives',
      period: 'April 2025 to August 2026',
      description: 'At Bevis Creatives, I learnt and specialized in Graphic Design, Package Design, and Print Design, along with social media posters, ad campaigns, and brand collateral.',
    },
  ],
  capabilities: [
    {
      category: 'DESIGN DISCIPLINES',
      skills: ['Graphic design', 'Package design', 'Print design', 'Social media posters', 'Stories', 'Carousels', 'Thumbnails'],
    },
    {
      category: 'UI DESIGN',
      skills: ['User interfaces', 'Layout & hierarchy', 'Digital product screens'],
    },
  ],
  tools: ['Adobe Photoshop', 'Adobe Illustrator', 'Adobe InDesign', 'Figma', 'Vibe coding'],
  availability: 'Available for design work.',
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
        fetch('/api/projects').then((r) => r.json()).catch(() => ({ success: false })),
        fetch('/api/categories').then((r) => r.json()).catch(() => ({ success: false })),
        fetch('/api/settings/public').then((r) => r.json()).catch(() => ({ success: false })),
        fetch('/api/about').then((r) => r.json()).catch(() => ({ success: false })),
      ]);

      if (projectsRes && projectsRes.success && Array.isArray(projectsRes.data) && projectsRes.data.length > 0) {
        setProjects(projectsRes.data);
      } else {
        // Fallback to rich curated projects
        setProjects(fallbackProjects);
      }

      if (categoriesRes && categoriesRes.success && Array.isArray(categoriesRes.data) && categoriesRes.data.length > 0) {
        setCategories(categoriesRes.data);
      } else {
        setCategories(fallbackCategories);
      }

      if (settingsRes && settingsRes.success && settingsRes.data) {
        setSettings(settingsRes.data);
      } else {
        setSettings(fallbackSettings);
      }

      if (aboutRes && aboutRes.success && aboutRes.data) {
        setAbout(aboutRes.data);
      } else {
        setAbout(fallbackAbout);
      }
    } catch (err: any) {
      console.warn('[PortfolioContext] Using offline curated fallback data:', err);
      setProjects(fallbackProjects);
      setCategories(fallbackCategories);
      setAbout(fallbackAbout);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicData();
  }, []);

  const getProjectBySlug = async (slug: string): Promise<Project | null> => {
    try {
      const res = await fetch(`/api/projects/${slug}`);
      const data = await res.json();
      if (data && data.success && data.data) {
        return data.data;
      }
    } catch (err) {
      console.warn('[PortfolioContext] API fetch error, looking up in curated fallback:', err);
    }

    // Fallback lookup
    const found = fallbackProjects.find((p) => p.slug === slug);
    if (found) {
      const blocks = fallbackContentBlocks
        .filter((b) => b.project_id === found.id)
        .sort((a, b) => a.sort_order - b.sort_order);
      const cat = fallbackCategories.find((c) => c.id === found.category_id);
      return {
        ...found,
        category_name: cat?.name || 'Design',
        category_slug: cat?.slug || 'design',
        blocks,
      };
    }
    return null;
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
