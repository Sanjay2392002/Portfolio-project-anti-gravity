import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ProjectCategory, Project } from '../../types/project';
import { Plus, Trash2, Save, RotateCcw } from 'lucide-react';

const DEFAULT_CATEGORIES: { name: string; slug: string; description: string }[] = [
  {
    name: 'Social Media Posters',
    slug: 'social-media-posters',
    description: 'Engaging social media campaigns, festive posters, and digital creatives',
  },
  {
    name: 'Video Thumbnails',
    slug: 'video-thumbnails',
    description: 'High-CTR YouTube thumbnails, digital covers, and video artwork',
  },
  {
    name: 'Logo Design',
    slug: 'logo-design',
    description: 'Memorable brand marks, custom wordmarks, and geometric emblems',
  },
  {
    name: 'Branding',
    slug: 'branding',
    description: 'Complete visual identity systems, brand guidelines, and collateral',
  },
  {
    name: 'Packaging Design',
    slug: 'packaging-design',
    description: 'Box diecuts, retail packaging, labels, and product tags',
  },
  {
    name: 'Print Design',
    slug: 'print-design',
    description: 'Editorial publications, brochures, corporate stationery, and magazines',
  },
  {
    name: 'Stall Design',
    slug: 'stall-design',
    description: 'Spatial exhibition stall architecture, trade show booths, and 3D mockups',
  },
  {
    name: 'Website Design',
    slug: 'website-design',
    description: 'Modern responsive web experiences, UI/UX architecture, and digital interfaces',
  },
];

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [catRes, projRes] = await Promise.all([
        fetch('/api/admin/categories').then((r) => r.json()),
        fetch('/api/admin/projects').then((r) => r.json()),
      ]);

      if (catRes.success) setCategories(catRes.data);
      if (projRes.success) setProjects(projRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addCategory = () => {
    const newCat: ProjectCategory = {
      id: 'cat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      name: 'New Category',
      slug: 'new-category-' + Date.now().toString().slice(-4),
      description: 'Category description...',
      sort_order: categories.length + 1,
    };
    setCategories([...categories, newCat]);
  };

  const resetToStandard = () => {
    if (!window.confirm('Reset categories to the 8 standard portfolio sections?')) return;
    const standard: ProjectCategory[] = DEFAULT_CATEGORIES.map((cat, idx) => ({
      id: 'cat_' + cat.slug.replace(/-/g, '_'),
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      sort_order: idx + 1,
    }));
    setCategories(standard);
  };

  const updateCategory = (index: number, field: keyof ProjectCategory, val: any) => {
    const next = [...categories];
    next[index] = { ...next[index], [field]: val };
    if (field === 'name') {
      next[index].slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    setCategories(next);
  };

  const removeCategory = (index: number) => {
    if (categories.length <= 1) {
      alert('At least one category must exist.');
      return;
    }
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Categories updated and saved successfully!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const getCount = (catId: string, slug: string) => {
    return projects.filter((p) => p.category_id === catId || p.category_slug === slug).length;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">CATEGORIES & SECTIONS</h1>
            <p className="text-[14px] text-[#6B6B6B]">
              Manage portfolio disciplines and project categorizations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={resetToStandard}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-[6px] border border-[#E5E5E5] bg-white text-[12px] font-medium text-[#6B6B6B] hover:text-[#111111] hover:border-black transition-colors"
              title="Reset to 8 Standard Sections"
            >
              <RotateCcw size={13} />
              <span>Standard 8 Sections</span>
            </button>
            <button
              type="button"
              onClick={addCategory}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-[6px] border border-[#E5E5E5] bg-white text-[13px] font-medium hover:border-black transition-colors"
            >
              <Plus size={14} />
              <span>Add Category</span>
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-[6px] bg-black text-white text-[13px] font-medium hover:bg-black/90 transition-colors disabled:opacity-50"
            >
              <Save size={14} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        {message && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] rounded-[6px]">
            {message}
          </div>
        )}

        {/* Categories List */}
        <div className="bg-white rounded-[12px] border border-[#E5E5E5] p-6 space-y-4 shadow-xs">
          <div className="text-[12px] font-semibold text-[#8A8A8A] uppercase tracking-wider pb-2 border-b border-[#E5E5E5]">
            Active Disciplines ({categories.length})
          </div>

          {categories.map((cat, idx) => {
            const count = getCount(cat.id, cat.slug);
            return (
              <div
                key={cat.id}
                className="p-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded-[8px] grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
              >
                <div className="md:col-span-4">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold uppercase text-[#8A8A8A]">
                      Category Name
                    </label>
                    <span className="text-[11px] font-mono px-2 py-0.2 bg-white border border-[#E5E5E5] rounded text-[#6B6B6B]">
                      {count} {count === 1 ? 'project' : 'projects'}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) => updateCategory(idx, 'name', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#E5E5E5] rounded text-[13px] font-semibold text-[#111111]"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-[11px] font-bold uppercase text-[#8A8A8A] mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={cat.slug}
                    onChange={(e) => updateCategory(idx, 'slug', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#E5E5E5] rounded text-[12px] font-mono text-[#6B6B6B]"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-[11px] font-bold uppercase text-[#8A8A8A] mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={cat.description || ''}
                    onChange={(e) => updateCategory(idx, 'description', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#E5E5E5] rounded text-[13px] text-[#6B6B6B]"
                  />
                </div>

                <div className="md:col-span-1 flex justify-end pt-5 md:pt-0">
                  <button
                    type="button"
                    onClick={() => removeCategory(idx)}
                    className="p-1.5 text-red-500 hover:text-red-700"
                    title="Remove Category"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};
