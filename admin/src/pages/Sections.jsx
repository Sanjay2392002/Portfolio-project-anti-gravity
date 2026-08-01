import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { GripVertical, LayoutDashboard, Eye, EyeOff } from 'lucide-react';

const Sections = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSections();
  }, []);
  
  const fetchSections = async () => {
    try {
        const { data } = await axiosInstance.get('/sections');
        setSections(data || []);
    } catch (error) {
        console.error('Error fetching sections:', error);
    } finally {
        setLoading(false);
    }
  }

  const toggleVisibility = async (id, currentHidden) => {
    const updated = sections.map(s => s._id === id ? { ...s, isHidden: !currentHidden } : s);
    setSections(updated);
    try {
      await axiosInstance.put(`/sections/${id}`, { isHidden: !currentHidden });
    } catch (e) {
      console.error(e);
      // Revert on error
      setSections(sections);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Sections Configuration</h1>
        <p className="text-gray-400 mt-2">Manage the visibility of sections on your public portfolio.</p>
      </header>

      <div className="glass-dark p-8 rounded-3xl border border-gray-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <LayoutDashboard size={160} />
        </div>
        
        <div className="space-y-4 relative z-10">
          {sections.sort((a, b) => a.order - b.order).map((section) => (
            <div key={section._id} className="bg-gray-900/50 p-5 rounded-2xl flex items-center justify-between group hover:border-indigo-500/50 border border-gray-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-center gap-5">
                <div className="p-3 bg-gray-800/50 text-gray-500 rounded-xl group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                  <GripVertical size={22} />
                </div>
                <div>
                  <span className="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors">{section.name}</span>
                  <p className="text-gray-500 text-sm mt-0.5">{section.isHidden ? 'Currently hidden from visitors' : 'Visible on live site'}</p>
                </div>
              </div>
              
              <button 
                onClick={() => toggleVisibility(section._id, section.isHidden)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-md transform hover:scale-105 active:scale-95 ${
                  !section.isHidden 
                    ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:from-emerald-500/30 hover:to-emerald-600/30' 
                    : 'bg-gradient-to-r from-gray-700/50 to-gray-800/50 text-gray-400 border border-gray-600 hover:from-gray-600 hover:to-gray-700 hover:text-white'
                }`}
              >
                {!section.isHidden ? <><Eye size={16} /> Visible</> : <><EyeOff size={16} /> Hidden</>}
              </button>
            </div>
          ))}
          
          {sections.length === 0 && (
            <div className="text-center py-10 text-gray-500">
                No sections found. Make sure the database is seeded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sections;
