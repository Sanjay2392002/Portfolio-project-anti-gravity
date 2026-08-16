import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Plus, Edit2, Trash2, Code, Save, X } from 'lucide-react';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState(null);
  
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [capabilities, setCapabilities] = useState('');
  const [icon, setIcon] = useState('');
  const [order, setOrder] = useState(0);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data } = await axiosInstance.get('/services');
      setServices(data);
    } catch (error) {
      console.error('Failed to fetch services', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ser) => {
    setEditingService(ser);
    setTitle(ser.title);
    setDesc(ser.desc || '');
    setCapabilities(Array.isArray(ser.capabilities) ? ser.capabilities.join(', ') : '');
    setIcon(ser.icon || '');
    setOrder(ser.order || 0);
  };

  const handleCancel = () => {
    setEditingService(null);
    setTitle('');
    setDesc('');
    setCapabilities('');
    setIcon('');
    setOrder(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedCaps = capabilities.split(',').map(s => s.trim()).filter(Boolean);
    const payload = {
      title,
      desc,
      icon,
      capabilities: parsedCaps,
      order: Number(order)
    };

    try {
      if (editingService) {
        await axiosInstance.put(`/services/${editingService._id}`, payload);
      } else {
        await axiosInstance.post('/services', payload);
      }
      handleCancel();
      fetchServices();
    } catch (error) {
      console.error('Failed to save service', error);
      alert('Error saving service.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await axiosInstance.delete(`/services/${id}`);
      fetchServices();
    } catch (error) {
      console.error('Failed to delete service', error);
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
        <h1 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Services & Capabilities</h1>
        <p className="text-gray-400 mt-2">Manage the services, technical capabilities, and visual disciplines you offer.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Editor */}
        <div className="glass-dark p-6 rounded-2xl border border-gray-800 h-fit space-y-4 lg:col-span-1">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Code className="text-indigo-400" size={18} />
            {editingService ? 'Edit Service' : 'Create Service'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Service Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required
                className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                placeholder="e.g. Brand Design" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</label>
              <textarea 
                value={desc} 
                onChange={(e) => setDesc(e.target.value)} 
                rows="3"
                className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                placeholder="A brief explanation of your service..." 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Capabilities (Comma-separated)</label>
              <input 
                type="text" 
                value={capabilities} 
                onChange={(e) => setCapabilities(e.target.value)} 
                className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                placeholder="Logo Design, Color Strategy, Guidelines" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Icon SVG Markup</label>
              <textarea 
                value={icon} 
                onChange={(e) => setIcon(e.target.value)} 
                rows="2"
                className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono" 
                placeholder="e.g. <svg viewBox='0 0 24 24'>...</svg>" 
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
              {editingService && (
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

        {/* Services List */}
        <div className="lg:col-span-2 glass-dark p-6 rounded-2xl border border-gray-800 space-y-4">
          <h2 className="text-lg font-bold text-white">All Services</h2>
          
          <div className="space-y-4">
            {services.length === 0 ? (
              <p className="text-gray-400 text-sm">No services configured yet.</p>
            ) : (
              services.map((ser) => (
                <div 
                  key={ser._id} 
                  className="p-5 bg-gray-950/40 border border-gray-900 rounded-xl group hover:border-gray-800 transition-colors relative"
                >
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(ser)}
                      className="p-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-300 hover:text-white rounded-lg transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(ser._id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex gap-4 items-start">
                    {ser.icon && (
                      <div 
                        className="w-10 h-10 text-indigo-400 flex items-center justify-center p-2 bg-indigo-500/10 rounded-lg shrink-0"
                        dangerouslySetInnerHTML={{ __html: ser.icon }}
                      />
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-900">
                          #{ser.order || 0}
                        </span>
                        <h3 className="text-lg font-bold text-white">{ser.title}</h3>
                      </div>
                      
                      {ser.desc && <p className="text-gray-400 text-sm max-w-2xl">{ser.desc}</p>}
                      
                      {ser.capabilities && ser.capabilities.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {ser.capabilities.map((cap, i) => (
                            <span key={i} className="text-[10px] bg-gray-900 border border-gray-800 text-gray-300 px-2 py-0.5 rounded">
                              {cap}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
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

export default Services;
