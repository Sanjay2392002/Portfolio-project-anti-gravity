import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { SiteSettings } from '../../types/settings';
import { ExternalLink, FileText, Save, Trash2, Upload } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [cv, setCv] = useState<{ url: string; download_url?: string; filename: string; bytes?: number; updated_at?: string | null } | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvError, setCvError] = useState<string | null>(null);
  const [cvMessage, setCvMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/settings')
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success || !result.data) throw new Error(result.error || 'Could not load settings.');
        if (!cancelled) setSettings(result.data);
      })
      .catch((loadError) => { if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Could not load settings.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);


  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/cv').then(async (response) => {
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Could not load CV details.');
      if (!cancelled) setCv(result.data || null);
    }).catch((loadError) => { if (!cancelled) setCvError(loadError instanceof Error ? loadError.message : 'Could not load CV details.'); });
    return () => { cancelled = true; };
  }, []);

  const uploadCv = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setCvUploading(true); setCvError(null); setCvMessage(null);
    try {
      const body = new FormData(); body.append('file', file);
      const response = await fetch('/api/admin/cv', { method: 'POST', body });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Could not upload the CV.');
      setCv(result.data); setCvMessage('CV uploaded and published.');
      setSettings((current) => current ? { ...current, resume_url: result.data.url } : current);
    } catch (uploadError) {
      setCvError(uploadError instanceof Error ? uploadError.message : 'Could not upload the CV.');
    } finally {
      setCvUploading(false); event.target.value = '';
    }
  };

  const removeCv = async () => {
    if (!window.confirm('Remove the current CV from the public portfolio?')) return;
    setCvError(null); setCvMessage(null);
    try {
      const response = await fetch('/api/admin/cv', { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Could not remove the CV.');
      setCv(null); setCvMessage('CV removed.');
      setSettings((current) => current ? { ...current, resume_url: '' } : current);
    } catch (removeError) { setCvError(removeError instanceof Error ? removeError.message : 'Could not remove the CV.'); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not save site settings.');
      setSettings(data.data);
      setMessage('Site settings saved.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save site settings.');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    setPasswordError(null);
    setPasswordMessage(null);
    if (newPassword.length < 14 || new TextEncoder().encode(newPassword).length > 72) {
      setPasswordError('Use a new password of at least 14 characters and no more than 72 UTF-8 bytes.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('The new password and confirmation do not match.');
      return;
    }

    setPasswordSaving(true);
    try {
      const response = await fetch('/api/admin/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Could not change the password.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage(result.message || 'Password changed.');
    } catch (passwordSaveError) {
      setPasswordError(passwordSaveError instanceof Error ? passwordSaveError.message : 'Could not change the password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-24 text-center text-[#8A8A8A]">Loading settings...</div>
      </AdminLayout>
    );
  }

  if (!settings) {
    return <AdminLayout><div role="alert" className="mx-auto mt-16 max-w-[560px] rounded-[8px] border border-red-200 bg-red-50 p-5 text-[14px] text-red-800">{error || 'Could not load site settings.'}</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSave} className="space-y-6 max-w-[900px] pb-20">
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5]">
          <div>
            <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">SITE SETTINGS</h1>
            <p className="text-[14px] text-[#6B6B6B]">Global portfolio configuration, contact, and metadata.</p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-[8px] bg-black text-white text-[13px] font-medium hover:bg-black/90 transition-colors disabled:opacity-50"
          >
            <Save size={14} />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

        {message && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] rounded-[6px]">
            {message}
          </div>
        )}
        {error && <div role="alert" className="rounded-[6px] border border-red-200 bg-red-50 p-3 text-[13px] text-red-700">{error}</div>}

        <section onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); void changePassword(); } }} className="space-y-4 rounded-[12px] border border-[#E5E5E5] bg-white p-6 shadow-xs">
          <div>
            <h2 className="text-[14px] font-bold uppercase tracking-wider text-[#111111]">Admin password</h2>
            <p className="mt-1 text-[12px] text-[#6B6B6B]">Changing your password signs out other active admin sessions.</p>
          </div>
          {passwordMessage && <div role="status" className="rounded border border-emerald-200 bg-emerald-50 p-3 text-[13px] text-emerald-800">{passwordMessage}</div>}
          {passwordError && <div role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-[13px] text-red-700">{passwordError}</div>}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-[12px] font-medium text-[#555]">Current password
              <input type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} maxLength={72} className="rounded border border-[#ddd] px-3 py-2 text-[13px] text-[#111]" />
            </label>
            <span className="hidden sm:block" />
            <label className="grid gap-1.5 text-[12px] font-medium text-[#555]">New password
              <input type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={14} maxLength={72} className="rounded border border-[#ddd] px-3 py-2 text-[13px] text-[#111]" />
            </label>
            <label className="grid gap-1.5 text-[12px] font-medium text-[#555]">Confirm new password
              <input type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={14} maxLength={72} className="rounded border border-[#ddd] px-3 py-2 text-[13px] text-[#111]" />
            </label>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={() => void changePassword()} disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword} className="rounded-[7px] bg-black px-4 py-2.5 text-[12px] font-medium text-white disabled:opacity-50">{passwordSaving ? 'Changing password…' : 'Change password'}</button>
          </div>
        </section>

        {/* Hero & Identity */}
        <div className="bg-white p-6 rounded-[12px] border border-[#E5E5E5] space-y-4 shadow-xs">
          <h2 className="text-[14px] font-bold text-[#111111] uppercase tracking-wider border-b border-[#E5E5E5] pb-2">
            Hero & Identity
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold uppercase text-[#111111] mb-1">
                Site Name / Brand Mark
              </label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#FDFDFD] border border-[#E5E5E5] rounded-[6px] text-[14px] text-[#111111]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold uppercase text-[#111111] mb-1">
                Hero Eyebrow
              </label>
              <input
                type="text"
                value={settings.hero_eyebrow}
                onChange={(e) => setSettings({ ...settings, hero_eyebrow: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#FDFDFD] border border-[#E5E5E5] rounded-[6px] text-[14px] text-[#111111]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[12px] font-semibold uppercase text-[#111111] mb-1">
                Hero Headline (supports line breaks)
              </label>
              <textarea
                rows={2}
                value={settings.hero_headline}
                onChange={(e) => setSettings({ ...settings, hero_headline: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#FDFDFD] border border-[#E5E5E5] rounded-[6px] text-[14px] font-semibold text-[#111111]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[12px] font-semibold uppercase text-[#111111] mb-1">
                Hero Supporting Statement
              </label>
              <textarea
                rows={2}
                value={settings.hero_description}
                onChange={(e) => setSettings({ ...settings, hero_description: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#FDFDFD] border border-[#E5E5E5] rounded-[6px] text-[14px] text-[#111111]"
              />
            </div>
          </div>
        </div>

        {/* Contact & Social Links */}
        <div className="bg-white p-6 rounded-[12px] border border-[#E5E5E5] space-y-4 shadow-xs">
          <h2 className="text-[14px] font-bold text-[#111111] uppercase tracking-wider border-b border-[#E5E5E5] pb-2">
            Contact & Social Profiles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold uppercase text-[#111111] mb-1">
                Primary Contact Email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#FDFDFD] border border-[#E5E5E5] rounded-[6px] text-[14px] text-[#111111]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold uppercase text-[#111111] mb-1">
                Mobile / Phone Number
              </label>
              <input
                type="text"
                value={settings.phone || ''}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                placeholder="+91 7010948452"
                className="w-full px-3.5 py-2 bg-[#FDFDFD] border border-[#E5E5E5] rounded-[6px] text-[14px] text-[#111111]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold uppercase text-[#111111] mb-1">
                LinkedIn Profile URL
              </label>
              <input
                type="url"
                value={settings.linkedin_url}
                onChange={(e) => setSettings({ ...settings, linkedin_url: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#FDFDFD] border border-[#E5E5E5] rounded-[6px] text-[14px] text-[#111111]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold uppercase text-[#111111] mb-1">
                Behance Profile URL
              </label>
              <input
                type="url"
                value={settings.behance_url}
                onChange={(e) => setSettings({ ...settings, behance_url: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#FDFDFD] border border-[#E5E5E5] rounded-[6px] text-[14px] text-[#111111]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold uppercase text-[#111111] mb-1">
                Footer Copyright Text
              </label>
              <input
                type="text"
                value={settings.footer_text}
                onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#FDFDFD] border border-[#E5E5E5] rounded-[6px] text-[14px] text-[#111111]"
              />
            </div>
          </div>
        </div>

        <section className="bg-white p-6 rounded-[12px] border border-[#E5E5E5] space-y-4 shadow-xs">
          <div className="flex items-start gap-3 border-b border-[#E5E5E5] pb-3">
            <FileText size={18} className="mt-0.5 text-[#6B6B6B]" />
            <div><h2 className="text-[14px] font-bold uppercase tracking-wider">CV / Resume</h2><p className="mt-1 text-[13px] text-[#6B6B6B]">Upload a PDF to replace the CV linked from your public portfolio.</p></div>
          </div>
          {cv ? <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-[8px] bg-[#F9F9F9] p-4">
            <div><p className="text-[14px] font-medium">{cv.filename}</p><p className="mt-1 text-[12px] text-[#777]">{cv.updated_at ? `Updated ${new Date(cv.updated_at).toLocaleDateString()}` : 'Current CV'}</p></div>
            <div className="flex flex-wrap gap-2">
              <a href={cv.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-[6px] border border-[#E5E5E5] bg-white px-3 py-2 text-[12px] font-medium"><ExternalLink size={14} /> Preview</a>
              <a href={cv.download_url || cv.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-[6px] border border-[#E5E5E5] bg-white px-3 py-2 text-[12px] font-medium"><FileText size={14} /> Download</a>
              <button type="button" onClick={removeCv} className="inline-flex items-center gap-2 rounded-[6px] border border-[#E5E5E5] bg-white px-3 py-2 text-[12px] font-medium text-[#9B2727]"><Trash2 size={14} /> Remove</button>
            </div>
          </div> : <p className="text-[13px] text-[#777]">No CV uploaded yet.</p>}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-[8px] bg-black px-4 py-2.5 text-[13px] font-medium text-white hover:bg-black/90">
            <Upload size={15} /><span>{cvUploading ? 'Uploading…' : cv ? 'Replace CV' : 'Upload CV'}</span>
            <input type="file" accept="application/pdf,.pdf" onChange={uploadCv} disabled={cvUploading} className="sr-only" />
          </label>
          {cvMessage && <p role="status" className="text-[13px] text-[#26734d]">{cvMessage}</p>}
          {cvError && <p role="alert" className="text-[13px] text-[#b42318]">{cvError}</p>}
        </section>

        {/* SEO Defaults */}
        <div className="bg-white p-6 rounded-[12px] border border-[#E5E5E5] space-y-4 shadow-xs">
          <h2 className="text-[14px] font-bold text-[#111111] uppercase tracking-wider border-b border-[#E5E5E5] pb-2">
            SEO & Social Metadata Defaults
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold uppercase text-[#111111] mb-1">
                Default SEO Title
              </label>
              <input
                type="text"
                value={settings.seo_title}
                onChange={(e) => setSettings({ ...settings, seo_title: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#FDFDFD] border border-[#E5E5E5] rounded-[6px] text-[14px] text-[#111111]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold uppercase text-[#111111] mb-1">
                Default Meta Description
              </label>
              <textarea
                rows={2}
                value={settings.seo_description}
                onChange={(e) => setSettings({ ...settings, seo_description: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#FDFDFD] border border-[#E5E5E5] rounded-[6px] text-[14px] text-[#111111]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold uppercase text-[#111111] mb-1">
                Default Open Graph (OG) Image URL
              </label>
              <input
                type="text"
                value={settings.og_image}
                onChange={(e) => setSettings({ ...settings, og_image: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#FDFDFD] border border-[#E5E5E5] rounded-[6px] text-[14px] text-[#111111]"
              />
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};
