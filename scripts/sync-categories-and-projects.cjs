const fs = require('fs');
const path = require('path');

const categories = [
  {
    id: "cat_social_media",
    name: "Social Media",
    slug: "social-media",
    description: "High-impact social media campaigns, continuous carousels, festive posters, and digital creatives",
    sort_order: 1
  },
  {
    id: "cat_branding",
    name: "Branding",
    slug: "branding",
    description: "Complete visual identity systems, brand guidelines, color palettes, and corporate marks",
    sort_order: 2
  },
  {
    id: "cat_packaging",
    name: "Packaging",
    slug: "packaging",
    description: "Rigid box diecuts, retail packaging systems, FMCG labels, and 3D product mockups",
    sort_order: 3
  },
  {
    id: "cat_print",
    name: "Print",
    slug: "print",
    description: "Editorial publications, large-format hoardings, calendars, brochures, and exhibition collateral",
    sort_order: 4
  },
  {
    id: "cat_digital_web",
    name: "Digital / Web",
    slug: "digital-web",
    description: "Modern responsive web experiences, e-commerce digital catalogs, and digital UI interfaces",
    sort_order: 5
  },
  {
    id: "cat_campaigns",
    name: "Campaigns",
    slug: "campaigns",
    description: "Multi-asset brand campaigns, thematic storytelling, and continuous narrative sequences",
    sort_order: 6
  },
  {
    id: "cat_thumbnails",
    name: "Thumbnails",
    slug: "thumbnails",
    description: "High-CTR YouTube thumbnails, digital covers, and high-contrast editorial video artwork",
    sort_order: 7
  }
];

const categoryMap = {
  // Old or specific IDs -> New requested category
  "cat_social_media_posters": "cat_social_media",
  "cat_video_thumbnails": "cat_thumbnails",
  "cat_logo_design": "cat_branding",
  "cat_branding": "cat_branding",
  "cat_packaging_design": "cat_packaging",
  "cat_print_design": "cat_print",
  "cat_stall_design": "cat_print",
  "cat_website_design": "cat_digital_web",
  "cat_social_media": "cat_social_media",
  "cat_packaging": "cat_packaging",
  "cat_print": "cat_print",
  "cat_digital_web": "cat_digital_web",
  "cat_campaigns": "cat_campaigns",
  "cat_thumbnails": "cat_thumbnails",
};

// Project specific category assignments for best alignment
const projectCategoryOverrides = {
  "prj_bakers_stall": "cat_print",
  "prj_bakers_crush": "cat_packaging",
  "prj_bakers_social": "cat_campaigns",
  "prj_bkt_thumbnails": "cat_thumbnails",
  "prj_bkt_logo": "cat_branding",
  "prj_bkt_carousels": "cat_social_media",
  "prj_pavizham_campaigns": "cat_campaigns",
  "prj_pavizham_print": "cat_print",
  "prj_kings": "cat_branding",
  "prj_zen_thumbnails": "cat_thumbnails",
  "prj_zen_furniture": "cat_social_media",
  "prj_loft_posters": "cat_print",
  "prj_loft_calendars": "cat_social_media",
  "prj_woneten": "cat_campaigns",
  "prj_bea": "cat_thumbnails",
  "prj_siggis": "cat_packaging",
  "prj_bevis": "cat_packaging",
  "prj_sms": "cat_social_media",
  "prj_yaazhi": "cat_branding",
  "prj_thriveni": "cat_social_media",
  "prj_tmg_subiksham": "cat_campaigns",
};

// 1. Update server/data/db.json
const dbPath = path.resolve(__dirname, '../server/data/db.json');
if (fs.existsSync(dbPath)) {
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  db.categories = categories;

  if (Array.isArray(db.projects)) {
    db.projects.forEach(p => {
      const catId = projectCategoryOverrides[p.id] || categoryMap[p.category_id] || "cat_branding";
      const cat = categories.find(c => c.id === catId);
      p.category_id = catId;
      p.category_name = cat ? cat.name : "Design";
      p.category_slug = cat ? cat.slug : "design";
    });
  }

  // Update site settings defaults
  db.site_settings = db.site_settings || {};
  db.site_settings.hero_eyebrow = "Hi, I'm Sanjay.";
  db.site_settings.hero_headline = "VISUAL DESIGNER";
  db.site_settings.hero_description = "Creating visual identities, campaigns and digital experiences.";
  db.site_settings.dribbble_url = db.site_settings.dribbble_url || "https://dribbble.com";

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
  console.log('Updated server/data/db.json successfully!');
}

// 2. Generate updated src/data/portfolioData.ts
const dataFilePath = path.resolve(__dirname, '../src/data/portfolioData.ts');
let fileContent = fs.readFileSync(dataFilePath, 'utf-8');

// Replace fallbackCategories definition
const categoriesStr = `export const fallbackCategories: ProjectCategory[] = ${JSON.stringify(categories, null, 2)};`;
fileContent = fileContent.replace(
  /export const fallbackCategories: ProjectCategory\[\] = \[[\s\S]*?\];/m,
  categoriesStr
);

// Update each project's category in fallbackProjects
const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const projectsStr = `export const fallbackProjects: Project[] = ${JSON.stringify(db.projects, null, 2)};`;
fileContent = fileContent.replace(
  /export const fallbackProjects: Project\[\] = \[[\s\S]*?\];\s*export const fallbackContentBlocks/m,
  `${projectsStr}\n\nexport const fallbackContentBlocks`
);

fs.writeFileSync(dataFilePath, fileContent, 'utf-8');
console.log('Updated src/data/portfolioData.ts successfully!');
