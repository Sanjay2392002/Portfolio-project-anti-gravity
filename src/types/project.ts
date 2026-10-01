export type ProjectStatus = 'draft' | 'published' | 'archived';

export type BlockType =
  | 'TEXT'
  | 'IMAGE'
  | 'FULL_BLEED_IMAGE'
  | 'TWO_IMAGE'
  | 'THREE_IMAGE'
  | 'IMAGE_GRID'
  | 'GALLERY'
  | 'HORIZONTAL_GALLERY'
  | 'VIDEO'
  | 'QUOTE'
  | 'TWO_COLUMN'
  | 'THREE_COLUMN'
  | 'PROJECT_METADATA'
  | 'SPACER';

export interface ContentBlock {
  id: string;
  project_id: string;
  block_type: BlockType;
  sort_order: number;
  content: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  client?: string;
  category_id?: string;
  category_name?: string;
  category_slug?: string;
  year: string;
  role: string;
  services?: string[];
  description: string;
  hero_image: string;
  status: ProjectStatus;
  featured: boolean;
  sort_order: number;
  seo_title?: string;
  seo_description?: string;
  og_image?: string;
  live_url?: string;
  brand_accent_color?: string;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
  blocks?: ContentBlock[];
}

export interface MediaItem {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  width?: number;
  height?: number;
  url: string;
  alt_text?: string;
  created_at?: string;
}
