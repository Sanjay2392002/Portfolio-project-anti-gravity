import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Download,
  Briefcase,
  GraduationCap,
  Layers,
  Sparkles,
  Mail,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { MagneticHeroHeading } from '../components/sections/MagneticHeroHeading';
import { SoftwareIcon } from '../components/sections/HomePortfolioSections';

const metrics = [
  { value: '100+', label: 'Social Media Creatives', sub: 'Posts, stories, carousels & ad campaigns' },
  { value: '5+', label: 'Client Brands Handled', sub: 'F&B, automotive, fashion & tech' },
  { value: '30%', label: 'Turnaround Reduction', sub: 'Via AI-assisted production pipelines' },
  { value: '1+ Year', label: 'Agency Experience', sub: 'Visual Designer at Bevis, Coimbatore' },
];

const featuredBrands = [
  { name: 'Kings Coffee & Chai', role: 'Brand Identity, Social Media & Packaging' },
  { name: 'Inthira Foods', role: 'Commercial Campaigns & Offline Print Collateral' },
  { name: 'T-Car Wash', role: 'Identity Design & Performance Social Creatives' },
  { name: 'V-Make Design', role: 'Visual Identity, Presentations & Editorial' },
  { name: 'The Souled Store', role: 'Digital Ad Campaigns & Creative Posters' },
  { name: 'Bevis Creatives', role: 'Brand Collateral, Packaging & Stall Architecture' },
];

