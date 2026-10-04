import React, { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { selectedWorkBrands, type SelectedWorkCategory, type SelectedWorkItem } from '../../data/selectedWorks';
import { ArrowUpRight, ImagePlus, Pencil, Plus, Search, Trash2, X } from 'lucide-react';

type WorkForm = Omit<SelectedWorkItem, 'id'>;
const categories: SelectedWorkCategory[] = ['Logo Presentation', 'Posters & Ads', 'Ads & Posters', 'Stories', 'Carousels', 'Thumbnails', 'Mailer', 'Other'];
const emptyForm: WorkForm = {
  brand: '', title: '', image: '', type: 'image', width: 1080, height: 1350,
  category: 'Posters & Ads', collection: '', sort_order: 0,
};

export const AdminSelectedWorksPage: React.FC = () => {
  const [works, setWorks] = useState<SelectedWorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editing, setEditing] = useState<SelectedWorkItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<WorkForm>(emptyForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/selected-works');
      const result = await response.json();
      if (!response.ok || !result.success || !Array.isArray(result.data)) throw new Error(result.error || 'Could not load works.');
      setWorks(result.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load works.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const brands = useMemo(() => [...new Set([...selectedWorkBrands, ...works.map((work) => work.brand)])], [works]);
  const filteredWorks = useMemo(() => works.filter((work) => {
    const matchesBrand = brandFilter === 'all' || work.brand === brandFilter;
    const matchesCategory = categoryFilter === 'all' || work.category === categoryFilter;
    const matchesText = `${work.brand} ${work.title} ${work.collection}`.toLowerCase().includes(search.trim().toLowerCase());
    return matchesBrand && matchesCategory && matchesText;
  }), [brandFilter, categoryFilter, search, works]);

  const startCreate = () => {
    setEditing(null);
    setFormOpen(true);
    setForm({ ...emptyForm, brand: brandFilter !== 'all' ? brandFilter : '' });
    setError('');
    setMessage('');
  };

  const startEdit = (work: SelectedWorkItem) => {
    setEditing(work);
    setFormOpen(true);
    setForm({ ...work, sort_order: work.sort_order || 0 });
    setError('');
    setMessage('');
  };

  const updateField = <K extends keyof WorkForm>(field: K, value: WorkForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const endpoint = editing ? `/api/admin/selected-works/${encodeURIComponent(editing.id)}` : '/api/admin/selected-works';
      const response = await fetch(endpoint, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Could not save this work item.');
      setEditing(null);
      setFormOpen(false);
      setMessage(editing ? 'Work item updated.' : 'Work item added.');
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save this work item.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (work: SelectedWorkItem) => {
    if (!window.confirm(`Remove “${work.title}” from My Works?`)) return;
    setError('');
    setMessage('');
    try {
      const response = await fetch(`/api/admin/selected-works/${encodeURIComponent(work.id)}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Could not remove this work item.');
      setMessage('Work item removed.');
      await load();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Could not remove this work item.');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[.16em] text-[#6f786f]">Portfolio content</p>
            <h1 className="text-[28px] font-bold tracking-tight text-[#111111]">SELECTED WORKS</h1>
            <p className="mt-1 text-[14px] text-[#6B6B6B]">Manage the brand cards and creatives shown on the public work page.</p>
          </div>
          <button type="button" onClick={startCreate} className="inline-flex items-center justify-center gap-2 rounded-[7px] bg-black px-4 py-2.5 text-[13px] font-medium text-white hover:bg-black/85">
            <Plus size={15} /> Add work
          </button>
        </header>

        {message && <div role="status" className="rounded-[7px] border border-emerald-200 bg-emerald-50 p-3 text-[13px] text-emerald-800">{message}</div>}
        {error && <div role="alert" className="rounded-[7px] border border-red-200 bg-red-50 p-3 text-[13px] text-red-700">{error}</div>}

        {formOpen && (
          <form onSubmit={save} className="rounded-[10px] border border-[#e5e5e5] bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-semibold">{editing ? 'Edit work item' : 'Add work item'}</h2>
                <p className="mt-1 text-[12px] text-[#747474]">Use a portfolio asset path or an HTTPS URL.</p>
              </div>
              <button type="button" onClick={() => { setEditing(null); setForm(emptyForm); setFormOpen(false); }} aria-label="Close editor" className="rounded p-2 text-[#777] hover:bg-[#f4f4f4]"><X size={17} /></button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="grid gap-1.5 text-[12px] font-medium text-[#555]">Brand
                <input required maxLength={120} value={form.brand} onChange={(event) => updateField('brand', event.target.value)} placeholder="Brand name" className="rounded border border-[#ddd] px-3 py-2 text-[13px] text-[#111]" />
              </label>
              <label className="grid gap-1.5 text-[12px] font-medium text-[#555]">Title
                <input required maxLength={255} value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Creative title" className="rounded border border-[#ddd] px-3 py-2 text-[13px] text-[#111]" />
              </label>
              <label className="grid gap-1.5 text-[12px] font-medium text-[#555]">Type
                <select value={form.type} onChange={(event) => updateField('type', event.target.value as WorkForm['type'])} className="rounded border border-[#ddd] bg-white px-3 py-2 text-[13px] text-[#111]">
                  <option value="image">Image</option><option value="pdf">PDF presentation</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-[12px] font-medium text-[#555]">Topic
                <select value={form.category} onChange={(event) => updateField('category', event.target.value as SelectedWorkCategory)} className="rounded border border-[#ddd] bg-white px-3 py-2 text-[13px] text-[#111]">
                  {categories.map((category) => <option key={category}>{category}</option>)}
                </select>
              </label>
              <label className="grid gap-1.5 text-[12px] font-medium text-[#555]">Carousel name <span className="font-normal text-[#888]">(used only for carousels)</span>
                <input maxLength={160} value={form.collection} onChange={(event) => updateField('collection', event.target.value)} disabled={form.category !== 'Carousels'} placeholder="e.g. Mr. B intro" className="rounded border border-[#ddd] px-3 py-2 text-[13px] text-[#111] disabled:bg-[#f5f5f5]" />
              </label>
              <label className="grid gap-1.5 text-[12px] font-medium text-[#555]">Asset path or URL
                <input required value={form.image} onChange={(event) => updateField('image', event.target.value)} placeholder="/selected-works/Brand/artwork.webp" className="rounded border border-[#ddd] px-3 py-2 text-[13px] text-[#111]" />
              </label>
              <label className="grid gap-1.5 text-[12px] font-medium text-[#555]">Width (px)
                <input type="number" min={0} max={20000} required value={form.width} onChange={(event) => updateField('width', Number(event.target.value))} className="rounded border border-[#ddd] px-3 py-2 text-[13px] text-[#111]" />
              </label>
              <label className="grid gap-1.5 text-[12px] font-medium text-[#555]">Height (px)
                <input type="number" min={0} max={20000} required value={form.height} onChange={(event) => updateField('height', Number(event.target.value))} className="rounded border border-[#ddd] px-3 py-2 text-[13px] text-[#111]" />
              </label>
              <label className="grid gap-1.5 text-[12px] font-medium text-[#555]">Order within brand
                <input type="number" min={0} max={1000000} value={form.sort_order} onChange={(event) => updateField('sort_order', Number(event.target.value))} className="rounded border border-[#ddd] px-3 py-2 text-[13px] text-[#111]" />
              </label>
            </div>

            {form.image && <div className="mt-4 flex items-center gap-3 rounded border border-[#e8e8e8] bg-[#fafafa] p-3">
              {form.type === 'image' ? <img src={form.image} alt="Preview" className="h-20 w-16 rounded object-cover" onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }} /> : <span className="grid h-20 w-16 place-items-center rounded bg-white text-[10px] font-semibold text-[#777]">PDF</span>}
              <a href="/admin/media" target="_blank" className="inline-flex items-center gap-1 text-[12px] text-[#555] underline">Open media library <ArrowUpRight size={13} /></a>
            </div>}

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => { setEditing(null); setForm(emptyForm); setFormOpen(false); }} className="rounded border border-[#ddd] px-3.5 py-2 text-[12px] text-[#555]">Cancel</button>
              <button disabled={saving} className="rounded bg-black px-4 py-2 text-[12px] font-medium text-white disabled:opacity-50">{saving ? 'Saving…' : editing ? 'Save changes' : 'Add to My Works'}</button>
            </div>
          </form>
        )}

        <section className="rounded-[10px] border border-[#e5e5e5] bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 grid gap-3 grid-cols-1 sm:grid-cols-[1fr_210px_190px]">
            <label className="flex items-center gap-2 rounded border border-[#e2e2e2] px-3 text-[#777]">
              <Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search brand or work" className="min-w-0 flex-1 py-2 text-[13px] text-[#111] outline-none" />
            </label>
            <select value={brandFilter} onChange={(event) => setBrandFilter(event.target.value)} className="rounded border border-[#e2e2e2] bg-white px-3 py-2 text-[13px] text-[#222]">
              <option value="all">All brands · {works.length}</option>{brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
            </select>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded border border-[#e2e2e2] bg-white px-3 py-2 text-[13px] text-[#222]">
              <option value="all">All topics</option>{categories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </div>

          {loading ? <p className="py-12 text-center text-[13px] text-[#777]">Loading work items…</p> : filteredWorks.length ? (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              {filteredWorks.map((work) => (
                <article key={work.id} className="group flex min-w-0 gap-3 rounded border border-[#e8e8e8] p-3">
                  <div className="h-[92px] w-[74px] shrink-0 overflow-hidden rounded bg-[#f0f0ee]">
                    <img src={work.thumbnail || (work.type === 'pdf' ? work.image.replace(/\.pdf$/i, '-thumb.webp') : work.image)} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-semibold uppercase tracking-[.12em] text-[#7b847b]">{work.brand}</p>
                    <h2 className="mt-1 line-clamp-2 text-[13px] font-semibold leading-snug text-[#191919]">{work.title}</h2>
                    <p className="mt-1 truncate text-[11px] text-[#777]">{work.category}{work.collection ? ` · ${work.collection}` : ''}</p>
                    <div className="mt-2 flex items-center gap-1">
                      <button type="button" onClick={() => startEdit(work)} className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] text-[#555] hover:bg-[#f3f3f3]"><Pencil size={12} /> Edit</button>
                      <button type="button" onClick={() => void remove(work)} className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] text-red-600 hover:bg-red-50"><Trash2 size={12} /> Remove</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : <div className="grid justify-items-center py-12 text-center text-[#777]"><ImagePlus size={22} /><p className="mt-2 text-[13px]">No work items match these filters.</p></div>}
        </section>
      </div>
    </AdminLayout>
  );
};
