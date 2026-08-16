import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Plus, Edit2, Trash2, Tag, Save, X } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCat, setEditingCat] = useState(null);
  const [name, setName] = useState('');
  const [order, setOrder] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await axiosInstance.get('/categories');
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cat) => {
    setEditingCat(cat);
    setName(cat.name);
    setOrder(cat.order || 0);
  };

  const handleCancel = () => {
    setEditingCat(null);
    setName('');
    setOrder(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const payload = { name, slug, order: Number(order) };

    try {
      if (editingCat) {
        await axiosInstance.put(`/categories/${editingCat._id}`, payload);
      } else {
        await axiosInstance.post('/categories', payload);
      }
      setName('');
      setOrder(0);
      setEditingCat(null);
      fetchCategories();
    } catch (error) {
      console.error('Failed to save category', error);
      alert('Error saving category.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? Projects under this category will need their category updated.')) return;
    try {
      await axiosInstance.delete(`/categories/${id}`);
      fetchCategories();
    } catch (error) {
      console.error('Failed to delete category', error);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Categories</h1>
        <p className="text-gray-400 mt-2">Manage project categories and custom filter order.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Editor Form */}
        <div className="glass-dark p-6 rounded-2xl border border-gray-800 h-fit space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Tag className="text-indigo-400" size={18} />
            {editingCat ? 'Edit Category' : 'Create Category'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Category Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required
                className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                placeholder="e.g. Brand Identity" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Order Index</label>
              <input 
                type="number" 
                value={order} 
                onChange={(e) => setOrder(e.target.value)} 
                className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                placeholder="0" 
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                type="submit" 
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-2.5 rounded-xl font-medium shadow-lg transition-all"
              >
                <Save size={16} /> Save
              </button>
              {editingCat && (
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

        {/* Categories List */}
        <div className="md:col-span-2 glass-dark p-6 rounded-2xl border border-gray-800 space-y-4">
          <h2 className="text-lg font-bold text-white">All Categories</h2>
          
          <div className="space-y-2">
            {categories.length === 0 ? (
              <p className="text-gray-400 text-sm">No categories created yet.</p>
            ) : (
              categories.map((cat) => (
                <div 
                  key={cat._id} 
                  className="flex items-center justify-between p-4 bg-gray-950/40 border border-gray-900 rounded-xl group hover:border-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold bg-indigo-950 text-indigo-300 px-2 py-1 rounded border border-indigo-900">
                      #{cat.order || 0}
                    </span>
                    <div>
                      <span className="text-white font-medium">{cat.name}</span>
                      <span className="block text-xs text-gray-500 font-mono">slug: {cat.slug}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(cat)}
                      className="p-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-300 hover:text-white rounded-lg transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(cat._id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
