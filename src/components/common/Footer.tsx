import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePortfolio } from '../../context/PortfolioContext';

export const Footer: React.FC = () => {
  const { settings } = usePortfolio();
  const siteName = settings?.site_name || 'SANJAY';
  const location = useLocation();
  const isHome = location.pathname === '/';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isHome) {
    return (
      <footer className="home-footer">
        <div className="home-footer-main">
          <div className="home-footer-brand"><strong>{siteName}</strong><span>Visual Designer</span></div>
          <nav aria-label="Footer navigation">
            <a href="#about">ABOUT</a>
            <a href="#contact">CONTACT</a>
          </nav>
          <div className="home-footer-socials">
            <a href={`mailto:${settings?.email || 'sanjaymurugesan23@gmail.com'}`}>EMAIL</a>
            <a href={`tel:${(settings?.phone || '+91 7010948452').replace(/\s+/g, '')}`}>PHONE</a>
            <a href={settings?.linkedin_url || 'https://www.linkedin.com/in/sanjaym23'} target="_blank" rel="noopener noreferrer">LINKEDIN ↗</a>
            <a href={settings?.behance_url || 'https://www.behance.net/sanjayuiuxgd'} target="_blank" rel="noopener noreferrer">BEHANCE ↗</a>
          </div>
        </div>
        <div className="home-footer-bottom">
          <span>{settings?.footer_text || '© 2026 SANJAY. All rights reserved.'}</span>
          <button type="button" onClick={scrollToTop}>BACK TO TOP ↑</button>
        </div>
      </footer>
    );
  }

  return (
    <footer className="w-full bg-white border-t border-[#E5E5E5] py-12 md:py-16 text-[#6B6B6B]">
      <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-[#E5E5E5]">
          {/* Brand */}
          <div>
            <div className="text-[15px] font-semibold tracking-tight text-[#111111] uppercase">
              {siteName}
            </div>
            <div className="text-[13px] text-[#8A8A8A] mt-1">
              Graphic Designer
            </div>
          </div>

          {/* Internal Navigation Links */}
          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-[13px] font-medium tracking-tight">
            <Link to="/work" className="text-[#6B6B6B] hover:text-[#111111] transition-colors">
              WORK
            </Link>
            <Link to="/about" className="text-[#6B6B6B] hover:text-[#111111] transition-colors">
              ABOUT
            </Link>
            <Link to="/contact" className="text-[#6B6B6B] hover:text-[#111111] transition-colors">
              CONTACT
            </Link>
            <Link to="/admin/login" className="text-[#8A8A8A] hover:text-[#111111] transition-colors">
              CMS ADMIN
            </Link>
          </nav>

          {/* Social Links & Direct Contact */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-medium text-[#8A8A8A]">
            <a
              href={`mailto:${settings?.email || 'sanjaymurugesan23@gmail.com'}`}
              className="hover:text-[#111111] transition-colors"
            >
              EMAIL
            </a>
            <a
              href={`tel:${(settings?.phone || '+91 7010948452').replace(/\s+/g, '')}`}
              className="hover:text-[#111111] transition-colors"
            >
              {settings?.phone || '+91 7010948452'}
            </a>
            <a
              href={settings?.behance_url || 'https://www.behance.net/sanjayuiuxgd'}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#111111] transition-colors"
            >
              BEHANCE
            </a>
            <a
              href={settings?.linkedin_url || 'https://www.linkedin.com/in/sanjaym23'}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#111111] transition-colors"
            >
              LINKEDIN
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex items-center justify-between text-[12px] text-[#8A8A8A]">
          <div>{settings?.footer_text || '© 2026 SANJAY. All rights reserved.'}</div>
          <button
            type="button"
            onClick={scrollToTop}
            className="hover:text-[#111111] transition-colors uppercase tracking-wider font-medium inline-flex items-center space-x-1"
          >
            <span>BACK TO TOP</span>
            <span>↑</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
