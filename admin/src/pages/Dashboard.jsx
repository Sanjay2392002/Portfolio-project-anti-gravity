import React from 'react';
import { Activity, Users, Eye } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-gray-400 mt-2">Welcome back to your command center.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Views', value: '12,430', icon: <Eye className="text-indigo-400" /> },
          { label: 'Active Projects', value: '8', icon: <Activity className="text-purple-400" /> },
          { label: 'Unique Visitors', value: '3,210', icon: <Users className="text-emerald-400" /> },
        ].map((stat, i) => (
          <div key={i} className="glass-dark p-6 rounded-2xl flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
            <div className="p-4 bg-gray-800/50 rounded-xl">{stat.icon}</div>
            <div>
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
