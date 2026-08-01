import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Save, User, Briefcase, Mail, FileText, Camera } from 'lucide-react';

const Profile = () => {
  const [formData, setFormData] = useState({
    hero_badge: '', hero_name: '', hero_title: '', hero_description: '',
    hero_ctaPrimary: '', hero_ctaSecondary: '',
    about_title: '', about_titleItalic: '', about_bio: '', about_resumeLabel: '',
    about_capabilities: '', contact_email: '', contact_phone: '', contact_location: ''
  });
  
  const [files, setFiles] = useState({
    hero_portrait: null,
    about_portrait: null,
    resume_pdf: null
  });

  const [previews, setPreviews] = useState({
    hero_portrait: '',
    about_portrait: ''
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
        hero_badge: data.hero?.badge || '',
        hero_name: data.hero?.name || '',
        hero_title: data.hero?.title || '',
        hero_description: data.hero?.description || '',
        hero_ctaPrimary: data.hero?.ctaPrimary || '',
        hero_ctaSecondary: data.hero?.ctaSecondary || '',
        
        about_title: data.about?.title || '',
        about_titleItalic: data.about?.titleItalic || '',
        about_bio: data.about?.bio || '',
        about_resumeLabel: data.about?.resumeLabel || '',
        about_capabilities: (data.about?.capabilities || []).join(', '),
        
        contact_email: data.contact?.email || '',
        contact_phone: data.contact?.phone || '',
        contact_location: data.contact?.location || ''
      });

      setPreviews({
        hero_portrait: data.hero?.portrait || '',
        about_portrait: data.about?.portrait || ''
      });
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFiles({ ...files, [fieldName]: file });
      if (fieldName !== 'resume_pdf') {
        setPreviews({ ...previews, [fieldName]: URL.createObjectURL(file) });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      
      if (files.hero_portrait) data.append('hero_portrait', files.hero_portrait);
      if (files.about_portrait) data.append('about_portrait', files.about_portrait);
      if (files.resume_pdf) data.append('resume_pdf', files.resume_pdf);
      
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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-5xl">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Profile Settings</h1>
          <p className="text-gray-400 mt-2">Manage your public portfolio details, hero section, and about information.</p>
        </div>
        <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg transform transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50">
          <Save size={18} /> {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* HERO SECTION */}
        <div className="glass-dark p-8 rounded-2xl border border-gray-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <User size={120} />
          </div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><User className="text-indigo-400" /> Hero Section</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">Badge Text</label>
                  <input name="hero_badge" value={formData.hero_badge} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="CREATIVE DESIGNER" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">Your Name</label>
                  <input name="hero_name" value={formData.hero_name} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="John Doe" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Main Title</label>
                <input name="hero_title" value={formData.hero_title} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="PORTFOLIO" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Hero Description</label>
                <textarea name="hero_description" value={formData.hero_description} onChange={handleChange} rows="3" className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="A brief introduction about yourself..." />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Hero Portrait Image</label>
              <div className="relative group rounded-2xl overflow-hidden border-2 border-dashed border-gray-700 hover:border-indigo-500 h-64 bg-gray-900/50 flex flex-col items-center justify-center transition-colors">
                <input type="file" onChange={(e) => handleFileChange(e, 'hero_portrait')} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                {previews.hero_portrait ? (
                  <img src={previews.hero_portrait} alt="Hero Portrait" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-50 transition-opacity" />
                ) : (
                  <User size={48} className="text-gray-600 mb-2" />
                )}
                <div className="z-0 flex flex-col items-center bg-gray-950/60 p-3 rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={24} className="text-white mb-1" />
                  <span className="text-white text-xs font-medium">Click to upload</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* ABOUT SECTION */}
        <div className="glass-dark p-8 rounded-2xl border border-gray-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Briefcase size={120} />
          </div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Briefcase className="text-indigo-400" /> About Section</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">About Portrait Image</label>
              <div className="relative group rounded-2xl overflow-hidden border-2 border-dashed border-gray-700 hover:border-indigo-500 h-64 bg-gray-900/50 flex flex-col items-center justify-center transition-colors">
                <input type="file" onChange={(e) => handleFileChange(e, 'about_portrait')} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                {previews.about_portrait ? (
                  <img src={previews.about_portrait} alt="About Portrait" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-50 transition-opacity" />
                ) : (
                  <User size={48} className="text-gray-600 mb-2" />
                )}
                <div className="z-0 flex flex-col items-center bg-gray-950/60 p-3 rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={24} className="text-white mb-1" />
                  <span className="text-white text-xs font-medium">Upload portrait</span>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">Section Title</label>
                  <input name="about_title" value={formData.about_title} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="About" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">Title Italic Part</label>
                  <input name="about_titleItalic" value={formData.about_titleItalic} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Me" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">About Bio</label>
                <textarea name="about_bio" value={formData.about_bio} onChange={handleChange} rows="4" className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Detailed biography..." />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Capabilities / Skills (Comma separated)</label>
                <input name="about_capabilities" value={formData.about_capabilities} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="UI Design, Web Development, Branding" />
              </div>
            </div>
          </div>
        </div>

        {/* CONTACT SECTION */}
        <div className="glass-dark p-8 rounded-2xl border border-gray-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Mail size={120} />
          </div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Mail className="text-indigo-400" /> Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
              <input type="email" name="contact_email" value={formData.contact_email} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="hello@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Phone Number</label>
              <input type="text" name="contact_phone" value={formData.contact_phone} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="+1 (555) 000-0000" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Location</label>
              <input type="text" name="contact_location" value={formData.contact_location} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="New York, USA" />
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-gray-900/50 rounded-xl border border-gray-800 flex items-center gap-6">
            <div className="p-4 bg-indigo-500/20 text-indigo-400 rounded-full">
              <FileText size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-medium">Resume / CV Document</h3>
              <p className="text-gray-400 text-sm mt-1">Upload a PDF version of your resume.</p>
            </div>
            <div className="relative">
              <input type="file" onChange={(e) => handleFileChange(e, 'resume_pdf')} accept=".pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <button type="button" className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium border border-gray-700 transition-colors pointer-events-none">
                {files.resume_pdf ? files.resume_pdf.name : 'Choose File'}
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};

export default Profile;
