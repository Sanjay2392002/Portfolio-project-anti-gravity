import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AboutContent, CapabilityGroup, ExperienceItem } from '../../types/settings';
import { Plus, Save, Trash2 } from 'lucide-react';

const defaults: AboutContent = {
  headline: 'Hello, I’m Sanjay.',
  subheadline: 'Graphic designer focused on social media and UI design.',
  biography_paragraph_1: 'I create social media posters and clear user interfaces for brands and digital products.',
  biography_paragraph_2: 'My work focuses on strong layout, clear typography, and making each message easy to understand.',
  experiences: [{ id: 'experience-1', role: 'Graphic Designer', company: 'Bevis Creatives', period: '', description: 'Social media posters, campaign design, and user interface work.' }],
  capabilities: [
    { category: 'SOCIAL MEDIA', skills: ['Posters & ads', 'Stories', 'Carousels', 'Thumbnails'] },
    { category: 'UI DESIGN', skills: ['User interfaces', 'Layout & hierarchy', 'Digital product screens'] },
  ],
  tools: ['Adobe Photoshop', 'Adobe Illustrator', 'Adobe InDesign', 'Figma', 'Vibe coding'],
  availability: 'Available for design work.',
};

const cleanAbout = (value: Partial<AboutContent>): AboutContent => ({
  ...defaults,
  headline: typeof value.headline === 'string' ? value.headline : defaults.headline,
  subheadline: typeof value.subheadline === 'string' ? value.subheadline : defaults.subheadline,
  biography_paragraph_1: typeof value.biography_paragraph_1 === 'string' ? value.biography_paragraph_1 : defaults.biography_paragraph_1,
  biography_paragraph_2: typeof value.biography_paragraph_2 === 'string' ? value.biography_paragraph_2 : defaults.biography_paragraph_2,
  availability: typeof value.availability === 'string' ? value.availability : defaults.availability,
  experiences: Array.isArray(value.experiences) ? value.experiences : defaults.experiences,
  capabilities: Array.isArray(value.capabilities) ? value.capabilities : defaults.capabilities,
  tools: Array.isArray(value.tools) ? value.tools.filter((tool): tool is string => typeof tool === 'string') : defaults.tools,
});

