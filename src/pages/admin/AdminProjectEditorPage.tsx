import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Project, ContentBlock, BlockType, ProjectCategory } from '../../types/project';
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Type,
  FileText,
  Video,
  Quote,
  Columns,
  Sparkles,
} from 'lucide-react';

const BLOCK_OPTIONS: { type: BlockType; label: string; icon: any }[] = [
  { type: 'TEXT', label: 'Text Section', icon: Type },
  { type: 'IMAGE', label: 'Single Image', icon: ImageIcon },
  { type: 'FULL_BLEED_IMAGE', label: 'Full Bleed Image', icon: ImageIcon },
  { type: 'TWO_IMAGE', label: 'Two Images Side-by-Side', icon: Columns },
  { type: 'THREE_IMAGE', label: 'Three Images', icon: Columns },
  { type: 'IMAGE_GRID', label: 'Image Grid', icon: Columns },
  { type: 'GALLERY', label: 'Gallery Carousel', icon: Columns },
  { type: 'HORIZONTAL_GALLERY', label: 'Horizontal Gallery', icon: Columns },
  { type: 'VIDEO', label: 'Video Showcase', icon: Video },
  { type: 'QUOTE', label: 'Editorial Quote', icon: Quote },
  { type: 'TWO_COLUMN', label: 'Two Column Text', icon: Columns },
  { type: 'THREE_COLUMN', label: 'Three Column Text', icon: Columns },
  { type: 'PROJECT_METADATA', label: 'Project Metadata Bar', icon: FileText },
  { type: 'SPACER', label: 'Spacing Divider', icon: Sparkles },
];

