import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Save, AlertCircle } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', category: '', year: '', duration: '', tools: '',
    client: '', focus: '', output: '', concept: '', swatches: '#0044FF,#C85A32,#FAF9F5,#141518',
    typography: '[]', isFeatured: false
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await axiosInstance.get('/projects');
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await axiosInstance.delete(`/projects/${id}`);
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete project', error);
      alert('Failed to delete project');
    }
  };

  const openForm = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title || '',
        category: project.category || '',
        year: project.year || '',
        duration: project.duration || '',
        tools: project.tools || '',
        client: project.client || '',
        focus: project.focus || '',
        output: project.output || '',
        concept: project.concept || '',
        swatches: Array.isArray(project.swatches) ? project.swatches.join(',') : '#0044FF,#C85A32,#FAF9F5,#141518',
        typography: project.typography ? JSON.stringify(project.typography) : '[]',
        isFeatured: project.isFeatured || false
      });
      setImagePreview(project.img || '');
    } else {
      setEditingProject(null);
      setFormData({
        title: '', category: '', year: '', duration: '', tools: '',
        client: '', focus: '', output: '', concept: '', swatches: '#0044FF,#C85A32,#FAF9F5,#141518',
        typography: '[]', isFeatured: false
      });
      setImagePreview('');
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeForm = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (imageFile) data.append('image', imageFile);

      if (editingProject) {
        await axiosInstance.put(`/projects/${editingProject.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        if (!imageFile) throw new Error("Image is required for a new project.");
        await axiosInstance.post('/projects', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      
      await fetchProjects();
      closeForm();
    } catch (error) {
      console.error('Save failed', error);
      alert(error.message || 'Failed to save project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Projects</h1>
          <p className="text-gray-400 mt-2">Manage your portfolio projects and case studies.</p>
        </div>
        <button onClick={() => openForm()} className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg transform transition-all duration-300 hover:-translate-y-1 active:translate-y-0">
          <Plus size={18} /> New Project
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center glass-dark rounded-2xl border border-gray-800 border-dashed">
            <AlertCircle className="text-gray-500 mb-3" size={40} />
            <p className="text-gray-400 font-medium">No projects found. Create your first one!</p>
          </div>
        )}
        
        {projects.map((proj) => (
          <div key={proj.id} className="glass-dark rounded-2xl overflow-hidden group hover:border-indigo-500/50 transition-all duration-300 shadow-xl border border-gray-800">
            <div className="h-48 overflow-hidden relative bg-gray-900">
              <img src={proj.img} alt={proj.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => e.target.style.display = 'none'} />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-80" />
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={() => openForm(proj)} className="p-2 bg-indigo-500/80 hover:bg-indigo-600 text-white rounded-lg backdrop-blur-md transition-colors">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => deleteProject(proj.id)} className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg backdrop-blur-md transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="p-5 relative">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-indigo-900 text-indigo-300 text-xs font-semibold tracking-wider rounded-full border border-indigo-700/50 uppercase">
                  {proj.category || 'Uncategorized'}
                </span>
                {proj.isFeatured && (
                  <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold tracking-wider rounded-full border border-amber-500/30 uppercase">
                    ★ Featured
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-white mt-1 mb-1 truncate">{proj.title}</h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{proj.concept || 'No concept description provided.'}</p>
              
              <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                <span>{proj.client || 'Personal Project'}</span>
                <span>{proj.year || new Date().getFullYear()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-950 border border-gray-800 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">{editingProject ? 'Edit Project' : 'Create New Project'}</h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="project-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 ml-1">Project Title *</label>
                    <input name="title" required value={formData.title} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="e.g. Acme Branding" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 ml-1">Category *</label>
                    <input name="category" required value={formData.category} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="e.g. Brand Identity" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 ml-1">Year</label>
                    <input name="year" value={formData.year} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="2026" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 ml-1">Duration</label>
                    <input name="duration" value={formData.duration} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="3 Weeks" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 ml-1">Client</label>
                    <input name="client" value={formData.client} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Brand Name" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 ml-1">Tools Used</label>
                    <input name="tools" value={formData.tools} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Figma, Illustrator" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 ml-1">Focus Area</label>
                    <input name="focus" value={formData.focus} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Visual Composition" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">Concept & Narrative</label>
                  <textarea name="concept" value={formData.concept} onChange={handleChange} rows="3" className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Describe the creative concept..." />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">Swatches (Comma separated hex codes)</label>
                  <input name="swatches" value={formData.swatches} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="#FF0000, #00FF00" />
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-900/40 border border-gray-800 rounded-xl">
                  <input 
                    type="checkbox" 
                    id="isFeatured" 
                    name="isFeatured" 
                    checked={formData.isFeatured} 
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-700 text-indigo-600 focus:ring-indigo-500 bg-gray-950 focus:ring-2 focus:ring-offset-gray-900"
                  />
                  <label htmlFor="isFeatured" className="text-sm font-medium text-gray-200 cursor-pointer select-none">
                    Featured Project (Highlight this project on the homepage and show a visual badge)
                  </label>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300 ml-1">Cover Image {!editingProject && '*'}</label>
                  <div className="border-2 border-dashed border-gray-700 hover:border-indigo-500 rounded-2xl p-8 text-center transition-colors relative bg-gray-900/30 group">
                    <input type="file" onChange={handleImageChange} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    {imagePreview ? (
                      <div className="flex flex-col items-center">
                        <img src={imagePreview} alt="Preview" className="h-40 rounded-xl object-contain mb-3 shadow-lg" />
                        <span className="text-indigo-400 font-medium text-sm group-hover:text-indigo-300 transition-colors">Click to replace image</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-500">
                        <ImageIcon size={48} className="mb-3 text-gray-600 group-hover:text-indigo-400 transition-colors" />
                        <p className="font-medium">Drag and drop or click to upload</p>
                        <p className="text-xs mt-1 text-gray-600">Supports JPG, PNG, WebP</p>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-4">
              <button onClick={closeForm} className="px-6 py-2.5 rounded-xl font-medium text-gray-300 hover:bg-gray-800 transition-colors">
                Cancel
              </button>
              <button type="submit" form="project-form" disabled={loading} className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-2.5 rounded-xl font-semibold shadow-lg transform transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none">
                {loading ? 'Saving...' : <><Save size={18} /> Save Project</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
