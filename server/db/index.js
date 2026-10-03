import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const JSON_DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (err) {
  // Read-only filesystem in serverless environments
}

let pool = null;
const isPostgresConfigured = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);

if ((process.env.NODE_ENV === 'production' || process.env.VERCEL) && !isPostgresConfigured) {
  throw new Error('DATABASE_URL must be configured in production; local JSON storage is not persistent on serverless deployments.');
}
const databaseSslDisabled = process.env.DATABASE_SSL?.trim().toLowerCase() === 'disable';
if (process.env.NODE_ENV === 'production' && databaseSslDisabled && isPostgresConfigured) {
  console.warn('[DB] Warning: DATABASE_SSL=disable in production.');
}

if (isPostgresConfigured) {
  pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: databaseSslDisabled ? false : { rejectUnauthorized: true },
    max: 10,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    statement_timeout: 15000,
  });
  pool.on('error', () => console.error('[DB] PostgreSQL pool reported an idle connection error.'));
  console.log('[DB] Configured for PostgreSQL');
} else {
  console.log('[DB] Using local development storage adapter (data/db.json)');
}

const emptyLocalData = () => ({
  users: [], categories: [], projects: [], content_blocks: [], media: [],
  site_settings: {}, activity_logs: [], contact_messages: [], selected_works: [], app_meta: {},
});

export const initializeDatabase = async () => {
  if (!pool) return;
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      await pool.query(fs.readFileSync(schemaPath, 'utf8'));
    }
    await pool.query('SELECT 1');
  } catch (err) {
    console.error('[DB] Database initialization failed:', err.message);
    throw err;
  }
};