export const AboutPage: React.FC = () => {
  const { about, settings } = usePortfolio();

  useEffect(() => {
    window.scrollTo(0, 0);
    const previousTitle = document.title;
    document.title = 'About Sanjay — Visual & Graphic Designer';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const headline = about?.headline || 'Visual & Graphic Designer bridging engineering logic and modern brand craft.';
  const subheadline = about?.subheadline || 'Crafting high-converting social media creatives, brand identities, packaging, and digital interfaces.';
  const bio1 = about?.biography_paragraph_1 || 'I am a Visual & Graphic Designer based in Coimbatore with a background in Computer Science Engineering (B.E. from Sri Krishna College of Technology). I combine structured thinking and technical agility with visual design to create impactful brand identities, commercial campaigns, and user interfaces.';
  const bio2 = about?.biography_paragraph_2 || 'At Bevis, I have designed 100+ social media creatives, ad campaigns, packaging labels, and exhibition stalls for 5+ diverse brands including Kings Coffee, Inthira Foods, T-Car Wash, and V-Make. I also pioneer AI-assisted workflows (Adobe Firefly, Seedream, ChatGPT, Gemini), reducing turnaround by 30% while delivering high-quality commercial visuals, e-commerce jewellery assets, and professional photo retouching.';

  const experiences = about?.experiences?.length ? about.experiences : [
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
  ];

  const capabilities = about?.capabilities?.length ? about.capabilities : [
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
  ];

  const tools = about?.tools?.length ? about.tools : [
    'Adobe Photoshop',
    'Adobe Illustrator',
    'Adobe InDesign',
    'Figma',
    'Adobe Firefly',
    'Seedream',
    'Vibe coding',
  ];

  return (
    <main className="w-full bg-[#fdfdfc] text-[#111111] selection:bg-[#111111] selection:text-white pb-24">
      {/* 1. HERO SECTION */}
      <section className="relative px-5 sm:px-8 md:px-12 lg:px-20 pt-16 md:pt-24 pb-16 max-w-[1240px] mx-auto">
        <div className="flex flex-col items-start max-w-[960px]">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#e5e5df] bg-white text-[11px] font-semibold tracking-[0.16em] uppercase text-[#5a625a] mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
            Visual &amp; Graphic Designer
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full mb-6"
          >
            <MagneticHeroHeading />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[26px] sm:text-[34px] md:text-[42px] font-semibold text-[#18251f] tracking-tight leading-[1.18] mb-6"
          >
            {headline}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-4 text-[16px] sm:text-[18px] text-[#555d55] leading-[1.75] font-normal max-w-[860px]"
          >
            <p>{bio1}</p>
            <p>{bio2}</p>
            <p>
              I believe great design is not just visual decoration—it is clarity, communication, and strategy. Whether designing an eye-catching campaign ad, engineering structural retail packaging, or laying out a clean digital interface, my goal is to deliver visuals that resonate and perform.
            </p>
          </motion.div>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center gap-3.5 mt-8 pt-2"
          >
            <a
              href="/Sanjay_M_Resume.pdf"
              download="Sanjay_M_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#18251f] text-white text-[13px] font-semibold tracking-wider uppercase hover:bg-black transition-all shadow-sm hover:shadow-md"
            >
              <Download size={15} strokeWidth={2.2} />
              <span>Download CV</span>
            </a>

            <Link
              to="/work"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-[#d6d9d2] bg-white text-[#18251f] text-[13px] font-semibold tracking-wider uppercase hover:border-[#18251f] hover:bg-[#fafaf8] transition-all"
            >
              <span>Selected Works</span>
              <ArrowUpRight size={15} strokeWidth={2.2} />
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-[#d6d9d2] bg-white text-[#18251f] text-[13px] font-semibold tracking-wider uppercase hover:border-[#18251f] hover:bg-[#fafaf8] transition-all"
            >
              <Mail size={15} strokeWidth={2.2} />
              <span>Get In Touch</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. KEY METRICS HIGHLIGHTS */}
      <section className="px-5 sm:px-8 md:px-12 lg:px-20 max-w-[1240px] mx-auto py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 sm:p-8 rounded-[20px] bg-[#f4f5f1] border border-[#e5e7e1]">
          {metrics.map((metric, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="text-[32px] sm:text-[40px] font-bold tracking-tight text-[#18251f] leading-none mb-1">
                {metric.value}
              </span>
              <span className="text-[13px] sm:text-[14px] font-semibold text-[#2c3630]">
                {metric.label}
              </span>
              <span className="text-[11px] sm:text-[12px] text-[#6d756d] mt-1 leading-snug">
                {metric.sub}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. EXPERIENCE SECTION */}
      <section className="px-5 sm:px-8 md:px-12 lg:px-20 max-w-[1240px] mx-auto pt-16 pb-12">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b756b] mb-3">
          <Briefcase size={14} />
          <span>Work Experience</span>
        </div>
        <h2 className="text-[28px] sm:text-[36px] font-bold text-[#18251f] tracking-tight mb-8">
          Professional Track Record
        </h2>

        <div className="space-y-6">
          {experiences.map((exp, idx) => (
            <div
              key={exp.id || idx}
              className="p-6 sm:p-8 rounded-[18px] bg-white border border-[#e5e8e2] hover:border-[#cfd5cb] transition-colors shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-[20px] sm:text-[22px] font-bold text-[#18251f]">
                    {exp.role}
                  </h3>
                  <span className="text-[#888] font-normal">at</span>
                  <span className="text-[16px] sm:text-[18px] font-semibold text-[#3b4c40]">
                    {exp.company}
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#7a847a] bg-[#f5f6f3] px-3 py-1 rounded-full self-start sm:self-auto">
                  <Calendar size={12} />
                  <span>{exp.period}</span>
                </div>
              </div>

              <p className="text-[15px] sm:text-[16px] text-[#555e55] leading-[1.7] mb-4">
                {exp.description}
              </p>

              {idx === 0 && (
                <div className="pt-3 border-t border-[#f0f2ed] grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px] text-[#4d574d]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#2e7d32] shrink-0" />
                    <span>Designed 100+ social media creatives across 5+ client brands</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#2e7d32] shrink-0" />
                    <span>Engineered packaging labels, carton boxes &amp; exhibition stalls</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#2e7d32] shrink-0" />
                    <span>Integrated AI tools cutting turnaround by 30% with high fidelity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#2e7d32] shrink-0" />
                    <span>Advanced product photo retouching &amp; AI jewellery visuals</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 4. EDUCATION & ENGINEERING BACKGROUND */}
      <section className="px-5 sm:px-8 md:px-12 lg:px-20 max-w-[1240px] mx-auto py-10">
        <div className="p-6 sm:p-8 rounded-[18px] bg-gradient-to-br from-[#f8f9f6] to-[#f2f4ee] border border-[#e2e6de]">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b756b] mb-2">
            <GraduationCap size={15} />
            <span>Education &amp; Background</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-3">
            <h3 className="text-[20px] sm:text-[22px] font-bold text-[#18251f]">
              B.E. in Computer Science and Engineering
            </h3>
            <span className="text-[13px] font-medium text-[#7a847a]">
              2020 – 2024 · CGPA 7.2
            </span>
          </div>
          <p className="text-[14px] font-semibold text-[#425045] mb-2">
            Sri Krishna College of Technology, Coimbatore
          </p>
          <p className="text-[14px] sm:text-[15px] text-[#555e55] leading-[1.7] max-w-[880px]">
            My background in Computer Science Engineering gives me a distinctive edge in the visual design landscape. It allows me to approach visual problems with systematic logic—treating typography, grids, and design tokens like modular architectures, understanding technical constraints, and seamlessly communicating with digital developers and technical founders.
          </p>
        </div>
      </section>

      {/* 5. DESIGN DISCIPLINES & CAPABILITIES */}
      <section className="px-5 sm:px-8 md:px-12 lg:px-20 max-w-[1240px] mx-auto py-12">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b756b] mb-3">
          <Layers size={14} />
          <span>Core Capabilities</span>
        </div>
        <h2 className="text-[28px] sm:text-[36px] font-bold text-[#18251f] tracking-tight mb-8">
          Design Disciplines &amp; Expertise
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {capabilities.map((group, idx) => (
            <div
              key={idx}
              className="p-6 rounded-[16px] bg-white border border-[#e4e7e1] hover:border-[#ccd3c7] transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-bold text-[#8a948a] tracking-widest uppercase mb-2 block">
                  0{idx + 1}
                </span>
                <h3 className="text-[17px] font-bold text-[#18251f] mb-3">
                  {group.category}
                </h3>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {group.skills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="inline-block px-2.5 py-1 rounded-md bg-[#f4f5f1] text-[#3d473e] text-[12px] font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. TOOLS & SOFTWARE */}
      <section className="px-5 sm:px-8 md:px-12 lg:px-20 max-w-[1240px] mx-auto py-12">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b756b] mb-3">
          <Sparkles size={14} />
          <span>Tech &amp; Creative Stack</span>
        </div>
        <h2 className="text-[28px] sm:text-[36px] font-bold text-[#18251f] tracking-tight mb-6">
          Tools &amp; Software
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {tools.map((tool, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center p-4 rounded-[14px] bg-white border border-[#e4e7e1] hover:border-[#c5cdc0] transition-all text-center gap-2.5 shadow-sm"
            >
              <SoftwareIcon name={tool} size={36} />
              <span className="text-[13px] font-semibold text-[#18251f] leading-snug">
                {tool}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 7. CLIENT BRANDS WORKED WITH */}
      <section className="px-5 sm:px-8 md:px-12 lg:px-20 max-w-[1240px] mx-auto py-12">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b756b] mb-3">
          <Building2 size={14} />
          <span>Brands &amp; Collaborations</span>
        </div>
        <h2 className="text-[28px] sm:text-[36px] font-bold text-[#18251f] tracking-tight mb-6">
          Brands I Have Created For
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredBrands.map((b, idx) => (
            <div
              key={idx}
              className="p-5 rounded-[14px] bg-white border border-[#e4e7e1] hover:border-[#cfd5cb] transition-colors"
            >
              <h3 className="text-[17px] font-bold text-[#18251f] mb-1">
                {b.name}
              </h3>
              <p className="text-[13px] text-[#6a7269]">
                {b.role}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. CALL TO ACTION BANNER */}
      <section className="px-5 sm:px-8 md:px-12 lg:px-20 max-w-[1240px] mx-auto pt-8">
        <div className="p-8 sm:p-12 rounded-[22px] bg-[#18251f] text-white flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="max-w-[620px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9cb1a4] mb-2">
              Let&apos;s Build Together
            </p>
            <h2 className="text-[28px] sm:text-[36px] font-bold tracking-tight mb-3">
              Have a project in mind or looking for a visual designer?
            </h2>
            <p className="text-[14px] sm:text-[15px] text-[#c2cbc4] leading-[1.6]">
              {about?.availability || 'Available for freelance commissions, brand partnerships, and full-time visual design roles.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white text-[#18251f] text-[13px] font-bold tracking-wider uppercase hover:bg-[#eceee9] transition-all"
            >
              <span>Get In Touch</span>
              <ArrowRight size={15} strokeWidth={2.2} />
            </Link>

            <a
              href="mailto:sanjaymurugesan23@gmail.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-[#3f5347] bg-[#21332a] text-white text-[13px] font-medium tracking-wider uppercase hover:bg-[#283e33] transition-all"
            >
              <Mail size={15} />
              <span>Email Sanjay</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};
