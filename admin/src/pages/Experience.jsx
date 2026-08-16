import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Plus, Edit2, Trash2, Briefcase, GraduationCap, Save, X } from 'lucide-react';

const Experience = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);

  const [type, setType] = useState('experience');
  const [date, setDate] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState(0);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data } = await axiosInstance.get('/experience');
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch experience items', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setType(item.type || 'experience');
    setDate(item.date);
    setRole(item.role);
    setCompany(item.company);
    setLocation(item.location || '');
    setDescription(item.description || '');
    setOrder(item.order || 0);
  };

  const handleCancel = () => {
    setEditingItem(null);
    setType('experience');
    setDate('');
    setRole('');
    setCompany('');
    setLocation('');
    setDescription('');
    setOrder(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date.trim() || !role.trim() || !company.trim()) return;

    const payload = {
      type,
      date,
      role,
      company,
      location,
      description,
      order: Number(order)
    };

    try {
      if (editingItem) {
        await axiosInstance.put(`/experience/${editingItem._id}`, payload);
      } else {
        await axiosInstance.post('/experience', payload);
      }
      handleCancel();
      fetchItems();
    } catch (error) {
      console.error('Failed to save experience item', error);
      alert('Error saving experience item.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this timeline item?')) return;
    try {
      await axiosInstance.delete(`/experience/${id}`);
      fetchItems();
    } catch (error) {
      console.error('Failed to delete timeline item', error);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  const experienceItems = items.filter(item => item.type === 'experience');
  const educationItems = items.filter(item => item.type === 'education');

  return (
    <div className="space-y-6 max-w-5xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Experience & Education</h1>
        <p className="text-gray-400 mt-2">Manage your career history timeline and academic record.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Editor */}
        <div className="glass-dark p-6 rounded-2xl border border-gray-800 h-fit space-y-4 lg:col-span-1">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            {type === 'experience' ? <Briefcase className="text-indigo-400" size={18} /> : <GraduationCap className="text-purple-400" size={18} />}
            {editingItem ? 'Edit Entry' : 'Create Entry'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Entry Type</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="experience">Professional Experience</option>
                <option value="education">Education Background</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Date / Year Range</label>
              <input 
                type="text" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                required
                className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                placeholder="e.g. 2024 - Present" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Role Title / Degree</label>
              <input 
                type="text" 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                required
                className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                placeholder="e.g. Graphic Designer / BFA Design" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Company / Institution</label>
              <input 
                type="text" 
                value={company} 
                onChange={(e) => setCompany(e.target.value)} 
                required
                className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                placeholder="e.g. Creative Studio / University" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Location (Optional)</label>
              <input 
                type="text" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                placeholder="e.g. New York, NY" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description (Optional)</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                rows="3"
                className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                placeholder="Explain achievements, key focus areas, etc." 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Order Index</label>
              <input 
                type="number" 
                value={order} 
                onChange={(e) => setOrder(e.target.value)} 
                className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                type="submit" 
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-2.5 rounded-xl font-medium shadow-lg transition-all"
              >
                <Save size={16} /> Save
              </button>
              {editingItem && (
                <button 
                  type="button" 
                  onClick={handleCancel}
                  className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Timeline Columns */}
        <div className="lg:col-span-2 space-y-8">
          {/* Professional Experience */}
          <div className="glass-dark p-6 rounded-2xl border border-gray-800 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="text-indigo-400" size={20} />
              Professional Experience
            </h2>
            
            <div className="space-y-4">
              {experienceItems.length === 0 ? (
                <p className="text-gray-400 text-sm">No experience entries found.</p>
              ) : (
                experienceItems.map((item) => (
                  <div 
                    key={item._id} 
                    className="p-4 bg-gray-950/40 border border-gray-900 rounded-xl group hover:border-gray-800 transition-colors relative"
                  >
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="p-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-300 hover:text-white rounded-lg transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item._id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-900 px-2 py-0.5 rounded font-bold">
                          #{item.order || 0}
                        </span>
                        <span className="text-gray-400 text-xs font-semibold tracking-wider uppercase">{item.date}</span>
                      </div>
                      <h3 className="text-white font-bold text-base">{item.role}</h3>
                      <p className="text-indigo-300 text-sm font-medium">
                        {item.company} {item.location && <span className="text-gray-500 text-xs">| {item.location}</span>}
                      </p>
                      {item.description && <p className="text-gray-400 text-xs mt-2 leading-relaxed">{item.description}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Education Timeline */}
          <div className="glass-dark p-6 rounded-2xl border border-gray-800 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <GraduationCap className="text-purple-400" size={20} />
              Education Background
            </h2>
            
            <div className="space-y-4">
              {educationItems.length === 0 ? (
                <p className="text-gray-400 text-sm">No education entries found.</p>
              ) : (
                educationItems.map((item) => (
                  <div 
                    key={item._id} 
                    className="p-4 bg-gray-950/40 border border-gray-900 rounded-xl group hover:border-gray-800 transition-colors relative"
                  >
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="p-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-300 hover:text-white rounded-lg transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item._id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-900 px-2 py-0.5 rounded font-bold">
                          #{item.order || 0}
                        </span>
                        <span className="text-gray-400 text-xs font-semibold tracking-wider uppercase">{item.date}</span>
                      </div>
                      <h3 className="text-white font-bold text-base">{item.role}</h3>
                      <p className="text-purple-300 text-sm font-medium">
                        {item.company} {item.location && <span className="text-gray-500 text-xs">| {item.location}</span>}
                      </p>
                      {item.description && <p className="text-gray-400 text-xs mt-2 leading-relaxed">{item.description}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Experience;
