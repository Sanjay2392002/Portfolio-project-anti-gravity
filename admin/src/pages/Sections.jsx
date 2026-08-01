import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { GripVertical } from 'lucide-react';

const Sections = () => {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    fetchSections();
  }, []);
  
  const fetchSections = async () => {
    try {
        const { data } = await axiosInstance.get('/sections');
        setSections(data || []);
    } catch (error) {
        console.error('Error fetching sections:', error);
    }
  }

  const toggleVisibility = async (id, currentHidden) => {
    const updated = sections.map(s => s._id === id ? { ...s, isHidden: !currentHidden } : s);
    setSections(updated);
    try {
      await axiosInstance.put(`/sections/${id}`, { isHidden: !currentHidden });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Sections Configuration</h1>
        <p className="text-gray-400 mt-2">Reorder and toggle visibility of homepage sections.</p>
      </header>

      <div className="space-y-3">
        {sections.sort((a, b) => a.order - b.order).map((section) => (
          <div key={section._id} className="glass-dark p-4 rounded-xl flex items-center justify-between group hover:border-gray-600 transition-colors">
            <div className="flex items-center gap-4">
              <button className="text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing">
                <GripVertical size={20} />
              </button>
              <span className="font-medium text-white">{section.name}</span>
            </div>
            
            <button 
              onClick={() => toggleVisibility(section._id, section.isHidden)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                !section.isHidden 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' 
                  : 'bg-gray-700/50 text-gray-400 border border-gray-600 hover:bg-gray-700'
              }`}
            >
              {!section.isHidden ? 'Visible' : 'Hidden'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sections;