const withTransaction = async (operation) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await operation(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const migrateLocalDataToPostgres = async () => {
  if (!pool) throw new Error('DATABASE_URL must point to PostgreSQL before importing local data.');
  const local = getLocalData();
  const rows = {
    users: local.users || [],
    categories: local.categories || [],
    media: local.media || [],
    projects: local.projects || [],
    content_blocks: local.content_blocks || [],
    selected_works: local.selected_works || [],
    contact_messages: local.contact_messages || [],
    activity_logs: local.activity_logs || [],
  };
  const hasRows = Object.values(rows).some((items) => items.length > 0);
  if (!hasRows) throw new Error('The local database contains no records to import.');

  const legacySettings = local.site_settings || {};
  const siteSettings = legacySettings.site_settings || legacySettings;
  const aboutContent = legacySettings.about_content || local.about_content || null;
  const supportedSettingKeys = ['site_name', 'hero_eyebrow', 'hero_headline', 'hero_description', 'email', 'phone', 'linkedin_url', 'behance_url', 'resume_url', 'availability', 'footer_text', 'seo_title', 'seo_description', 'og_image'];
  const supportedSettings = Object.fromEntries(supportedSettingKeys
    .filter((key) => typeof siteSettings[key] === 'string')
    .map((key) => [key, siteSettings[key]]));
  const allowedAboutFields = ['headline', 'subheadline', 'biography_paragraph_1', 'biography_paragraph_2', 'experiences', 'capabilities', 'tools', 'availability'];
  const supportedAbout = aboutContent && typeof aboutContent === 'object'
    ? Object.fromEntries(allowedAboutFields.filter((key) => Object.hasOwn(aboutContent, key)).map((key) => [key, aboutContent[key]]))
    : null;

  return withTransaction(async (client) => {
    const existing = await client.query(`
      SELECT EXISTS (SELECT 1 FROM users) OR EXISTS (SELECT 1 FROM categories) OR
             EXISTS (SELECT 1 FROM media) OR EXISTS (SELECT 1 FROM projects) OR
             EXISTS (SELECT 1 FROM content_blocks) OR EXISTS (SELECT 1 FROM selected_works) OR
             EXISTS (SELECT 1 FROM site_settings) OR EXISTS (SELECT 1 FROM activity_logs) OR
             EXISTS (SELECT 1 FROM contact_messages) OR EXISTS (SELECT 1 FROM app_meta) AS has_data
    `);
    if (existing.rows[0].has_data) throw new Error('The PostgreSQL database is not empty. Import is stopped to protect existing records.');

    for (const user of rows.users) {
      await client.query('INSERT INTO users (id, email, password_hash, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)', [user.id, String(user.email).trim().toLowerCase(), user.password_hash, user.role || 'admin', user.created_at || new Date(), user.updated_at || new Date()]);
    }
    for (const category of rows.categories) {
      await client.query('INSERT INTO categories (id, name, slug, description, sort_order, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)', [category.id, category.name, category.slug, category.description || '', category.sort_order || 0, category.created_at || new Date(), category.updated_at || new Date()]);
    }
    for (const media of rows.media) {
      await client.query('INSERT INTO media (id, filename, original_name, mime_type, file_size, width, height, url, alt_text, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', [media.id, media.filename, media.original_name || media.filename, media.mime_type, media.file_size || 0, media.width || null, media.height || null, media.url, media.alt_text || '', media.created_at || new Date()]);
    }
    const categoryIds = new Set(rows.categories.map((item) => item.id));
    const mediaIds = new Set(rows.media.map((item) => item.id));
    for (const project of rows.projects) {
      await client.query(
        `INSERT INTO projects (id, title, slug, category_id, year, role, services, description, hero_image, hero_media_id, status, featured, sort_order, seo_title, seo_description, og_image, live_url, brand_accent_color, created_at, updated_at, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
        [project.id, project.title, project.slug, categoryIds.has(project.category_id) ? project.category_id : null, String(project.year || new Date().getFullYear()), project.role || 'Graphic Designer', JSON.stringify(Array.isArray(project.services) ? project.services : []), project.description || '', project.hero_image || '', mediaIds.has(project.hero_media_id) ? project.hero_media_id : null, project.status || 'draft', Boolean(project.featured), Number.isInteger(project.sort_order) ? project.sort_order : 0, project.seo_title || null, project.seo_description || null, project.og_image || null, project.live_url || '', project.brand_accent_color || '#111111', project.created_at || new Date(), project.updated_at || new Date(), project.published_at || null]
      );
    }
    for (const block of rows.content_blocks) {
      await client.query('INSERT INTO content_blocks (id, project_id, block_type, sort_order, content, created_at, updated_at) VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)', [block.id, block.project_id, block.block_type, Number.isInteger(block.sort_order) ? block.sort_order : 0, JSON.stringify(block.content || {}), block.created_at || new Date(), block.updated_at || new Date()]);
    }
    for (const [index, work] of rows.selected_works.entries()) {
      await client.query(
        `INSERT INTO selected_works (id, brand, title, image, type, width, height, category, collection, brand_order, sort_order, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [String(work.id), work.brand, work.title, work.image, work.type || 'image', work.width || 0, work.height || 0, work.category || 'Other', work.collection || '', Number.isInteger(work.brand_order) ? work.brand_order : 0, Number.isInteger(work.sort_order) ? work.sort_order : index, work.created_at || new Date(), work.updated_at || new Date()]
      );
    }
    if (Object.keys(supportedSettings).length) {
      await client.query('INSERT INTO site_settings (key, value) VALUES ($1, $2::jsonb)', ['site_settings', JSON.stringify(supportedSettings)]);
    }
    if (supportedAbout) await client.query('INSERT INTO site_settings (key, value) VALUES ($1, $2::jsonb)', ['about_content', JSON.stringify(supportedAbout)]);
    for (const message of rows.contact_messages) {
      await client.query('INSERT INTO contact_messages (id, name, email, message, is_read, created_at) VALUES ($1, $2, $3, $4, $5, $6)', [message.id, message.name, message.email, message.message, Boolean(message.is_read ?? message.read), message.created_at || new Date()]);
    }
    for (const entry of rows.activity_logs) {
      await client.query('INSERT INTO activity_logs (id, action, details, created_at) VALUES ($1, $2, $3, $4)', [entry.id, entry.action, entry.details || '', entry.created_at || new Date()]);
    }
    for (const [key, value] of Object.entries(local.app_meta || {})) {
      await client.query('INSERT INTO app_meta (key, value) VALUES ($1, $2::jsonb)', [key, JSON.stringify(value)]);
    }
    await client.query('INSERT INTO app_meta (key, value) VALUES ($1, $2::jsonb)', ['local_json_import', JSON.stringify({ imported_at: new Date().toISOString(), counts: Object.fromEntries(Object.entries(rows).map(([key, items]) => [key, items.length])) })]);
    return Object.fromEntries(Object.entries(rows).map(([key, items]) => [key, items.length]));
  });
};

export const DEFAULT_FALLBACK_USERS = [
  {
    id: "usr_admin_sanjay_primary",
    username: "Sanjay",
    email: "sanjaymurugesan23@gmail.com",
    password_hash: "$2b$12$qa033Le0WiAnoN8Psl9qpeomEjYX9VcpmwB6SNZKwzsj6MeL1ARve",
    role: "admin",
    session_version: 4,
    updated_at: "2026-10-02T01:25:00.000Z"
  },
  {
    id: "usr_31c47d51-bfb5-4383-9c6a-33501264b141",
    username: "Sanjay",
    email: "sanjay@portfolio.com",
    password_hash: "$2b$12$qa033Le0WiAnoN8Psl9qpeomEjYX9VcpmwB6SNZKwzsj6MeL1ARve",
    role: "admin",
    session_version: 4,
    updated_at: "2026-10-02T01:25:00.000Z"
  }
];

const getDbFilePath = () => {
  const candidates = [
    JSON_DB_FILE,
    path.resolve(process.cwd(), 'server/data/db.json'),
    path.resolve(process.cwd(), 'data/db.json'),
    path.resolve('/var/task/server/data/db.json')
  ];
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) return candidate;
    } catch {
      // ignore
    }
  }
  return JSON_DB_FILE;
};

