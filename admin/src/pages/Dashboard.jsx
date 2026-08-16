import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { FolderKanban, Star, Tag, Code, Mail, ArrowRight, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [data, setData] = useState({
    projectsCount: 0,
    featuredCount: 0,
    categoriesCount: 0,
    servicesCount: 0,
    recentInquiries: [],
    loading: true
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [projectsRes, categoriesRes, servicesRes, submissionsRes] = await Promise.all([
        axiosInstance.get('/projects').catch(() => ({ data: [] })),
        axiosInstance.get('/categories').catch(() => ({ data: [] })),
        axiosInstance.get('/services').catch(() => ({ data: [] })),
        axiosInstance.get('/submissions').catch(() => ({ data: [] }))
      ]);

      const projects = projectsRes.data || [];
      const featured = projects.filter(p => p.isFeatured);

      setData({
        projectsCount: projects.length,
        featuredCount: featured.length,
        categoriesCount: categoriesRes.data?.length || 0,
        servicesCount: servicesRes.data?.length || 0,
        recentInquiries: (submissionsRes.data || []).slice(0, 4),
        loading: false
      });
    } catch (error) {
      console.error('Failed to load dashboard data', error);
      setData(d => ({ ...d, loading: false }));
    }
  };

  if (data.loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-6xl">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          CMS Overview
        </h1>
        <p className="text-gray-400 mt-2">Welcome to your portfolio command center.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Projects', value: data.projectsCount, icon: <FolderKanban size={22} className="text-indigo-400" />, link: '/projects' },
          { label: 'Featured Projects', value: data.featuredCount, icon: <Star size={22} className="text-amber-400" />, link: '/projects' },
          { label: 'Categories', value: data.categoriesCount, icon: <Tag size={22} className="text-emerald-400" />, link: '/categories' },
          { label: 'Services', value: data.servicesCount, icon: <Code size={22} className="text-pink-400" />, link: '/services' }
        ].map((card, idx) => (
          <Link key={idx} to={card.link} className="glass-dark p-6 rounded-2xl border border-gray-800 flex items-center justify-between hover:border-indigo-500/30 transition-all group">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{card.label}</span>
              <h3 className="text-3xl font-bold text-white group-hover:text-indigo-400 transition-colors">{card.value}</h3>
            </div>
            <div className="p-3 bg-gray-950/60 rounded-xl border border-gray-900">
              {card.icon}
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Submissions */}
        <div className="lg:col-span-2 glass-dark p-6 rounded-2xl border border-gray-800 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="text-indigo-400" size={18} />
              Recent Inquiries
            </h2>
            <Link to="/submissions" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold uppercase tracking-wider flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-3">
            {data.recentInquiries.length === 0 ? (
              <p className="text-gray-400 text-sm py-4">No recent inquiries received.</p>
            ) : (
              data.recentInquiries.map((inq) => (
                <div key={inq._id} className="p-4 bg-gray-950/40 border border-gray-900 rounded-xl space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-white text-sm">{inq.name}</span>
                    <span className="text-gray-500 text-[10px]">{new Date(inq.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="block text-indigo-300 text-xs font-mono">{inq.email}</span>
                  {inq.category && (
                    <span className="inline-block mt-1 text-[9px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                      {inq.category}
                    </span>
                  )}
                  <p className="text-gray-400 text-xs mt-2 line-clamp-1">{inq.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Config Tips */}
        <div className="glass-dark p-6 rounded-2xl border border-gray-800 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserCheck className="text-purple-400" size={18} />
            CMS Shortcuts
          </h2>
          
          <div className="flex flex-col gap-2">
            {[
              { label: 'Edit Profile Settings', desc: 'Configure bio statements and portrait visuals.', to: '/profile' },
              { label: 'Configure Sections', desc: 'Enable or hide specific frontpage grids.', to: '/sections' },
              { label: 'Adjust Branding Logo', desc: 'Change typography and logo elements.', to: '/settings' }
            ].map((tip, idx) => (
              <Link key={idx} to={tip.to} className="p-4 bg-gray-950/40 hover:bg-gray-950/80 border border-gray-900 hover:border-gray-800 rounded-xl space-y-1 text-left transition-all">
                <span className="font-semibold text-white text-sm block">{tip.label}</span>
                <p className="text-gray-500 text-xs">{tip.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
