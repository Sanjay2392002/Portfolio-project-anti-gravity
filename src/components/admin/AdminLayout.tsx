import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  BriefcaseBusiness,
  Tags,
  Image as ImageIcon,
  User,
  Settings,
  History,
  LogOut,
  ExternalLink,
  MessageSquare,
  Menu,
  X,
} from 'lucide-react';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, loading, navigate]);

  // Auto-close mobile drawer on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="text-[14px] text-[#6B6B6B] animate-pulse">Loading CMS...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Projects', path: '/admin/projects', icon: FolderKanban },
    { label: 'Selected Works', path: '/admin/selected-works', icon: BriefcaseBusiness },
    { label: 'Categories', path: '/admin/categories', icon: Tags },
    { label: 'Media Library', path: '/admin/media', icon: ImageIcon },
    { label: 'About Content', path: '/admin/about', icon: User },
    { label: 'Site Settings', path: '/admin/settings', icon: Settings },
    { label: 'Inquiries', path: '/admin/inquiries', icon: MessageSquare },
    { label: 'Activity Log', path: '/admin/activity', icon: History },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navContent = (
    <>
      <div>
        {/* Logo & Live Link */}
        <div className="flex items-center justify-between pb-6 border-b border-[#E5E5E5]">
          <div>
            <div className="text-[16px] font-bold tracking-tight uppercase text-[#111111]">SANJAY CMS</div>
            <div className="text-[12px] text-[#8A8A8A] font-mono">v2.0 · Headless</div>
          </div>
          <div className="flex items-center space-x-1">
            <Link
              to="/"
              target="_blank"
              className="p-2 rounded-[6px] hover:bg-[#F5F5F5] text-[#6B6B6B] hover:text-black transition-colors"
              title="View Public Website"
            >
              <ExternalLink size={16} />
            </Link>
            {mobileMenuOpen && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden p-2 rounded-[6px] hover:bg-[#F5F5F5] text-[#6B6B6B] hover:text-black transition-colors"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="mt-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              location.pathname === item.path ||
              (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-[8px] text-[13px] font-medium transition-colors ${
                  active
                    ? 'bg-black text-white'
                    : 'text-[#6B6B6B] hover:bg-[#F5F5F5] hover:text-[#111111]'
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Info & Logout */}
      <div className="pt-6 border-t border-[#E5E5E5]">
        <div className="text-[12px] text-[#8A8A8A] font-mono truncate mb-3">
          {user?.email}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center space-x-2 px-3 py-2 rounded-[6px] text-[13px] text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F9F9F9] text-[#111111]">
      {/* Mobile Top Header (Hidden on Desktop) */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3.5 bg-white border-b border-[#E5E5E5] shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-[6px] text-[#111111] hover:bg-[#F5F5F5] transition-colors focus:outline-none focus:ring-2 focus:ring-black"
            aria-label="Open CMS Menu"
          >
            <Menu size={20} />
          </button>
          <div>
            <div className="text-[15px] font-bold tracking-tight uppercase leading-none">SANJAY CMS</div>
            <div className="text-[11px] text-[#8A8A8A] font-mono leading-tight mt-0.5">Admin Control</div>
          </div>
        </div>
        <Link
          to="/"
          target="_blank"
          className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-[6px] bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#111111] text-[12px] font-medium transition-colors"
        >
          <span>View Site</span>
          <ExternalLink size={13} />
        </Link>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-200"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-in Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white z-50 p-5 flex flex-col justify-between shadow-2xl lg:hidden transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </aside>

      {/* Desktop Persistent Sidebar (Untouched look & feel) */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-[#E5E5E5] flex-col justify-between p-5 select-none shrink-0 sticky top-0 h-screen overflow-y-auto">
        {navContent}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8 xl:p-10">
        <div className="max-w-[1200px] mx-auto w-full min-w-0">{children}</div>
      </main>
    </div>
  );
};
