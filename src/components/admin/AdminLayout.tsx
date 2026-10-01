import React from 'react';
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
} from 'lucide-react';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, loading, navigate]);

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
    { label: 'My Works', path: '/admin/selected-works', icon: BriefcaseBusiness },
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

  return (
    <div className="min-h-screen flex bg-[#F9F9F9] text-[#111111]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E5E5E5] flex flex-col justify-between p-5 select-none">
        <div>
          {/* Logo & Live Link */}
          <div className="flex items-center justify-between pb-6 border-b border-[#E5E5E5]">
            <div>
              <div className="text-[16px] font-bold tracking-tight uppercase">SANJAY CMS</div>
              <div className="text-[12px] text-[#8A8A8A] font-mono">v2.0 · Headless</div>
            </div>
            <Link
              to="/"
              target="_blank"
              className="p-1.5 rounded-[6px] hover:bg-[#F5F5F5] text-[#6B6B6B] hover:text-black transition-colors"
              title="View Public Website"
            >
              <ExternalLink size={16} />
            </Link>
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
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-[6px] text-[13px] text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-h-screen p-8 lg:p-10">
        <div className="max-w-[1200px] mx-auto">{children}</div>
      </main>
    </div>
  );
};
