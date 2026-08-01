import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Save } from 'lucide-react';

const Profile = () => {
  const [formData, setFormData] = useState({
    hero_name: '', hero_title: '', hero_description: '',
    about_bio: '', contact_email: '', contact_phone: '', contact_location: ''
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await axiosInstance.get('/profile');
      setFormData({
        hero_name: data.hero?.name || '',
        hero_title: data.hero?.title || '',
        hero_description: data.hero?.description || '',
        about_bio: data.about?.bio || '',
        contact_email: data.contact?.email || '',
        contact_phone: data.contact?.phone || '',
        contact_location: data.contact?.location || ''
      });
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // API expects multipart/form-data because of multer
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      
      await axiosInstance.put('/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Update failed', error);
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-white p-10">Loading...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
        <p className="text-gray-400 mt-2">Manage your public portfolio details.</p>
      </header>

      <div className="glass-dark p-8 rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Name</label>
              <input name="hero_name" value={formData.hero_name} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Job Title</label>
              <input name="hero_title" value={formData.hero_title} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Hero Description</label>
            <textarea name="hero_description" value={formData.hero_description} onChange={handleChange} rows="2" className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">About Bio</label>
            <textarea name="about_bio" value={formData.about_bio} onChange={handleChange} rows="4" className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Contact Email</label>
              <input type="email" name="contact_email" value={formData.contact_email} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Contact Phone</label>
              <input type="text" name="contact_phone" value={formData.contact_phone} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Location</label>
            <input type="text" name="contact_location" value={formData.contact_location} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
          </div>

          <button type="submit" disabled={saving} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
            <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
