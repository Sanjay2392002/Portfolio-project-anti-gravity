import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Save } from 'lucide-react';

const Profile = () => {
  const [formData, setFormData] = useState({ hero: '', about: '', contact: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData({ hero: 'Full Stack Developer', about: 'I write code.', contact: 'hello@example.com' });
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axiosInstance.put('/profile', formData);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Update failed', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
        <p className="text-gray-400 mt-2">Manage your public portfolio details.</p>
      </header>

      <div className="glass-dark p-8 rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Hero Section Text</label>
            <input 
              name="hero" value={formData.hero} onChange={handleChange}
              className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">About Information</label>
            <textarea 
              name="about" value={formData.about} onChange={handleChange} rows="4"
              className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Contact Email</label>
            <input 
              type="email" name="contact" value={formData.contact} onChange={handleChange}
              className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <button 
            type="submit" disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