let memoryDbData = null;

// Local JSON file database helper
const getLocalData = () => {
  if (memoryDbData) {
    return memoryDbData;
  }
  const targetPath = getDbFilePath();
  try {
    if (fs.existsSync(targetPath)) {
      const raw = fs.readFileSync(targetPath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        memoryDbData = { ...emptyLocalData(), ...parsed };
        if (!Array.isArray(memoryDbData.users) || memoryDbData.users.length === 0) {
          memoryDbData.users = [...DEFAULT_FALLBACK_USERS];
        }
        return memoryDbData;
      }
    }
  } catch (err) {
    console.warn('[DB] Could not load JSON db file, using in-memory defaults:', err.message);
  }

  memoryDbData = {
    ...emptyLocalData(),
    users: [...DEFAULT_FALLBACK_USERS]
  };
  return memoryDbData;
};

const saveLocalData = (data) => {
  memoryDbData = data;
  try {
    const targetPath = getDbFilePath();
    const tempFile = `${targetPath}.${process.pid}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), { encoding: 'utf8', mode: 0o600 });
    fs.renameSync(tempFile, targetPath);
  } catch (err) {
    console.warn('[DB] Could not persist to local JSON file (read-only environment):', err.message);
  }
};

export const db = {
  isPostgres: Boolean(pool),
  close: async () => { if (pool) await pool.end(); },

  // Users
  getUserByEmail: async (email) => {
    const normalizedEmail = String(email).trim().toLowerCase();
    if (pool) {
      try {
        const res = await pool.query('SELECT * FROM users WHERE lower(email) = $1', [normalizedEmail]);
        if (res.rows[0]) return res.rows[0];
      } catch (err) {
        console.warn('[DB] Postgres query failed in getUserByEmail, checking local store:', err.message);
      }
    }
    const data = getLocalData();
    const found = (data.users || []).find((u) => u.email.toLowerCase() === normalizedEmail);
    if (found) return found;
    return DEFAULT_FALLBACK_USERS.find((u) => u.email.toLowerCase() === normalizedEmail) || null;
  },

  getUserByUsernameOrEmail: async (identifier) => {
    const term = String(identifier).trim().toLowerCase();
    if (pool) {
      try {
        const res = await pool.query(
          'SELECT * FROM users WHERE lower(email) = $1 OR lower(COALESCE(username, \'\')) = $1',
          [term]
        );
        if (res.rows[0]) return res.rows[0];
      } catch (err) {
        console.warn('[DB] Postgres query failed in getUserByUsernameOrEmail, checking local store:', err.message);
      }
    }
    const data = getLocalData();
    const found = (data.users || []).find((u) => {
      const emailMatches = u.email && u.email.toLowerCase() === term;
      const usernameMatches = u.username && u.username.toLowerCase() === term;
      const sanjayMatches = (term === 'sanjay') && (
        (u.username && u.username.toLowerCase() === 'sanjay') ||
        (u.email && (u.email.toLowerCase() === 'sanjay@portfolio.com' || u.email.toLowerCase() === 'sanjaymurugesan23@gmail.com'))
      );
      return emailMatches || usernameMatches || sanjayMatches;
    });
    if (found) return found;

    return DEFAULT_FALLBACK_USERS.find((u) => {
      return (
        (term === 'sanjay') ||
        (u.email.toLowerCase() === term) ||
        (u.username.toLowerCase() === term)
      );
    }) || null;
  },

  getUserById: async (id) => {
    if (pool) {
      try {
        const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (res.rows[0]) return res.rows[0];
      } catch (err) {
        console.warn('[DB] Postgres query failed in getUserById, checking local store:', err.message);
      }
    }
    const found = (getLocalData().users || []).find((user) => user.id === id);
    if (found) return found;
    return DEFAULT_FALLBACK_USERS.find((u) => u.id === id) || null;
  },

  getAdminUsers: async () => {
    if (pool) {
      try {
        const result = await pool.query("SELECT id, email, password_hash, role FROM users WHERE role = 'admin'");
        if (result.rows.length) return result.rows;
      } catch (err) {
        console.warn('[DB] Postgres query failed in getAdminUsers, checking local store:', err.message);
      }
    }
    const users = (getLocalData().users || []).filter((user) => user.role === 'admin');
    return users.length > 0 ? users : DEFAULT_FALLBACK_USERS;
  },

  createUser: async (user) => {
    const normalizedUser = { ...user, email: String(user.email).trim().toLowerCase() };
    if (pool) {
      const res = await pool.query(
        'INSERT INTO users (id, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [normalizedUser.id, normalizedUser.email, normalizedUser.password_hash, normalizedUser.role || 'admin']
      );
      return res.rows[0];
    }
    const data = getLocalData();
    if (data.users.some((existing) => existing.email.toLowerCase() === normalizedUser.email)) {
      const error = new Error('An account with this email already exists.');
      error.code = '23505';
      throw error;
    }
    data.users.push(normalizedUser);
    saveLocalData(data);
    return normalizedUser;
  },

  updateUserPassword: async (id, passwordHash) => {
    if (pool) {
      const result = await pool.query('UPDATE users SET password_hash = $2, session_version = session_version + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *', [id, passwordHash]);
      return result.rows[0] || null;
    }
    const data = getLocalData();
    const user = data.users.find((entry) => entry.id === id);
    if (user) {
      user.password_hash = passwordHash;
      user.session_version = (user.session_version || 0) + 1;
      user.updated_at = new Date().toISOString();
    }
    saveLocalData(data);
    return user || null;
  },

  updateUserRole: async (id, role) => {
    if (pool) {
      await pool.query('UPDATE users SET role = $2, session_version = session_version + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id, role]);
      return;
    }
    const data = getLocalData();
    const user = data.users.find((entry) => entry.id === id);
    if (user) {
      user.role = role;
      user.session_version = (user.session_version || 0) + 1;
      user.updated_at = new Date().toISOString();
    }
    saveLocalData(data);
  },

  // Categories
  getCategories: async () => {
    if (pool) {
      const res = await pool.query('SELECT * FROM categories ORDER BY sort_order ASC, name ASC');
      return res.rows;
    }
    const data = getLocalData();
    return (data.categories || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  },

  saveCategories: async (categories) => {
    if (pool) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const ids = categories.map((category) => category.id);
        const obsolete = await client.query('SELECT id FROM categories WHERE NOT (id = ANY($1::varchar[]))', [ids]);
        const obsoleteIds = obsolete.rows.map((row) => row.id);
        if (obsoleteIds.length) {
          const used = await client.query('SELECT 1 FROM projects WHERE category_id = ANY($1::varchar[]) LIMIT 1', [obsoleteIds]);
          if (used.rowCount) {
            const error = new Error('Reassign projects before removing a category.');
            error.code = 'CATEGORY_IN_USE';
            throw error;
          }
        }
        for (const category of categories) {
          await client.query(
            `INSERT INTO categories (id, name, slug, description, sort_order)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (id) DO UPDATE SET
               name = EXCLUDED.name,
               slug = EXCLUDED.slug,
               description = EXCLUDED.description,
               sort_order = EXCLUDED.sort_order,
               updated_at = CURRENT_TIMESTAMP`,
            [category.id, category.name, category.slug, category.description || '', category.sort_order]
          );
        }
        if (obsoleteIds.length) await client.query('DELETE FROM categories WHERE id = ANY($1::varchar[])', [obsoleteIds]);
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
      return categories;
    }
    const data = getLocalData();
    const retainedIds = new Set(categories.map((category) => category.id));
    const removedIds = data.categories.filter((category) => !retainedIds.has(category.id)).map((category) => category.id);
    if (removedIds.some((id) => data.projects.some((project) => project.category_id === id))) {
      const error = new Error('Reassign projects before removing a category.');
      error.code = 'CATEGORY_IN_USE';
      throw error;
    }
    data.categories = categories;
    saveLocalData(data);
    return categories;
  },

  // Projects
  getProjects: async (includeUnpublished = false) => {
    if (pool) {
      let query = `
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM projects p
        LEFT JOIN categories c ON p.category_id = c.id
      `;
      if (!includeUnpublished) {
        query += ` WHERE p.status = 'published'`;
      }
      query += ` ORDER BY p.sort_order ASC, p.created_at DESC`;
      const res = await pool.query(query);
      return res.rows;
    }

    const data = getLocalData();
    let list = data.projects || [];
    if (!includeUnpublished) {
      list = list.filter((p) => p.status === 'published');
    }
    return list
      .map((p) => {
        const cat = (data.categories || []).find((c) => c.id === p.category_id);
        return { ...p, category_name: cat?.name || 'Design', category_slug: cat?.slug || 'design' };
      })
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  },

  getProjectBySlug: async (slug, includeDraft = false) => {
    let project = null;
    let blocks = [];

    if (pool) {
      let query = `
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM projects p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.slug = $1
      `;
      if (!includeDraft) {
        query += ` AND p.status = 'published'`;
      }
      const res = await pool.query(query, [slug]);
      project = res.rows[0] || null;

      if (project) {
        const blocksRes = await pool.query(
          'SELECT * FROM content_blocks WHERE project_id = $1 ORDER BY sort_order ASC',
          [project.id]
        );
        blocks = blocksRes.rows;
      }
    } else {
      const data = getLocalData();
      project = (data.projects || []).find((p) => {
        if (p.slug !== slug) return false;
        if (!includeDraft && p.status !== 'published') return false;
        return true;
      });

      if (project) {
        const cat = (data.categories || []).find((c) => c.id === project.category_id);
        project = { ...project, category_name: cat?.name || 'Design', category_slug: cat?.slug || 'design' };
        blocks = (data.content_blocks || [])
          .filter((b) => b.project_id === project.id)
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      }
    }

    if (!project) return null;
    return { ...project, blocks };
  },

  getProjectById: async (id) => {
    if (pool) {
      const res = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
      const project = res.rows[0] || null;
      if (project) {
        const blocksRes = await pool.query(
          'SELECT * FROM content_blocks WHERE project_id = $1 ORDER BY sort_order ASC',
          [project.id]
        );
        project.blocks = blocksRes.rows;
      }
      return project;
    }

    const data = getLocalData();
    const project = (data.projects || []).find((p) => p.id === id);
    if (!project) return null;
    const blocks = (data.content_blocks || [])
      .filter((b) => b.project_id === project.id)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    return { ...project, blocks };
  },

  createProject: async (project, blocks = []) => {
    if (pool) {
      const created = await withTransaction(async (client) => {
        const res = await client.query(
        `INSERT INTO projects (
          id, title, slug, category_id, year, role, services, description,
          hero_image, hero_media_id, status, featured, sort_order,
          seo_title, seo_description, og_image, live_url, brand_accent_color,
          created_at, updated_at, published_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18,
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $19
        ) RETURNING *`,
        [
          project.id,
          project.title,
          project.slug,
          project.category_id || null,
          project.year,
          project.role,
          JSON.stringify(project.services || []),
          project.description,
          project.hero_image,
          project.hero_media_id || null,
          project.status || 'draft',
          Boolean(project.featured),
          project.sort_order || 0,
          project.seo_title || project.title,
          project.seo_description || project.description,
          project.og_image || project.hero_image,
          project.live_url || '',
          project.brand_accent_color || '#111111',
          project.status === 'published' ? new Date() : null,
        ]
        );
        const row = res.rows[0];

        for (let i = 0; i < blocks.length; i++) {
          const block = blocks[i];
          await client.query(
            `INSERT INTO content_blocks (id, project_id, block_type, sort_order, content)
             VALUES ($1, $2, $3, $4, $5)`,
            [block.id, row.id, block.block_type, i, JSON.stringify(block.content || {})]
          );
        }
        return row;
      });

      return await db.getProjectById(created.id);
    }

    const data = getLocalData();
    const newProject = {
      ...project,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published_at: project.status === 'published' ? new Date().toISOString() : null,
    };
    data.projects.push(newProject);

    if (blocks && blocks.length > 0) {
      blocks.forEach((b, idx) => {
        data.content_blocks.push({
          ...b,
          project_id: newProject.id,
          sort_order: idx,
          created_at: new Date().toISOString(),
        });
      });
    }

    saveLocalData(data);
    return db.getProjectById(newProject.id);
  },

  updateProject: async (id, projectUpdates, blocks = null) => {
    if (pool) {
      const allowedColumns = new Set(['title', 'slug', 'category_id', 'year', 'role', 'services', 'description', 'hero_image', 'hero_media_id', 'status', 'featured', 'sort_order', 'seo_title', 'seo_description', 'og_image', 'live_url', 'brand_accent_color', 'published_at']);
      const keys = Object.keys(projectUpdates);
      if (keys.some((key) => !allowedColumns.has(key))) {
        const error = new Error('Project update contains unsupported fields.');
        error.status = 400;
        throw error;
      }
      await withTransaction(async (client) => {
        if (keys.length) {
          const setClauses = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
          const values = keys.map((key) => key === 'services' ? JSON.stringify(projectUpdates[key]) : projectUpdates[key]);
          await client.query(
            `UPDATE projects SET ${setClauses}, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [id, ...values]
          );
        }
        if (blocks !== null) {
          await client.query('DELETE FROM content_blocks WHERE project_id = $1', [id]);
          for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            await client.query(
              `INSERT INTO content_blocks (id, project_id, block_type, sort_order, content)
               VALUES ($1, $2, $3, $4, $5)`,
              [block.id, id, block.block_type, i, JSON.stringify(block.content || {})]
            );
          }
        }
      });
      return await db.getProjectById(id);
    }

    const data = getLocalData();
    const idx = (data.projects || []).findIndex((p) => p.id === id);
    if (idx === -1) return null;

    data.projects[idx] = {
      ...data.projects[idx],
      ...projectUpdates,
      updated_at: new Date().toISOString(),
    };

    if (blocks !== null) {
      data.content_blocks = (data.content_blocks || []).filter((b) => b.project_id !== id);
      blocks.forEach((b, i) => {
        data.content_blocks.push({
          ...b,
          project_id: id,
          sort_order: i,
          updated_at: new Date().toISOString(),
        });
      });
    }

    saveLocalData(data);
    return db.getProjectById(id);
  },

  reorderProjects: async (orders) => {
    if (pool) {
      await withTransaction(async (client) => {
        for (const item of orders) {
          const result = await client.query('UPDATE projects SET sort_order = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [item.id, item.sort_order]);
          if (!result.rowCount) throw new Error('Project list changed while it was being reordered.');
        }
      });
      return db.getProjects(true);
    }
    const data = getLocalData();
    const byId = new Map(data.projects.map((project) => [project.id, project]));
    for (const item of orders) {
      const project = byId.get(item.id);
      if (!project) throw new Error('Project list changed while it was being reordered.');
      project.sort_order = item.sort_order;
      project.updated_at = new Date().toISOString();
    }
    saveLocalData(data);
    return db.getProjects(true);
  },

  deleteProject: async (id, permanent = false) => {
    if (!permanent) {
      return db.updateProject(id, { status: 'archived' });
    }
    if (pool) {
      await withTransaction((client) => client.query('DELETE FROM projects WHERE id = $1', [id]));
      return { success: true };
    }
    const data = getLocalData();
    data.projects = (data.projects || []).filter((p) => p.id !== id);
    data.content_blocks = (data.content_blocks || []).filter((b) => b.project_id !== id);
    saveLocalData(data);
    return { success: true };
  },

  // Brand-organized creative archive used by the public My Works page.
  getSelectedWorks: async () => {
    if (pool) {
      const result = await pool.query('SELECT * FROM selected_works ORDER BY brand_order, brand, sort_order, id');
      return result.rows;
    }
    return [...(getLocalData().selected_works || [])].sort((a, b) => a.brand_order - b.brand_order || a.brand.localeCompare(b.brand) || a.sort_order - b.sort_order);
  },

  seedSelectedWorks: async (brands, works) => {
    const entries = works.map((work, index) => ({
      ...work,
      id: String(work.id),
      brand_order: Math.max(0, brands.indexOf(work.brand)),
      sort_order: index,
      collection: work.collection || '',
    }));
    if (pool) {
      return withTransaction(async (client) => {
        const count = await client.query('SELECT COUNT(*)::int AS count FROM selected_works');
        if (count.rows[0].count) return false;
        await client.query(
          `INSERT INTO selected_works (id, brand, title, image, type, width, height, category, collection, brand_order, sort_order)
           SELECT item.id, item.brand, item.title, item.image, item.type, item.width, item.height,
                  item.category, item.collection, item.brand_order, item.sort_order
           FROM jsonb_to_recordset($1::jsonb) AS item(
             id text, brand varchar, title varchar, image text, type varchar, width integer, height integer,
             category varchar, collection varchar, brand_order integer, sort_order integer
           )`,
          [JSON.stringify(entries)]
        );
        return true;
      });
    }
    const data = getLocalData();
    if (data.selected_works.length) return false;
    data.selected_works = entries;
    saveLocalData(data);
    return true;
  },

  createSelectedWork: async (work) => {
    if (pool) {
      const result = await pool.query(
        `INSERT INTO selected_works (id, brand, title, image, type, width, height, category, collection, brand_order, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [work.id, work.brand, work.title, work.image, work.type, work.width, work.height, work.category, work.collection, work.brand_order, work.sort_order]
      );
      return result.rows[0];
    }
    const data = getLocalData();
    data.selected_works.push({ ...work, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    saveLocalData(data);
    return data.selected_works[data.selected_works.length - 1];
  },

  updateSelectedWork: async (id, updates) => {
    const allowedColumns = new Set(['brand', 'title', 'image', 'type', 'width', 'height', 'category', 'collection', 'brand_order', 'sort_order']);
    const keys = Object.keys(updates);
    if (keys.some((key) => !allowedColumns.has(key))) {
      const error = new Error('Selected work update contains unsupported fields.');
      error.status = 400;
      throw error;
    }
    if (pool) {
      if (!keys.length) return db.getSelectedWorkById(id);
      const clauses = keys.map((key, index) => `${key} = $${index + 2}`);
      const values = keys.map((key) => updates[key]);
      const result = await pool.query(
        `UPDATE selected_works SET ${clauses.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
        [id, ...values]
      );
      return result.rows[0] || null;
    }
    const data = getLocalData();
    const work = data.selected_works.find((item) => item.id === id);
    if (!work) return null;
    Object.assign(work, updates, { updated_at: new Date().toISOString() });
    saveLocalData(data);
    return work;
  },

  getSelectedWorkById: async (id) => {
    if (pool) {
      const result = await pool.query('SELECT * FROM selected_works WHERE id = $1', [id]);
      return result.rows[0] || null;
    }
    return getLocalData().selected_works.find((work) => work.id === id) || null;
  },

  deleteSelectedWork: async (id) => {
    if (pool) {
      const result = await pool.query('DELETE FROM selected_works WHERE id = $1 RETURNING id', [id]);
      return result.rowCount > 0;
    }
    const data = getLocalData();
    const previousCount = data.selected_works.length;
    data.selected_works = data.selected_works.filter((work) => work.id !== id);
    if (data.selected_works.length === previousCount) return false;
    saveLocalData(data);
    return true;
  },

  getMeta: async (key) => {
    if (pool) {
      const result = await pool.query('SELECT value FROM app_meta WHERE key = $1', [key]);
      return result.rows[0]?.value ?? null;
    }
    return getLocalData().app_meta[key] ?? null;
  },

  setMeta: async (key, value) => {
    if (pool) {
      await pool.query(
        `INSERT INTO app_meta (key, value, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
        [key, JSON.stringify(value)]
      );
      return value;
    }
    const data = getLocalData();
    data.app_meta[key] = value;
    saveLocalData(data);
    return value;
  },

  // Media Library
  getMedia: async () => {
    if (pool) {
      const res = await pool.query('SELECT * FROM media ORDER BY created_at DESC');
      return res.rows;
    }
    const data = getLocalData();
    return data.media || [];
  },

  createMedia: async (mediaItem) => {
    if (pool) {
      const res = await pool.query(
        `INSERT INTO media (id, filename, original_name, mime_type, file_size, width, height, url, alt_text)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          mediaItem.id,
          mediaItem.filename,
          mediaItem.original_name,
          mediaItem.mime_type,
          mediaItem.file_size,
          mediaItem.width || null,
          mediaItem.height || null,
          mediaItem.url,
          mediaItem.alt_text || '',
        ]
      );
      return res.rows[0];
    }
    const data = getLocalData();
    data.media = data.media || [];
    data.media.unshift(mediaItem);
    saveLocalData(data);
    return mediaItem;
  },

  deleteMedia: async (id) => {
    if (pool) {
      return withTransaction(async (client) => {
        const mediaResult = await client.query('SELECT id, url FROM media WHERE id = $1 FOR UPDATE', [id]);
        const media = mediaResult.rows[0];
        if (!media) return { deleted: false, inUse: false };
        const [projects, works, blocks] = await Promise.all([
          client.query('SELECT 1 FROM projects WHERE hero_media_id = $1 OR hero_image = $2 OR og_image = $2 LIMIT 1', [id, media.url]),
          client.query('SELECT 1 FROM selected_works WHERE image = $1 LIMIT 1', [media.url]),
          client.query('SELECT 1 FROM content_blocks WHERE strpos(content::text, $1) > 0 LIMIT 1', [media.url]),
        ]);
        if (projects.rowCount || works.rowCount || blocks.rowCount) return { deleted: false, inUse: true };
        await client.query('DELETE FROM media WHERE id = $1', [id]);
        return { deleted: true, inUse: false, media };
      });
    }
    const data = getLocalData();
    const media = (data.media || []).find((item) => item.id === id);
    if (!media) return { deleted: false, inUse: false };
    const inUse = data.projects.some((project) => project.hero_media_id === id || project.hero_image === media.url || project.og_image === media.url)
      || data.selected_works.some((work) => work.image === media.url)
      || data.content_blocks.some((block) => JSON.stringify(block.content || {}).includes(media.url));
    if (inUse) return { deleted: false, inUse: true };
    data.media = (data.media || []).filter((item) => item.id !== id);
    saveLocalData(data);
    return { deleted: true, inUse: false, media };
  },

  // Site Settings & About
  getSettings: async (key) => {
    if (pool) {
      const res = await pool.query('SELECT value FROM site_settings WHERE key = $1', [key]);
      return res.rows[0]?.value || null;
    }
    const data = getLocalData();
    return data.site_settings ? data.site_settings[key] || null : null;
  },

  setSettings: async (key, value) => {
    if (pool) {
      await pool.query(
        `INSERT INTO site_settings (key, value, updated_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
        [key, JSON.stringify(value)]
      );
      return value;
    }
    const data = getLocalData();
    data.site_settings = data.site_settings || {};
    data.site_settings[key] = value;
    saveLocalData(data);
    return value;
  },

  // Activity Log
  logActivity: async (action, details) => {
    const entry = {
      id: `act_${crypto.randomUUID()}`,
      action,
      details,
      created_at: new Date().toISOString(),
    };

    if (pool) {
      try {
        await pool.query('INSERT INTO activity_logs (id, action, details, created_at) VALUES ($1, $2, $3, $4)', [
          entry.id,
          entry.action,
          entry.details,
          entry.created_at,
        ]);
      } catch (err) {
        console.error('[DB] Failed to insert activity log.', { code: err.code || 'UNHANDLED' });
      }
      return entry;
    }

    const data = getLocalData();
    data.activity_logs = data.activity_logs || [];
    data.activity_logs.unshift(entry);
    if (data.activity_logs.length > 200) {
      data.activity_logs = data.activity_logs.slice(0, 200);
    }
    saveLocalData(data);
    return entry;
  },

  getActivityLogs: async (limit = 50) => {
    if (pool) {
      const res = await pool.query('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT $1', [limit]);
      return res.rows;
    }
    const data = getLocalData();
    return (data.activity_logs || []).slice(0, limit);
  },

  // Contact Messages
  createContactMessage: async ({ name, email, message }) => {
    const entry = {
      id: `msg_${crypto.randomUUID()}`,
      name: name?.trim() || 'Anonymous',
      email: email?.trim() || '',
      message: message?.trim() || '',
      created_at: new Date().toISOString(),
      read: false,
    };

    if (pool) {
      const result = await pool.query(
        `INSERT INTO contact_messages (id, name, email, message, is_read, created_at)
         VALUES ($1, $2, $3, $4, FALSE, $5) RETURNING *`,
        [entry.id, entry.name, entry.email, entry.message, entry.created_at]
      );
      return result.rows[0];
    }
    const data = getLocalData();
    data.contact_messages = data.contact_messages || [];
    data.contact_messages.unshift(entry);
    saveLocalData(data);
    return entry;
  },

  getContactMessages: async (limit = 100) => {
    if (pool) {
      const result = await pool.query('SELECT id, name, email, message, is_read AS read, created_at FROM contact_messages ORDER BY created_at DESC, id DESC LIMIT $1', [limit]);
      return result.rows;
    }
    const data = getLocalData();
    return (data.contact_messages || []).slice(0, limit);
  },

  updateContactMessage: async (id, read) => {
    if (pool) {
      const result = await pool.query('UPDATE contact_messages SET is_read = $2 WHERE id = $1 RETURNING id, name, email, message, is_read AS read, created_at', [id, read]);
      return result.rows[0] || null;
    }
    const data = getLocalData();
    const message = data.contact_messages.find((entry) => entry.id === id);
    if (!message) return null;
    message.read = read;
    saveLocalData(data);
    return message;
  },

  deleteContactMessage: async (id) => {
    if (pool) {
      const result = await pool.query('DELETE FROM contact_messages WHERE id = $1 RETURNING id', [id]);
      return result.rowCount > 0;
    }
    const data = getLocalData();
    const previousCount = (data.contact_messages || []).length;
    data.contact_messages = (data.contact_messages || []).filter((m) => m.id !== id);
    if (data.contact_messages.length === previousCount) return false;
    saveLocalData(data);
    return data.contact_messages.length < previousCount;
  },
};
