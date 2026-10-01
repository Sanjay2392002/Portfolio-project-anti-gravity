export interface SiteSettings {
  site_name: string;
  hero_eyebrow: string;
  hero_headline: string;
  hero_description: string;
  email: string;
  phone?: string;
  linkedin_url: string;
  behance_url: string;
  resume_url: string;
  availability: string;
  footer_text: string;
  seo_title: string;
  seo_description: string;
  og_image: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  period: string;
  description?: string;
}

export interface CapabilityGroup {
  category: string;
  skills: string[];
}

export interface AboutContent {
  headline: string;
  subheadline: string;
  biography_paragraph_1: string;
  biography_paragraph_2: string;
  experiences: ExperienceItem[];
  capabilities: CapabilityGroup[];
  tools: string[];
  availability: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  created_at: string;
}
