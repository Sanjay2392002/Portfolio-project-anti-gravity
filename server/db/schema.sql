-- Sanjay Portfolio PostgreSQL Schema

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  session_version INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS media (
  id VARCHAR(64) PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL,
  width INTEGER,
  height INTEGER,
  url TEXT NOT NULL,
  alt_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category_id VARCHAR(64) REFERENCES categories(id) ON DELETE SET NULL,
  year VARCHAR(20) NOT NULL,
  role VARCHAR(255) NOT NULL,
  services JSONB DEFAULT '[]',
  description TEXT NOT NULL,
  hero_image TEXT NOT NULL,
  hero_media_id VARCHAR(64) REFERENCES media(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'draft', -- draft, published, archived
  featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  seo_title VARCHAR(255),
  seo_description TEXT,
  og_image TEXT,
  live_url TEXT,
  brand_accent_color VARCHAR(30) DEFAULT '#111111',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS content_blocks (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
  block_type VARCHAR(50) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id VARCHAR(64) PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS selected_works (
  id VARCHAR(64) PRIMARY KEY,
  brand VARCHAR(120) NOT NULL CHECK (length(trim(brand)) BETWEEN 1 AND 120),
  title VARCHAR(255) NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 255),
  image TEXT NOT NULL,
  type VARCHAR(10) NOT NULL DEFAULT 'image' CHECK (type IN ('image', 'pdf')),
  width INTEGER NOT NULL DEFAULT 0 CHECK (width >= 0),
  height INTEGER NOT NULL DEFAULT 0 CHECK (height >= 0),
  category VARCHAR(40) NOT NULL DEFAULT 'Other' CHECK (category IN ('Logo Presentation', 'Stories', 'Posters & Ads', 'Thumbnails', 'Carousels', 'Other')),
  collection VARCHAR(160) NOT NULL DEFAULT '',
  brand_order INTEGER NOT NULL DEFAULT 0 CHECK (brand_order >= 0),
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_selected_works_brand_order ON selected_works (brand_order, brand, sort_order, id);
CREATE INDEX IF NOT EXISTS idx_projects_status_order ON projects (status, sort_order, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_blocks_project_order ON content_blocks (project_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs (created_at DESC);

CREATE TABLE IF NOT EXISTS contact_messages (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(254) NOT NULL,
  message VARCHAR(5000) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages (created_at DESC);

CREATE TABLE IF NOT EXISTS app_meta (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE projects ADD COLUMN IF NOT EXISTS hero_media_id VARCHAR(64) REFERENCES media(id) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS session_version INTEGER NOT NULL DEFAULT 0;