export const AdminAboutPage: React.FC = () => {
  const [about, setAbout] = useState<AboutContent>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toolDraft, setToolDraft] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/about')
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error || 'Could not load profile content.');
        if (!cancelled && result.data) setAbout(cleanAbout(result.data));
      })
      .catch((loadError) => { if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Could not load profile content.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const setExperience = (index: number, field: keyof ExperienceItem, value: string) => {
    setAbout((current) => ({ ...current, experiences: current.experiences.map((item, i) => i === index ? { ...item, [field]: value } : item) }));
  };

  const setCapability = (index: number, field: keyof CapabilityGroup, value: string) => {
    setAbout((current) => ({
      ...current,
      capabilities: current.capabilities.map((group, i) => i !== index ? group : {
        ...group,
        [field]: field === 'skills' ? value.split(',').map((skill) => skill.trim()).filter(Boolean) : value,
      }),
    }));
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/admin/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(about),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Could not save profile content.');
      setAbout(cleanAbout(result.data));
      setMessage('Profile content saved.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save profile content.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLayout><p className="py-24 text-center text-[13px] text-[#777]">Loading profile content…</p></AdminLayout>;

  return (
    <AdminLayout>
      <form onSubmit={save} className="max-w-[1000px] space-y-6 pb-16">
        <header className="flex flex-col gap-3 border-b border-[#e5e5e5] pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[.16em] text-[#6f786f]">Homepage profile</p>
            <h1 className="text-[28px] font-bold tracking-tight text-[#111]">ABOUT &amp; EXPERIENCE</h1>
            <p className="mt-1 text-[14px] text-[#6b6b6b]">Edit the profile, experience, skills, and capabilities shown on the site.</p>
          </div>
          <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-[7px] bg-black px-4 py-2.5 text-[13px] font-medium text-white disabled:opacity-50"><Save size={14} />{saving ? 'Saving…' : 'Save changes'}</button>
        </header>

        {message && <div role="status" className="rounded border border-emerald-200 bg-emerald-50 p-3 text-[13px] text-emerald-800">{message}</div>}
        {error && <div role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-[13px] text-red-700">{error}</div>}

        <section className="space-y-4 rounded-[10px] border border-[#e5e5e5] bg-white p-5">
          <div><h2 className="text-[15px] font-semibold">Profile</h2><p className="mt-1 text-[12px] text-[#777]">This copy appears in the homepage introduction.</p></div>
          <label className="grid gap-1.5 text-[12px] font-medium text-[#555]">First paragraph
            <textarea required maxLength={1500} rows={3} value={about.biography_paragraph_1} onChange={(event) => setAbout({ ...about, biography_paragraph_1: event.target.value })} className="rounded border border-[#ddd] px-3 py-2.5 text-[13px] text-[#111]" />
          </label>
          <label className="grid gap-1.5 text-[12px] font-medium text-[#555]">Second paragraph
            <textarea required maxLength={1500} rows={3} value={about.biography_paragraph_2} onChange={(event) => setAbout({ ...about, biography_paragraph_2: event.target.value })} className="rounded border border-[#ddd] px-3 py-2.5 text-[13px] text-[#111]" />
          </label>
        </section>

        <section className="space-y-4 rounded-[10px] border border-[#e5e5e5] bg-white p-5">
          <div className="flex items-start justify-between gap-3"><div><h2 className="text-[15px] font-semibold">Experience</h2><p className="mt-1 text-[12px] text-[#777]">The first entry is featured on the homepage.</p></div>
            <button type="button" onClick={() => setAbout((current) => ({ ...current, experiences: [...current.experiences, { id: crypto.randomUUID(), role: '', company: '', period: '', description: '' }] }))} className="inline-flex shrink-0 items-center gap-1 rounded border border-[#ddd] px-3 py-2 text-[12px] text-[#333]"><Plus size={13} /> Add role</button>
          </div>
          <div className="space-y-3">
            {about.experiences.map((item, index) => <article key={item.id} className="grid gap-3 rounded border border-[#e8e8e8] bg-[#fafafa] p-3 sm:grid-cols-2">
              <label className="grid gap-1 text-[11px] font-semibold uppercase text-[#777]">Company<input required maxLength={120} value={item.company} onChange={(event) => setExperience(index, 'company', event.target.value)} className="rounded border border-[#ddd] bg-white px-3 py-2 text-[13px] font-normal normal-case text-[#111]" /></label>
              <label className="grid gap-1 text-[11px] font-semibold uppercase text-[#777]">Role<input required maxLength={120} value={item.role} onChange={(event) => setExperience(index, 'role', event.target.value)} className="rounded border border-[#ddd] bg-white px-3 py-2 text-[13px] font-normal normal-case text-[#111]" /></label>
              <label className="grid gap-1 text-[11px] font-semibold uppercase text-[#777]">Period<input maxLength={80} value={item.period} onChange={(event) => setExperience(index, 'period', event.target.value)} placeholder="Optional" className="rounded border border-[#ddd] bg-white px-3 py-2 text-[13px] font-normal normal-case text-[#111]" /></label>
              <label className="grid gap-1 text-[11px] font-semibold uppercase text-[#777]">Description<input maxLength={500} value={item.description || ''} onChange={(event) => setExperience(index, 'description', event.target.value)} className="rounded border border-[#ddd] bg-white px-3 py-2 text-[13px] font-normal normal-case text-[#111]" /></label>
              <button type="button" onClick={() => setAbout((current) => ({ ...current, experiences: current.experiences.filter((_, i) => i !== index) }))} className="inline-flex items-center gap-1 justify-self-start rounded px-2 py-1 text-[11px] text-red-600 hover:bg-red-50"><Trash2 size={12} /> Remove experience</button>
            </article>)}
          </div>
        </section>

        <section className="space-y-4 rounded-[10px] border border-[#e5e5e5] bg-white p-5">
          <div><h2 className="text-[15px] font-semibold">Skills &amp; software</h2><p className="mt-1 text-[12px] text-[#777]">These items appear in the homepage skills section.</p></div>
          <div className="flex flex-wrap gap-2">
            {about.tools.map((tool, index) => <span key={`${tool}-${index}`} className="inline-flex items-center gap-2 rounded border border-[#ddd] bg-[#fafafa] py-1 pl-3 pr-1 text-[12px] text-[#333]">{tool}<button type="button" aria-label={`Remove ${tool}`} onClick={() => setAbout((current) => ({ ...current, tools: current.tools.filter((_, i) => i !== index) }))} className="rounded p-1 text-[#777] hover:bg-red-50 hover:text-red-600"><Trash2 size={12} /></button></span>)}
          </div>
          <div className="flex gap-2"><input value={toolDraft} onChange={(event) => setToolDraft(event.target.value)} maxLength={80} placeholder="Add a skill or software" className="min-w-0 flex-1 rounded border border-[#ddd] px-3 py-2 text-[13px]" /><button type="button" onClick={() => { const tool = toolDraft.trim(); if (tool && !about.tools.includes(tool)) setAbout((current) => ({ ...current, tools: [...current.tools, tool] })); setToolDraft(''); }} className="inline-flex items-center gap-1 rounded border border-[#ddd] px-3 py-2 text-[12px]"><Plus size={13} /> Add</button></div>
        </section>

        <section className="space-y-4 rounded-[10px] border border-[#e5e5e5] bg-white p-5">
          <div className="flex items-start justify-between gap-3"><div><h2 className="text-[15px] font-semibold">Capabilities</h2><p className="mt-1 text-[12px] text-[#777]">Use commas between the skills in each group.</p></div>
            <button type="button" onClick={() => setAbout((current) => ({ ...current, capabilities: [...current.capabilities, { category: '', skills: [] }] }))} className="inline-flex shrink-0 items-center gap-1 rounded border border-[#ddd] px-3 py-2 text-[12px]"><Plus size={13} /> Add group</button>
          </div>
          <div className="space-y-3">
            {about.capabilities.map((group, index) => <article key={`${group.category}-${index}`} className="grid gap-3 rounded border border-[#e8e8e8] bg-[#fafafa] p-3 sm:grid-cols-[.65fr_1.35fr_auto] sm:items-end">
              <label className="grid gap-1 text-[11px] font-semibold uppercase text-[#777]">Group<input required maxLength={80} value={group.category} onChange={(event) => setCapability(index, 'category', event.target.value)} className="rounded border border-[#ddd] bg-white px-3 py-2 text-[13px] font-normal normal-case text-[#111]" /></label>
              <label className="grid gap-1 text-[11px] font-semibold uppercase text-[#777]">Skills<input value={group.skills.join(', ')} onChange={(event) => setCapability(index, 'skills', event.target.value)} className="rounded border border-[#ddd] bg-white px-3 py-2 text-[13px] font-normal normal-case text-[#111]" /></label>
              <button type="button" onClick={() => setAbout((current) => ({ ...current, capabilities: current.capabilities.filter((_, i) => i !== index) }))} aria-label="Remove capability group" className="rounded p-2 text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
            </article>)}
          </div>
        </section>

        <label className="grid gap-1.5 rounded-[10px] border border-[#e5e5e5] bg-white p-5 text-[12px] font-medium text-[#555]">Availability note
          <input maxLength={160} value={about.availability || ''} onChange={(event) => setAbout({ ...about, availability: event.target.value })} className="rounded border border-[#ddd] px-3 py-2 text-[13px] text-[#111]" />
        </label>
      </form>
    </AdminLayout>
  );
};
