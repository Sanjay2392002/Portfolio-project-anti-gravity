import React, { useEffect, useState, useRef } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { MediaItem } from '../../types/project';
import { Upload, Search, Trash2, Copy, Check, Eye } from 'lucide-react';

export const AdminMediaPage: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/media');
      const data = await res.json();
      if (data.success) {
        setMediaList(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        formData.append('alt_text', files[i].name);

        await fetch('/api/admin/media', {
          method: 'POST',
          body: formData,
        });
      }
      await loadMedia();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this media asset permanently?')) return;
    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMediaList(mediaList.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = mediaList.filter((m) =>
    (m.filename + (m.alt_text || '')).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">MEDIA LIBRARY</h1>
            <p className="text-[14px] text-[#6B6B6B]">
              Upload, search, and manage project images and video assets.
            </p>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept="image/*,video/*"
              className="hidden"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-[8px] bg-black text-white text-[13px] font-medium hover:bg-black/90 transition-colors disabled:opacity-50"
            >
              <Upload size={16} />
              <span>{uploading ? 'Uploading...' : 'Upload Media'}</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-[10px] border border-[#E5E5E5] flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
            <input
              type="text"
              placeholder="Search assets by filename..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-[#F9F9F9] border border-[#E5E5E5] rounded-[6px] text-[13px] focus:outline-none focus:border-black"
            />
          </div>
          <div className="text-[12px] text-[#8A8A8A]">{filtered.length} assets</div>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-[8px] border border-[#E5E5E5] overflow-hidden flex flex-col justify-between hover:shadow-sm transition-shadow"
            >
              <div className="relative aspect-square bg-[#F5F5F5] overflow-hidden flex items-center justify-center">
                {item.mime_type?.startsWith('video') ? (
                  <video src={item.url} className="w-full h-full object-cover" />
                ) : (
                  <img
                    src={item.url}
                    alt={item.alt_text || item.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}

                {/* Quick overlay controls */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(item.url, item.id)}
                    className="p-2 bg-white text-[#111111] rounded-full hover:scale-105 transition-transform"
                    title="Copy URL"
                  >
                    {copiedId === item.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-white text-red-600 rounded-full hover:scale-105 transition-transform"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="p-2.5">
                <div className="text-[12px] font-medium text-[#111111] truncate" title={item.original_name || item.filename}>
                  {item.original_name || item.filename}
                </div>
                <div className="text-[11px] text-[#8A8A8A] mt-0.5 flex items-center justify-between">
                  <span>{(item.file_size / 1024).toFixed(0)} KB</span>
                  <span>{item.mime_type?.split('/')[1]?.toUpperCase()}</span>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && !loading && (
            <div className="col-span-full py-16 text-center text-[#8A8A8A] text-[14px]">
              No media found in library. Use the upload button to add images.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
