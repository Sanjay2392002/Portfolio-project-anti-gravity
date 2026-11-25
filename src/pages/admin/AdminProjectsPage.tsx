import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Project, ProjectCategory } from '../../types/project';
import {
  Plus,
  Search,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit2,
  Copy,
  Archive,
  RotateCcw,
  Trash2,
  CheckCircle2,
  XCircle,
  Filter,
} from 'lucide-react';

export const AdminProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projRes, catRes] = await Promise.all([
        fetch('/api/admin/projects').then((r) => r.json()),
        fetch('/api/admin/categories').then((r) => r.json()),
      ]);

      if (projRes.success) setProjects(projRes.data);
      if (catRes.success) setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePublishToggle = async (project: Project) => {
    const endpoint =
      project.status === 'published'
        ? `/api/admin/projects/${project.id}/unpublish`
        : `/api/admin/projects/${project.id}/publish`;

    const res = await fetch(endpoint, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      setMessage(`Project "${project.title}" ${project.status === 'published' ? 'unpublished' : 'published'}.`);
      loadData();
    }
  };

  const handleDuplicate = async (id: string) => {
    const res = await fetch(`/api/admin/projects/${id}/duplicate`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      setMessage('Project duplicated successfully.');
      loadData();
    }
  };

  const handleArchive = async (id: string) => {
    const res = await fetch(`/api/admin/projects/${id}/archive`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      setMessage('Project archived.');
      loadData();
    }
  };

  const handleRestore = async (id: string) => {
    const res = await fetch(`/api/admin/projects/${id}/restore`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      setMessage('Project restored to drafts.');
      loadData();
    }
  };

  const handleDeletePermanent = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"? This cannot be undone.`)) {
      return;
    }
    const res = await fetch(`/api/admin/projects/${id}?permanent=true`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      setMessage('Project permanently deleted.');
      loadData();
    }
  };

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const newProjects = [...projects];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newProjects.length) return;

    const temp = newProjects[index];
    newProjects[index] = newProjects[targetIndex];
    newProjects[targetIndex] = temp;

    const orders = newProjects.map((p, idx) => ({ id: p.id, sort_order: idx + 1 }));
    setProjects(newProjects);

    await fetch('/api/admin/projects/reorder/all', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orders }),
    });
  };

  const filteredProjects = projects.filter((p) => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (selectedCategory !== 'all') {
      if (p.category_id !== selectedCategory && p.category_slug !== selectedCategory) {
        return false;
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        (p.category_name || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">PROJECTS</h1>
            <p className="text-[14px] text-[#6B6B6B]">
              Manage portfolio projects, filter by section/category, and reorder.
            </p>
          </div>
          <Link
            to="/admin/projects/new"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-[8px] bg-black text-white text-[13px] font-medium hover:bg-black/90 transition-colors"
          >
            <Plus size={16} />
            <span>New Project</span>
          </Link>
        </div>

        {message && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] rounded-[8px] flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">
              ×
            </button>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-[10px] border border-[#E5E5E5]">
          {/* Status Tabs */}
          <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {(['all', 'published', 'draft', 'archived'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-[6px] text-[12px] font-medium uppercase tracking-wider transition-colors whitespace-nowrap ${
                  filter === tab
                    ? 'bg-black text-white'
                    : 'text-[#6B6B6B] hover:bg-[#F5F5F5] hover:text-[#111111]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Category Dropdown Filter */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter size={14} className="text-[#8A8A8A]" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 bg-[#F9F9F9] border border-[#E5E5E5] rounded-[6px] text-[12px] font-medium text-[#111111] focus:outline-none focus:border-black"
              >
                <option value="all">All Categories ({projects.length})</option>
                {categories.map((cat) => {
                  const count = projects.filter(
                    (p) => p.category_id === cat.id || p.category_slug === cat.slug
                  ).length;
                  return (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#F9F9F9] border border-[#E5E5E5] rounded-[6px] text-[12px] focus:outline-none focus:border-black"
              />
            </div>
          </div>
        </div>

        {/* Projects List Table */}
        <div className="bg-white rounded-[12px] border border-[#E5E5E5] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-[#F9F9F9] text-[#8A8A8A] uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4 w-12 text-center">Order</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Category / Section</th>
                <th className="py-3 px-4">Year</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {filteredProjects.map((proj, idx) => (
                <tr key={proj.id} className="hover:bg-[#FDFDFD] transition-colors">
                  {/* Order controls */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        type="button"
                        onClick={() => moveOrder(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-[#8A8A8A] hover:text-black disabled:opacity-20"
                        title="Move Up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveOrder(idx, 'down')}
                        disabled={idx === filteredProjects.length - 1}
                        className="p-1 text-[#8A8A8A] hover:text-black disabled:opacity-20"
                        title="Move Down"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </td>

                  {/* Title & Image */}
                  <td className="py-3.5 px-4 font-medium text-[#111111]">
                    <div className="flex items-center space-x-3">
                      <img
                        src={proj.hero_image}
                        alt=""
                        className="w-11 h-11 rounded-[6px] object-cover bg-[#F5F5F5] border border-[#E5E5E5]"
                      />
                      <div>
                        <div className="font-semibold text-[14px]">{proj.title}</div>
                        <div className="text-[12px] text-[#8A8A8A]">{proj.slug}</div>
                      </div>
                    </div>
                  </td>

                  {/* Category Name Badge */}
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-1 rounded-[6px] bg-[#F5F5F5] text-[#111111] text-[12px] font-semibold tracking-tight border border-[#E5E5E5]">
                      {proj.category_name || 'Design'}
                    </span>
                  </td>

                  {/* Year */}
                  <td className="py-3.5 px-4 text-[#6B6B6B] font-mono text-[12px]">{proj.year}</td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                        proj.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : proj.status === 'draft'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}
                    >
                      {proj.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2 text-[#6B6B6B]">
                      <Link
                        to={`/project/${proj.slug}`}
                        target="_blank"
                        className="p-1.5 hover:text-black hover:bg-[#F5F5F5] rounded-[4px]"
                        title="Preview on site"
                      >
                        <Eye size={15} />
                      </Link>

                      <Link
                        to={`/admin/projects/${proj.id}/edit`}
                        className="p-1.5 hover:text-black hover:bg-[#F5F5F5] rounded-[4px]"
                        title="Edit project & blocks"
                      >
                        <Edit2 size={15} />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDuplicate(proj.id)}
                        className="p-1.5 hover:text-black hover:bg-[#F5F5F5] rounded-[4px]"
                        title="Duplicate project"
                      >
                        <Copy size={15} />
                      </button>

                      {proj.status !== 'archived' && (
                        <button
                          type="button"
                          onClick={() => handlePublishToggle(proj)}
                          className={`p-1.5 rounded-[4px] ${
                            proj.status === 'published'
                              ? 'text-emerald-600 hover:text-amber-600'
                              : 'text-[#8A8A8A] hover:text-emerald-600'
                          }`}
                          title={proj.status === 'published' ? 'Unpublish to draft' : 'Publish live'}
                        >
                          {proj.status === 'published' ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                        </button>
                      )}

                      {proj.status === 'archived' ? (
                        <button
                          type="button"
                          onClick={() => handleRestore(proj.id)}
                          className="p-1.5 hover:text-emerald-600 rounded-[4px]"
                          title="Restore to drafts"
                        >
                          <RotateCcw size={15} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleArchive(proj.id)}
                          className="p-1.5 hover:text-amber-600 rounded-[4px]"
                          title="Archive"
                        >
                          <Archive size={15} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeletePermanent(proj.id, proj.title)}
                        className="p-1.5 hover:text-red-600 rounded-[4px]"
                        title="Delete permanently"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredProjects.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8A8A8A]">
                    No projects found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
