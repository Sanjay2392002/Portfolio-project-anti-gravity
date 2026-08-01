import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Save, Settings, Layout, Type } from 'lucide-react';

const SiteSettings = () => {
  const [formData, setFormData] = useState({
    logo: '',
    navCta: '',
    footer_thankYouText: '',
    footer_copyright: '',
    projects_sectionBadge: '',
    projects_title: '',
    projects_titleItalic: '',
    projects_categories: '',
    contactForm_categories: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    try {
      const { data } = await axiosInstance.get('/site');
      
      const formCatsStr = data.contactForm?.categories 
        ? data.contactForm.categories.map(c => `${c.value}|${c.label}`).join(', ') 
        : '';
        
      setFormData({
        logo: data.logo || '',
        navCta: data.navCta || '',
        footer_thankYouText: data.footer?.thankYouText || '',
        footer_copyright: data.footer?.copyright || '',
        projects_sectionBadge: data.projects?.sectionBadge || '',
        projects_title: data.projects?.title || '',
        projects_titleItalic: data.projects?.titleItalic || '',
        projects_categories: (data.projects?.categories || []).join(', '),
        contactForm_categories: formCatsStr
      });
    } catch (error) {
      console.error('Failed to fetch site settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Parse arrays back from comma-separated
      const projCats = formData.projects_categories.split(',').map(s => s.trim()).filter(Boolean);
      const formCats = formData.contactForm_categories.split(',').map(s => {
        const parts = s.trim().split('|');
        return { value: parts[0]?.trim(), label: (parts[1] || parts[0])?.trim() };
      }).filter(c => c.value);
      
      const payload = {
        logo: formData.logo,
        navCta: formData.navCta,
        footer_thankYouText: formData.footer_thankYouText,
        footer_copyright: formData.footer_copyright,
        projects_sectionBadge: formData.projects_sectionBadge,
        projects_title: formData.projects_title,
        projects_titleItalic: formData.projects_titleItalic,
        projects_categories: JSON.stringify(projCats),
        contactForm_categories: JSON.stringify(formCats)
      };

      await axiosInstance.put('/site', payload);
      alert('Settings updated successfully!');
    } catch (error) {
      console.error('Update failed', error);
      alert('Failed to update settings.');
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
          <h1 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Site Settings</h1>
          <p className="text-gray-400 mt-2">Manage global configurations, navigation, and categories.</p>
        </div>
        <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg transform transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50">
          <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* GLOBAL OPTIONS */}
        <div className="glass-dark p-8 rounded-2xl border border-gray-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Settings size={120} />
          </div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Settings className="text-indigo-400" /> Global Setup</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Site Logo / Brand Name</label>
              <input name="logo" value={formData.logo} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="DESIGN.PORTFOLIO" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Nav CTA Button Text</label>
              <input name="navCta" value={formData.navCta} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Let's Work" />
            </div>
          </div>
        </div>
        
        {/* PROJECTS SECTION SETUP */}
        <div className="glass-dark p-8 rounded-2xl border border-gray-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Layout size={120} />
          </div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Layout className="text-indigo-400" /> Projects Section Config</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Section Badge</label>
              <input name="projects_sectionBadge" value={formData.projects_sectionBadge} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="02 / Portfolio Work" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Section Title</label>
              <input name="projects_title" value={formData.projects_title} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Selected Case" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Section Title (Italic)</label>
              <input name="projects_titleItalic" value={formData.projects_titleItalic} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Studies" />
            </div>
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="glass-dark p-8 rounded-2xl border border-gray-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Type size={120} />
          </div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Type className="text-indigo-400" /> Categories</h2>
          
          <div className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Portfolio Categories (Comma separated)</label>
              <input name="projects_categories" value={formData.projects_categories} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Branding, UI/UX, Web Design" />
              <p className="text-xs text-gray-500 ml-1 mt-1">These will appear as filters in your projects section.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Contact Form Categories (value|label, comma separated)</label>
              <input name="contactForm_categories" value={formData.contactForm_categories} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="branding|Brand Identity, web|Web Design" />
              <p className="text-xs text-gray-500 ml-1 mt-1">These appear in the inquiry dropdown on your contact form.</p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="glass-dark p-8 rounded-2xl border border-gray-800 shadow-xl relative overflow-hidden">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">Footer Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Thank You Text</label>
              <input name="footer_thankYouText" value={formData.footer_thankYouText} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="THANK YOU." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Copyright Text</label>
              <input name="footer_copyright" value={formData.footer_copyright} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="© 2026 DESIGN.PORTFOLIO" />
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};

export default SiteSettings;
