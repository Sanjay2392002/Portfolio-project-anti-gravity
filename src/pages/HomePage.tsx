import React, { useEffect } from 'react';
import { ExperienceSection, SkillsSoftwareSection } from '../components/sections/HomePortfolioSections';
import { AboutSection } from '../components/sections/AboutSection';
import { ContactSection } from '../components/sections/ContactSection';

export const HomePage: React.FC = () => {
  useEffect(() => {
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousTitle = document.title;
    const previousDescription = description?.content;
    document.title = 'Sanjay — Graphic Designer';
    if (description) {
      description.content = 'Sanjay is a Graphic Designer creating brand identities, campaigns, packaging, and digital experiences.';
    }
    return () => {
      document.title = previousTitle;
      if (description && previousDescription !== undefined) description.content = previousDescription;
    };
  }, []);

  return (
    <main className="home-page w-full bg-white">
      <AboutSection variant="home" />
      <SkillsSoftwareSection />
      <ExperienceSection />
      <ContactSection variant="home" />
    </main>
  );
};