export const AdminProjectEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();

  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(!isNew);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [role, setRole] = useState('Visual Designer');
  const [services, setServices] = useState('Brand Identity, Art Direction, Visual Design');
  const [description, setDescription] = useState('');
  const [heroImage, setHeroImage] = useState('/assets/kings/kings-box-model.jpg');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [featured, setFeatured] = useState(false);
  const [liveUrl, setLiveUrl] = useState('');
  const [brandAccentColor, setBrandAccentColor] = useState('#111111');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [ogImage, setOgImage] = useState('');

  // Blocks State
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [selectedBlockToAdd, setSelectedBlockToAdd] = useState<BlockType>('TEXT');

  useEffect(() => {
    // Load categories
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data.length > 0) {
          setCategories(res.data);
          if (isNew) setCategoryId(res.data[0].id);
        }
      });

    // Load existing project if editing
    if (!isNew && id) {
      fetch(`/api/admin/projects/${id}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success && res.data) {
            const p: Project = res.data;
            setTitle(p.title);
            setSlug(p.slug);
            setCategoryId(p.category_id || '');
            setYear(p.year);
            setRole(p.role);
            setServices(Array.isArray(p.services) ? p.services.join(', ') : '');
            setDescription(p.description);
            setHeroImage(p.hero_image);
            setStatus(p.status);
            setFeatured(Boolean(p.featured));
            setLiveUrl(p.live_url || '');
            setBrandAccentColor(p.brand_accent_color || '#111111');
            setSeoTitle(p.seo_title || p.title);
            setSeoDescription(p.seo_description || p.description);
            setOgImage(p.og_image || p.hero_image);
            setBlocks(p.blocks || []);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id, isNew]);

  // Handle auto-slug on title change if new
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (isNew) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
    }
  };

  // Block management functions
  const addBlock = () => {
    const newBlock: ContentBlock = {
      id: 'blk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      project_id: id || 'temp',
      block_type: selectedBlockToAdd,
      sort_order: blocks.length,
      content: getDefaultContentForBlock(selectedBlockToAdd),
    };
    setBlocks([...blocks, newBlock]);
  };

  const removeBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    setBlocks(next);
  };

  const updateBlockContent = (index: number, field: string, value: any) => {
    const next = [...blocks];
    next[index] = {
      ...next[index],
      content: {
        ...next[index].content,
        [field]: value,
      },
    };
    setBlocks(next);
  };

  const getDefaultContentForBlock = (type: BlockType): Record<string, any> => {
    switch (type) {
      case 'TEXT':
        return { eyebrow: 'SECTION', headline: 'Section Headline', body: 'Descriptive narrative content...' };
      case 'IMAGE':
        return { url: '/assets/kings/kings-box-model.jpg', caption: 'Image caption' };
      case 'FULL_BLEED_IMAGE':
        return { url: '/assets/kings/kings-box-mockup.jpg', caption: 'Full-bleed caption' };
      case 'TWO_IMAGE':
        return {
          image1: { url: '/assets/kings/kings-shirt-1.jpg', caption: 'Left Image' },
          image2: { url: '/assets/kings/kings-shirt-2.jpg', caption: 'Right Image' },
        };
      case 'THREE_IMAGE':
        return {
          image1: { url: '/assets/kings/kings-shirt-1.jpg', caption: 'First' },
          image2: { url: '/assets/kings/kings-shirt-2.jpg', caption: 'Second' },
          image3: { url: '/assets/kings/kings-shirt-3.jpg', caption: 'Third' },
        };
      case 'IMAGE_GRID':
        return {
          items: [
            { url: '/assets/kings/kings-tags.jpg', caption: 'Grid 1' },
            { url: '/assets/kings/kings-packaging-detail.jpg', caption: 'Grid 2' },
          ],
        };
      case 'GALLERY':
      case 'HORIZONTAL_GALLERY':
        return {
          items: [
            { url: '/assets/kings/kings-box-model.jpg', caption: 'Slide 1' },
            { url: '/assets/kings/kings-packaging-1.jpg', caption: 'Slide 2' },
          ],
        };
      case 'VIDEO':
        return { url: '', caption: 'Video visual caption', autoPlay: true, loop: true };
      case 'QUOTE':
        return { quote: 'Design is not decoration; it is clarification.', author: 'Sanjay', title: 'Designer' };
      case 'TWO_COLUMN':
        return {
          leftTitle: 'Strategic Approach',
          leftContent: 'First column analysis and execution.',
          rightTitle: 'Craft & Engineering',
          rightContent: 'Second column details and materials.',
        };
      case 'THREE_COLUMN':
        return {
          col1Title: 'Col 1',
          col1Body: 'Body 1',
          col2Title: 'Col 2',
          col2Body: 'Body 2',
          col3Title: 'Col 3',
          col3Body: 'Body 3',
        };
      case 'PROJECT_METADATA':
        return { client: title, year: year, role: role, services: ['Art Direction', 'Design'] };
      case 'SPACER':
        return { height: 80 };
      default:
        return {};
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = {
      title,
      slug,
      category_id: categoryId,
      year,
      role,
      services: services.split(',').map((s) => s.trim()).filter(Boolean),
      description,
      hero_image: heroImage,
      status,
      featured,
      live_url: liveUrl,
      brand_accent_color: brandAccentColor,
      seo_title: seoTitle || title,
      seo_description: seoDescription || description,
      og_image: ogImage || heroImage,
      blocks,
    };

    try {
      const endpoint = isNew ? '/api/admin/projects' : `/api/admin/projects/${id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Project and content blocks saved successfully!', type: 'success' });
        if (isNew) {
          navigate(`/admin/projects/${data.data.id}/edit`);
        }
      } else {
        setMessage({ text: data.error || 'Failed to save project', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Error occurred while saving', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-24 text-center text-[#8A8A8A] text-[14px]">Loading project editor...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSave} className="space-y-8 pb-20">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 bg-[#F9F9F9]/95 backdrop-blur-md py-4 z-10 border-b border-[#E5E5E5]">
          <div className="flex items-center space-x-4">
            <Link
              to="/admin/projects"
              className="p-2 rounded-[6px] hover:bg-white text-[#6B6B6B] hover:text-black border border-transparent hover:border-[#E5E5E5]"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-[22px] font-bold text-[#111111] tracking-tight">
                {isNew ? 'CREATE NEW PROJECT' : `EDIT: ${title}`}
              </h1>
              <div className="text-[12px] text-[#8A8A8A]">
                {status.toUpperCase()} · {blocks.length} Content Blocks
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {!isNew && slug && (
              <Link
                to={`/project/${slug}`}
                target="_blank"
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-[6px] border border-[#E5E5E5] bg-white text-[13px] text-[#111111] font-medium hover:border-black transition-colors"
              >
                <Eye size={14} />
                <span>Preview</span>
              </Link>
            )}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 px-5 py-2 rounded-[6px] bg-black text-white text-[13px] font-medium hover:bg-black/90 transition-colors disabled:opacity-50"
            >
              <Save size={14} />
              <span>{saving ? 'Saving...' : 'Save Project'}</span>
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`p-3.5 rounded-[8px] text-[13px] border ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Section 1: Core Project Details */}
        <div className="bg-white p-6 rounded-[12px] border border-[#E5E5E5] space-y-5 shadow-xs">
          <h2 className="text-[15px] font-bold text-[#111111] uppercase tracking-wider pb-3 border-b border-[#E5E5E5]">
            1. Core Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[12px] font-semibold text-[#111111] uppercase mb-1">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Bakers International"
                className="w-full px-3.5 py-2 bg-[#FDFDFD] border border-[#E5E5E5] rounded-[6px] text-[14px] text-[#111111] focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#111111] uppercase mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. bakers-international"
                className="w-full px-3.5 py-2 bg-[#FDFDFD] border border-[#E5E5E5] rounded-[6px] text-[14px] text-[#111111] focus:outline-none focus:border-black font-mono text-[13px]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#111111] uppercase mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#FDFDFD] border border-[#E5E5E5] rounded-[6px] text-[14px] text-[#111111] focus:outline-none focus:border-black"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#111111] uppercase mb-1">
                Year
              </label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2026"
                className="w-full px-3.5 py-2 bg-[#FDFDFD] border border-[#E5E5E5] rounded-[6px] text-[14px] text-[#111111] focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#111111] uppercase mb-1">
                Role
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Visual Designer / Lead Designer"
                className="w-full px-3.5 py-2 bg-[#FDFDFD] border border-[#E5E5E5] rounded-[6px] text-[14px] text-[#111111] focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#111111] uppercase mb-1">
                Services (Comma-separated)
              </label>
              <input
                type="text"
                value={services}
                onChange={(e) => setServices(e.target.value)}
                placeholder="Brand Identity, Packaging, Art Direction"
                className="w-full px-3.5 py-2 bg-[#FDFDFD] border border-[#E5E5E5] rounded-[6px] text-[14px] text-[#111111] focus:outline-none focus:border-black"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[12px] font-semibold text-[#111111] uppercase mb-1">
                Project Hero Image URL *
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  required
                  value={heroImage}
                  onChange={(e) => setHeroImage(e.target.value)}
                  placeholder="/assets/kings/kings-box-model.jpg"
                  className="flex-1 px-3.5 py-2 bg-[#FDFDFD] border border-[#E5E5E5] rounded-[6px] text-[14px] text-[#111111] focus:outline-none focus:border-black"
                />
                <img
                  src={heroImage}
                  alt="Preview"
                  className="w-10 h-10 object-cover rounded-[4px] border border-[#E5E5E5] bg-[#F5F5F5]"
                  onError={(e: any) => {
                    e.target.src = '/favicon.svg';
                  }}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[12px] font-semibold text-[#111111] uppercase mb-1">
                Project Description / Narrative
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive description of the visual work, client challenge, and creative solution..."
                className="w-full px-3.5 py-2 bg-[#FDFDFD] border border-[#E5E5E5] rounded-[6px] text-[14px] text-[#111111] focus:outline-none focus:border-black leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#111111] uppercase mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#FDFDFD] border border-[#E5E5E5] rounded-[6px] text-[14px] text-[#111111] focus:outline-none focus:border-black"
              >
                <option value="draft">Draft (Unpublished)</option>
                <option value="published">Published (Live)</option>
                <option value="archived">Archived (Soft deleted)</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#111111] uppercase mb-1">
                Live External URL (Optional)
              </label>
              <input
                type="url"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3.5 py-2 bg-[#FDFDFD] border border-[#E5E5E5] rounded-[6px] text-[14px] text-[#111111] focus:outline-none focus:border-black"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Reusable Content Blocks System */}
        <div className="bg-white p-6 rounded-[12px] border border-[#E5E5E5] space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E5]">
            <div>
              <h2 className="text-[15px] font-bold text-[#111111] uppercase tracking-wider">
                2. Case Study Content Blocks ({blocks.length})
              </h2>
              <p className="text-[13px] text-[#6B6B6B]">
                Drag and order modular blocks to structure the visual storytelling.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={selectedBlockToAdd}
                onChange={(e: any) => setSelectedBlockToAdd(e.target.value)}
                className="px-3 py-2 bg-[#FDFDFD] border border-[#E5E5E5] rounded-[6px] text-[13px] text-[#111111]"
              >
                {BLOCK_OPTIONS.map((opt) => (
                  <option key={opt.type} value={opt.type}>
                    + Add {opt.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addBlock}
                className="px-4 py-2 bg-black text-white text-[13px] font-medium rounded-[6px] hover:bg-black/90 inline-flex items-center space-x-1"
              >
                <Plus size={14} />
                <span>Add Block</span>
              </button>
            </div>
          </div>

          {/* Block List */}
          <div className="space-y-4">
            {blocks.map((block, idx) => (
              <div
                key={block.id || idx}
                className="p-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded-[8px] space-y-4"
              >
                {/* Block Header */}
                <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-black text-white rounded-[4px]">
                      {idx + 1}
                    </span>
                    <span className="text-[13px] font-bold text-[#111111] uppercase tracking-wider">
                      {block.block_type.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveBlock(idx, 'up')}
                      className="p-1 text-[#6B6B6B] hover:text-black disabled:opacity-20"
                      title="Move Up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === blocks.length - 1}
                      onClick={() => moveBlock(idx, 'down')}
                      className="p-1 text-[#6B6B6B] hover:text-black disabled:opacity-20"
                      title="Move Down"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBlock(idx)}
                      className="p-1 text-red-500 hover:text-red-700"
                      title="Delete Block"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Inline Block Field Inputs Based on Block Type */}
                <div className="space-y-3 text-[13px]">
                  {/* TEXT */}
                  {block.block_type === 'TEXT' && (
                    <>
                      <input
                        type="text"
                        placeholder="Eyebrow (e.g. OVERVIEW)"
                        value={block.content.eyebrow || ''}
                        onChange={(e) => updateBlockContent(idx, 'eyebrow', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-[#E5E5E5] rounded-[4px]"
                      />
                      <input
                        type="text"
                        placeholder="Section Headline"
                        value={block.content.headline || ''}
                        onChange={(e) => updateBlockContent(idx, 'headline', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-[#E5E5E5] rounded-[4px] font-semibold"
                      />
                      <textarea
                        rows={3}
                        placeholder="Narrative body..."
                        value={block.content.body || ''}
                        onChange={(e) => updateBlockContent(idx, 'body', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-[#E5E5E5] rounded-[4px]"
                      />
                    </>
                  )}

                  {/* IMAGE or FULL_BLEED_IMAGE */}
                  {(block.block_type === 'IMAGE' || block.block_type === 'FULL_BLEED_IMAGE') && (
                    <>
                      <input
                        type="text"
                        placeholder="Image URL (e.g. /assets/kings/kings-box-model.jpg)"
                        value={block.content.url || ''}
                        onChange={(e) => updateBlockContent(idx, 'url', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-[#E5E5E5] rounded-[4px]"
                      />
                      <input
                        type="text"
                        placeholder="Image Caption"
                        value={block.content.caption || ''}
                        onChange={(e) => updateBlockContent(idx, 'caption', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-[#E5E5E5] rounded-[4px]"
                      />
                    </>
                  )}

                  {/* TWO_IMAGE */}
                  {block.block_type === 'TWO_IMAGE' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2 p-2 bg-white rounded border border-[#E5E5E5]">
                        <span className="font-semibold text-[11px] uppercase text-[#8A8A8A]">Image 1</span>
                        <input
                          type="text"
                          placeholder="Image 1 URL"
                          value={block.content.image1?.url || block.content.url1 || ''}
                          onChange={(e) =>
                            updateBlockContent(idx, 'image1', {
                              ...block.content.image1,
                              url: e.target.value,
                            })
                          }
                          className="w-full px-2.5 py-1 bg-[#F9F9F9] border border-[#E5E5E5] rounded text-[12px]"
                        />
                        <input
                          type="text"
                          placeholder="Caption 1"
                          value={block.content.image1?.caption || block.content.caption1 || ''}
                          onChange={(e) =>
                            updateBlockContent(idx, 'image1', {
                              ...block.content.image1,
                              caption: e.target.value,
                            })
                          }
                          className="w-full px-2.5 py-1 bg-[#F9F9F9] border border-[#E5E5E5] rounded text-[12px]"
                        />
                      </div>

                      <div className="space-y-2 p-2 bg-white rounded border border-[#E5E5E5]">
                        <span className="font-semibold text-[11px] uppercase text-[#8A8A8A]">Image 2</span>
                        <input
                          type="text"
                          placeholder="Image 2 URL"
                          value={block.content.image2?.url || block.content.url2 || ''}
                          onChange={(e) =>
                            updateBlockContent(idx, 'image2', {
                              ...block.content.image2,
                              url: e.target.value,
                            })
                          }
                          className="w-full px-2.5 py-1 bg-[#F9F9F9] border border-[#E5E5E5] rounded text-[12px]"
                        />
                        <input
                          type="text"
                          placeholder="Caption 2"
                          value={block.content.image2?.caption || block.content.caption2 || ''}
                          onChange={(e) =>
                            updateBlockContent(idx, 'image2', {
                              ...block.content.image2,
                              caption: e.target.value,
                            })
                          }
                          className="w-full px-2.5 py-1 bg-[#F9F9F9] border border-[#E5E5E5] rounded text-[12px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* QUOTE */}
                  {block.block_type === 'QUOTE' && (
                    <>
                      <textarea
                        rows={2}
                        placeholder="Quote statement..."
                        value={block.content.quote || ''}
                        onChange={(e) => updateBlockContent(idx, 'quote', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-[#E5E5E5] rounded-[4px]"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Author"
                          value={block.content.author || ''}
                          onChange={(e) => updateBlockContent(idx, 'author', e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-[#E5E5E5] rounded-[4px]"
                        />
                        <input
                          type="text"
                          placeholder="Title / Affiliation"
                          value={block.content.title || ''}
                          onChange={(e) => updateBlockContent(idx, 'title', e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-[#E5E5E5] rounded-[4px]"
                        />
                      </div>
                    </>
                  )}

                  {/* TWO_COLUMN */}
                  {block.block_type === 'TWO_COLUMN' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Left Column Title"
                          value={block.content.leftTitle || ''}
                          onChange={(e) => updateBlockContent(idx, 'leftTitle', e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-[#E5E5E5] rounded-[4px] font-semibold"
                        />
                        <textarea
                          rows={3}
                          placeholder="Left Column Content..."
                          value={block.content.leftContent || ''}
                          onChange={(e) => updateBlockContent(idx, 'leftContent', e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-[#E5E5E5] rounded-[4px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Right Column Title"
                          value={block.content.rightTitle || ''}
                          onChange={(e) => updateBlockContent(idx, 'rightTitle', e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-[#E5E5E5] rounded-[4px] font-semibold"
                        />
                        <textarea
                          rows={3}
                          placeholder="Right Column Content..."
                          value={block.content.rightContent || ''}
                          onChange={(e) => updateBlockContent(idx, 'rightContent', e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-[#E5E5E5] rounded-[4px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* VIDEO */}
                  {block.block_type === 'VIDEO' && (
                    <>
                      <input
                        type="text"
                        placeholder="Video URL (.mp4 or stream)"
                        value={block.content.url || ''}
                        onChange={(e) => updateBlockContent(idx, 'url', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-[#E5E5E5] rounded-[4px]"
                      />
                      <input
                        type="text"
                        placeholder="Caption"
                        value={block.content.caption || ''}
                        onChange={(e) => updateBlockContent(idx, 'caption', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-[#E5E5E5] rounded-[4px]"
                      />
                    </>
                  )}
                </div>
              </div>
            ))}

            {blocks.length === 0 && (
              <div className="p-8 text-center text-[#8A8A8A] border-2 border-dashed border-[#E5E5E5] rounded-[8px]">
                No content blocks added yet. Use the dropdown above to add your first block.
              </div>
            )}
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end space-x-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-[8px] bg-black text-white text-[14px] font-medium hover:bg-black/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Project'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};
