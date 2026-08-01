import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Activity, LayoutDashboard, FolderKanban, Eye } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    projects: 0,
    sections: 0,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projectsRes, sectionsRes] = await Promise.all([
          axiosInstance.get('/projects'),
          axiosInstance.get('/sections')
        ]);
        
        setStats({
          projects: projectsRes.data?.length || 0,
          sections: sectionsRes.data?.length || 0,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching dashboard stats', error);
        setStats(s => ({ ...s, loading: false }));
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Dashboard Overview</h1>
        <p className="text-gray-400 mt-2 text-lg">Welcome back to your command center.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Total Projects', value: stats.loading ? '...' : stats.projects, icon: <FolderKanban size={28} className="text-indigo-400" />, color: 'from-indigo-500/20 to-indigo-900/20 border-indigo-500/30' },
          { label: 'Active Sections', value: stats.loading ? '...' : stats.sections, icon: <LayoutDashboard size={28} className="text-purple-400" />, color: 'from-purple-500/20 to-purple-900/20 border-purple-500/30' },
          { label: 'Total Views (Demo)', value: '12,430', icon: <Eye size={28} className="text-emerald-400" />, color: 'from-emerald-500/20 to-emerald-900/20 border-emerald-500/30' },
        ].map((stat, i) => (
          <div key={i} className={`bg-gradient-to-br ${stat.color} p-6 rounded-3xl border flex items-center gap-5 hover:-translate-y-2 transition-all duration-300 shadow-xl group`}>
            <div className="p-4 bg-gray-950/50 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-inner">
              {stat.icon}
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-4xl font-black text-white mt-1 drop-shadow-md">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 p-8 glass-dark rounded-3xl border border-gray-800 relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px]"></div>
        <h2 className="text-2xl font-bold text-white mb-4">Quick Tips</h2>
        <ul className="space-y-3 text-gray-300">
          <li className="flex items-center gap-3">
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
            Use the <strong className="text-indigo-400">Projects</strong> tab to add new case studies to your portfolio.
          </li>
          <li className="flex items-center gap-3">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            Head over to <strong className="text-purple-400">Profile Settings</strong> to update your resume and contact info.
          </li>
          <li className="flex items-center gap-3">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            Manage which sections appear on your live site using the <strong className="text-emerald-400">Sections Configuration</strong>.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
