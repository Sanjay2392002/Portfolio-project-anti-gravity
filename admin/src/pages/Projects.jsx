import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await axiosInstance.get('/projects');
      setProjects(data || []);
    } catch (error) {
      console.error(error);
      setProjects([{ id: 1, title: 'Anti Gravity App', status: 'Active' }]);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-gray-400 mt-2">Manage your portfolio projects.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-colors">
          <Plus size={18} /> Add Project
        </button>
      </header>

      <div className="glass-dark rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-800/50 border-b border-gray-700">
              <th className="px-6 py-4 text-sm font-medium text-gray-300">Title</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-300">Status</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-300 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((proj) => (
              <tr key={proj.id} className="border-b border-gray-800 hover:bg-gray-800/20 transition-colors">
                <td className="px-6 py-4 text-white">{proj.title}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs">
                    {proj.status || 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 flex justify-end gap-3">
                  <button className="text-indigo-400 hover:text-indigo-300 p-2 hover:bg-indigo-500/10 rounded-lg transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan="3" className="px-6 py-8 text-center text-gray-500">No projects found. Add one to get started.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Projects;
