import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';

export const Navbar: React.FC = () => {
  const { settings } = usePortfolio();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const siteName = settings?.site_name || 'SANJAY';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-[20px] border-b border-[#E5E5E5]'
          : 'bg-white/95 backdrop-blur-[12px] border-b border-[#E5E5E5]/60'
      }`}
      style={{ height: '68px' }}
    >
      <div className="max-w-[1440px] mx-auto h-full px-5 md:px-8 lg:px-12 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <Link
          to="/"
          className="text-[14px] font-semibold tracking-[-0.02em] text-[#111111] hover:opacity-70 transition-opacity"
        >
          {siteName}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-[14px] font-medium tracking-[-0.01em]">
          {location.pathname === '/' ? (
            <>
              <Link to="/work" className="transition-colors duration-200 text-[#6B6B6B] hover:text-[#111111]">MY WORKS</Link>
              <a href="#about" className="transition-colors duration-200 text-[#6B6B6B] hover:text-[#111111]">ABOUT</a>
              <a href="#contact" className="transition-colors duration-200 text-[#6B6B6B] hover:text-[#111111]">CONTACT</a>
            </>
          ) : (
            <>
              <Link to="/" className="transition-colors duration-200 text-[#6B6B6B] hover:text-[#111111]">HOME</Link>
              <Link to="/work" className={`transition-colors duration-200 ${location.pathname === '/work' ? 'text-[#111111] font-semibold' : 'text-[#6B6B6B] hover:text-[#111111]'}`}>MY WORKS</Link>
              <Link to="/about" className={`transition-colors duration-200 ${location.pathname === '/about' ? 'text-[#111111] font-semibold' : 'text-[#6B6B6B] hover:text-[#111111]'}`}>ABOUT</Link>
              <Link to="/contact" className={`transition-colors duration-200 ${location.pathname === '/contact' ? 'text-[#111111] font-semibold' : 'text-[#6B6B6B] hover:text-[#111111]'}`}>CONTACT</Link>
            </>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#111111] hover:opacity-70 focus:outline-none"
          aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden absolute top-[68px] left-0 w-full bg-white/95 backdrop-blur-[20px] border-b border-[#E5E5E5] px-6 py-6 shadow-sm"
          >
            <nav className="flex flex-col space-y-5 text-[15px] font-medium tracking-[-0.01em]">
              {location.pathname === '/' ? (
                <>
                  <Link to="/work" className="text-[#6B6B6B] hover:text-[#111111] transition-colors" onClick={() => setMobileMenuOpen(false)}>MY WORKS</Link>
                  <a href="#about" className="text-[#6B6B6B] hover:text-[#111111] transition-colors" onClick={() => setMobileMenuOpen(false)}>ABOUT</a>
                  <a href="#contact" className="text-[#6B6B6B] hover:text-[#111111] transition-colors" onClick={() => setMobileMenuOpen(false)}>CONTACT</a>
                </>
              ) : (
                <>
                  <Link to="/" className="text-[#6B6B6B] hover:text-[#111111] transition-colors" onClick={() => setMobileMenuOpen(false)}>HOME</Link>
                  <Link to="/work" className="text-[#6B6B6B] hover:text-[#111111] transition-colors" onClick={() => setMobileMenuOpen(false)}>MY WORKS</Link>
                  <Link to="/about" className="text-[#6B6B6B] hover:text-[#111111] transition-colors" onClick={() => setMobileMenuOpen(false)}>ABOUT</Link>
                  <Link to="/contact" className="text-[#6B6B6B] hover:text-[#111111] transition-colors" onClick={() => setMobileMenuOpen(false)}>CONTACT</Link>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
