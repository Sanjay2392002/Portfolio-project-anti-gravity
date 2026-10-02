import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, initializeDatabase } from './index.js';
import { isValidEmail } from '../utils/validation.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let selectedWorkCatalog = { brands: [], works: [] };
try {
  const catalogPath = path.resolve(__dirname, '../../shared/selectedWorks.json');
  if (fs.existsSync(catalogPath)) {
    selectedWorkCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  }
} catch (err) {
  console.warn('[SEED] Could not load selectedWorks.json:', err.message);
}

export const seedDatabase = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'sanjaymurugesan23@gmail.com').trim().toLowerCase();
    const adminUsername = (process.env.ADMIN_USERNAME || 'Sanjay').trim();
    const rawAdminPassword = (process.env.ADMIN_PASSWORD || 'Sanjay2392@!').trim();
    const adminPassword = (rawAdminPassword.length >= 8 && Buffer.byteLength(rawAdminPassword, 'utf8') <= 72)
      ? rawAdminPassword
      : 'Sanjay2392@!';
    const strongBootstrapPassword = typeof adminPassword === 'string' && adminPassword.length >= 8 && Buffer.byteLength(adminPassword, 'utf8') <= 72;
    if (!isValidEmail(adminEmail)) {
      console.warn('[SEED] ADMIN_EMAIL is not a valid email address; using default.');
    }
    const configuredUser = await db.getUserByEmail(adminEmail);
    const admins = await db.getAdminUsers();
    const legacyAdmins = [];
    for (const admin of admins) {
      if (await bcrypt.compare('admin123', admin.password_hash)) legacyAdmins.push(admin);
    }

    for (const legacyAdmin of legacyAdmins) {
      if (legacyAdmin.email === adminEmail) {
        await db.updateUserPassword(legacyAdmin.id, await bcrypt.hash(adminPassword, 12));
      } else {
        await db.updateUserPassword(legacyAdmin.id, await bcrypt.hash(crypto.randomBytes(48).toString('base64url'), 12));
        await db.updateUserRole(legacyAdmin.id, 'disabled');
      }
    }

    if (!configuredUser) {
      const password_hash = await bcrypt.hash(adminPassword, 12);
      await db.createUser({
        id: `usr_${crypto.randomUUID()}`,
        username: adminUsername,
        email: adminEmail,
        password_hash,
        role: 'admin',
      });
    } else if (configuredUser.role !== 'admin') {
      await db.updateUserPassword(configuredUser.id, await bcrypt.hash(adminPassword, 12));
      await db.updateUserRole(configuredUser.id, 'admin');
    }

  if (!(await db.getSelectedWorks()).length) {
    await db.seedSelectedWorks(selectedWorkCatalog.brands, selectedWorkCatalog.works);
  }

  if (await db.getMeta('initial_portfolio_seed_complete')) return;
  const existingProjects = await db.getProjects(true);
  const existingCategories = await db.getCategories();
  const existingSettings = await db.getSettings('site_settings');
  if (existingProjects.length || existingCategories.length || existingSettings) {
    await db.setMeta('initial_portfolio_seed_complete', true);
    return;
  }

  console.log('[SEED] Initial portfolio data is being installed.');

  // 2. Categories (Exact requested disciplines)
  const categories = [
    {
      id: 'cat_social_media',
      name: 'Social Media',
      slug: 'social-media',
      description: 'High-impact social media campaigns, continuous carousels, festive posters, and digital creatives',
      sort_order: 1,
    },
    {
      id: 'cat_branding',
      name: 'Branding',
      slug: 'branding',
      description: 'Complete visual identity systems, brand guidelines, color palettes, and corporate marks',
      sort_order: 2,
    },
    {
      id: 'cat_packaging',
      name: 'Packaging',
      slug: 'packaging',
      description: 'Rigid box diecuts, retail packaging systems, FMCG labels, and 3D product mockups',
      sort_order: 3,
    },
    {
      id: 'cat_print',
      name: 'Print',
      slug: 'print',
      description: 'Editorial publications, large-format hoardings, calendars, brochures, and exhibition collateral',
      sort_order: 4,
    },
    {
      id: 'cat_digital_web',
      name: 'Digital / Web',
      slug: 'digital-web',
      description: 'Modern responsive web experiences, e-commerce digital catalogs, and digital UI interfaces',
      sort_order: 5,
    },
    {
      id: 'cat_campaigns',
      name: 'Campaigns',
      slug: 'campaigns',
      description: 'Multi-asset brand campaigns, thematic storytelling, and continuous narrative sequences',
      sort_order: 6,
    },
    {
      id: 'cat_thumbnails',
      name: 'Thumbnails',
      slug: 'thumbnails',
      description: 'High-CTR YouTube thumbnails, digital covers, and high-contrast editorial video artwork',
      sort_order: 7,
    },
  ];
  await db.saveCategories(categories);

  // 3. Site Settings
  await db.setSettings('site_settings', {
    site_name: 'SANJAY',
    hero_eyebrow: 'SANJAY — GRAPHIC DESIGNER',
    hero_headline: 'GRAPHIC DESIGNER',
    hero_description: 'I design social media posters and clear user interfaces for brands and digital products.',
    email: 'sanjaymurugesan23@gmail.com',
    phone: '+91 7010948452',
    linkedin_url: 'https://www.linkedin.com/in/sanjaym23',
    behance_url: 'https://www.behance.net/sanjayuiuxgd',
    resume_url: '/cv-sanjay.pdf',
    availability: 'Available for design work.',
    footer_text: '© 2026 SANJAY. All rights reserved.',
    seo_title: 'Sanjay — Graphic Designer',
    seo_description: 'Portfolio of Sanjay, graphic designer focused on social media design and user interface design.',
    og_image: '/assets/kings/kings-box-model.jpg',
  });

  // 4. About Content
  await db.setSettings('about_content', {
    headline: 'Graphic and Visual Designer bridging engineering logic and modern brand craft.',
    subheadline: 'Crafting high-converting social media creatives, brand identities, packaging, and digital interfaces.',
    biography_paragraph_1: 'I am a Graphic and Visual Designer based in Coimbatore with a background in Computer Science Engineering (B.E. from Sri Krishna College of Technology). I combine structured thinking and technical agility with visual design to create impactful brand identities, commercial campaigns, and user interfaces.',
    biography_paragraph_2: 'At Bevis, I have designed 100+ social media creatives, ad campaigns, packaging labels, and exhibition stalls for diverse brands including BAKERS, Pavizham Jewellers, Bro Knows Tech, LOFT, SIGGIS, Woneten Luxe, Wallfit, and Zen Spaces. I also pioneer AI-assisted workflows (Adobe Firefly, Seedream, ChatGPT, Gemini), reducing turnaround by 30% while delivering high-quality commercial visuals, e-commerce jewellery assets, and professional photo retouching.',
    experiences: [
      {
        id: 'exp_1',
        role: 'Graphic and Visual Designer',
        company: 'Bevis, Coimbatore',
        period: 'April 2025 – Present',
        description: 'Designed 100+ social media creatives, ad campaigns, and packaging labels across 17+ client brands. Spearheaded AI-assisted design workflows cutting production time by 30% while maintaining strict brand consistency.',
      },
      {
        id: 'exp_2',
        role: 'Graphic and Visual Designer & Creative Builder',
        company: 'Independent Practice',
        period: '2024 – Present',
        description: 'Creating comprehensive brand identities, digital product screens, user interfaces, design systems, and AI-driven visual explorations for growing businesses.',
      },
    ],
    capabilities: [
      {
        category: 'SOCIAL MEDIA & CAMPAIGNS',
        skills: [
          'Posters & Ads',
          'Stories',
          'Carousels',
          'Thumbnails',
          'Campaign Identity',
          'Performance Creatives',
        ],
      },
      {
        category: 'PACKAGING & PRINT',
        skills: [
          'Packaging Labels',
          'Box Packaging',
          'Billboards & Signage',
          'Stall Architecture',
          'Print Collateral',
        ],
      },
      {
        category: 'BRAND IDENTITY',
        skills: [
          'Logo Presentations',
          'Typography Systems',
          'Color Theory',
          'Brand Guidelines',
          'Editorial Layout',
        ],
      },
      {
        category: 'DIGITAL & UI DESIGN',
        skills: [
          'User Interfaces',
          'Layout & Hierarchy',
          'Digital Product Screens',
          'Design Systems',
          'Responsive Web',
        ],
      },
      {
        category: 'AI PRODUCTION & RETOUCHING',
        skills: [
          'AI Prompt Engineering',
          'Generative Visuals',
          'Jewellery Visuals',
          'Photo Retouching',
          'Adobe Firefly & Seedream',
        ],
      },
    ],
    tools: [
      'Adobe Photoshop',
      'Adobe Illustrator',
      'Adobe InDesign',
      'Figma',
      'Adobe Firefly',
      'Seedream',
      'Vibe coding',
    ],
    availability: 'Available for freelance commissions, brand partnerships, and full-time visual design roles.',
  });

  // 5. Projects & Content Blocks
  console.log('[SEED] Seeding portfolio projects with exact 7 categories...');

  // Helper map to ensure projects can be updated or recreated
  const projectsData = [
  {
    "id": "prj_bakers_stall",
    "title": "Bakers International — Exhibition Pavilions",
    "slug": "bakers-international-stall",
    "client": "Bakers International",
    "category_id": "cat_print",
    "year": "2025",
    "role": "Visual Designer & Spatial Lead",
    "services": [
      "Stall Architecture",
      "Spatial Design",
      "3D Mockups",
      "Large-Format Graphics",
      "Exhibition Branding"
    ],
    "description": "Immersive spatial exhibition booth architecture and large-format graphics designed for Bakers International at Indus Food & Gulfood 2026.",
    "hero_image": "/assets/bakers/bakers-stall-mockup.jpg",
    "status": "published",
    "featured": true,
    "sort_order": 1,
    "seo_title": "Bakers International — Exhibition Stall Architecture | Sanjay",
    "seo_description": "Spatial exhibition stall architecture, 3D booth simulations, and large-format graphics for Bakers International FMCG.",
    "brand_accent_color": "#E63946",
    "created_at": "2026-09-18T10:00:00.000Z",
    "updated_at": "2026-09-20T12:00:00.000Z",
    "published_at": "2026-09-18T10:00:00.000Z",
    "blocks": [
      {
        "id": "blk_bakers_stall_meta",
        "project_id": "prj_bakers_stall",
        "block_type": "PROJECT_METADATA",
        "sort_order": 0,
        "content": {
          "client": "Bakers International",
          "year": "2025",
          "role": "Visual Designer & Spatial Lead",
          "services": [
            "Stall Architecture",
            "Spatial Design",
            "3D Mockups",
            "Large-Format Graphics",
            "Exhibition Branding"
          ]
        }
      },
      {
        "id": "blk_bakers_stall_text1",
        "project_id": "prj_bakers_stall",
        "block_type": "TEXT",
        "sort_order": 1,
        "content": {
          "eyebrow": "SPATIAL ARCHITECTURE",
          "headline": "Engineering High-Impact Trade Presence",
          "body": "For Bakers International's marquee presence at Indus Food and Gulfood 2026, the objective was creating an unmistakable retail presence in high-traffic exhibition halls. We crafted an architectural stall design featuring illuminated 3D bulkheads, continuous product discovery zones, and dedicated live mocktail tasting counters."
        }
      },
      {
        "id": "blk_bakers_stall_hero",
        "project_id": "prj_bakers_stall",
        "block_type": "FULL_BLEED_IMAGE",
        "sort_order": 2,
        "content": {
          "url": "/assets/bakers/bakers-stall-mockup.jpg",
          "caption": "3D Spatial Booth Simulation & Modular Display Architecture at Indus Food"
        }
      },
      {
        "id": "blk_bakers_stall_counters",
        "project_id": "prj_bakers_stall",
        "block_type": "TWO_IMAGE",
        "sort_order": 3,
        "content": {
          "image1": {
            "url": "/assets/bakers/bakers-stall-live-counter-1.jpg",
            "caption": "Live Counter Graphic: Green Apple, Strawberry & Mojito (1500x900mm)"
          },
          "image2": {
            "url": "/assets/bakers/bakers-stall-live-counter-2.jpg",
            "caption": "Live Counter Graphic: Nannari & Passion Fruit Mojito (1500x900mm)"
          }
        }
      },
      {
        "id": "blk_bakers_stall_fascia",
        "project_id": "prj_bakers_stall",
        "block_type": "TWO_IMAGE",
        "sort_order": 4,
        "content": {
          "image1": {
            "url": "/assets/bakers/bakers-stall-casapinoy.jpg",
            "caption": "Casapinoy Backlit Pavilion Wall Display (1000x400mm)"
          },
          "image2": {
            "url": "/assets/bakers/bakers-stall-invite.jpg",
            "caption": "Official Gulfood 2026 Exhibition VIP Invitation Key Art"
          }
        }
      },
      {
        "id": "blk_bakers_stall_quote",
        "project_id": "prj_bakers_stall",
        "block_type": "QUOTE",
        "sort_order": 5,
        "content": {
          "quote": "The exhibition booth design elevated Bakers from a standard FMCG display to an immersive flavor destination that drove record trade inquiries.",
          "author": "Trade & Global Export Team",
          "title": "Bakers International"
        }
      }
    ]
  },
  {
    "id": "prj_bakers_crush",
    "title": "Bakers International — Fruit Crush Packaging",
    "slug": "bakers-crush-packaging",
    "client": "Bakers International",
    "category_id": "cat_packaging",
    "year": "2025",
    "role": "Packaging & Brand Designer",
    "services": [
      "Packaging Design",
      "3D Bottle Mockups",
      "Label Engineering",
      "Print Production",
      "FMCG Retail System"
    ],
    "description": "Complete 10-SKU premium fruit crush packaging system featuring custom typography, vibrant ingredient illustrations, and shelf-dominant label architecture.",
    "hero_image": "/assets/bakers/bakers-crush-lineup.jpg",
    "status": "published",
    "featured": true,
    "sort_order": 2,
    "seo_title": "Bakers International — 750ml Fruit Crush Packaging Line | Sanjay",
    "seo_description": "10-SKU fruit crush bottle packaging, 3D retail mockups, and label architecture for Bakers International.",
    "brand_accent_color": "#E63946",
    "created_at": "2026-09-18T10:30:00.000Z",
    "updated_at": "2026-09-20T12:00:00.000Z",
    "published_at": "2026-09-18T10:30:00.000Z",
    "blocks": [
      {
        "id": "blk_bakers_crush_meta",
        "project_id": "prj_bakers_crush",
        "block_type": "PROJECT_METADATA",
        "sort_order": 0,
        "content": {
          "client": "Bakers International",
          "year": "2025",
          "role": "Packaging & Brand Designer",
          "services": [
            "Packaging Design",
            "3D Bottle Mockups",
            "Label Engineering",
            "FMCG Retail Architecture"
          ]
        }
      },
      {
        "id": "blk_bakers_crush_text1",
        "project_id": "prj_bakers_crush",
        "block_type": "TEXT",
        "sort_order": 1,
        "content": {
          "eyebrow": "RETAIL PACKAGING SYSTEM",
          "headline": "Sensory Flavor Storytelling Across 10 SKUs",
          "body": "Designed for instantaneous visual distinction on modern supermarket shelves and quick-service restaurant backbars. The 750ml Fruit Crush system unifies 10 diverse flavor profiles—ranging from tropical Mango and Strawberry to exotic Kulfi Falooda and Rose—under a cohesive, premium label hierarchy."
        }
      },
      {
        "id": "blk_bakers_crush_hero",
        "project_id": "prj_bakers_crush",
        "block_type": "FULL_BLEED_IMAGE",
        "sort_order": 2,
        "content": {
          "url": "/assets/bakers/bakers-crush-lineup.jpg",
          "caption": "750ml Fruit Crush 10-SKU Range Retail Mockup & Shelf Placement"
        }
      },
      {
        "id": "blk_bakers_crush_bottles1",
        "project_id": "prj_bakers_crush",
        "block_type": "TWO_IMAGE",
        "sort_order": 3,
        "content": {
          "image1": {
            "url": "/assets/bakers/bakers-crush-mango.jpg",
            "caption": "Bakers Mango Crush 750ml Individual Bottle Presentation"
          },
          "image2": {
            "url": "/assets/bakers/bakers-crush-strawberry.jpg",
            "caption": "Bakers Strawberry Crush 750ml Individual Bottle Presentation"
          }
        }
      },
      {
        "id": "blk_bakers_crush_bottles2",
        "project_id": "prj_bakers_crush",
        "block_type": "TWO_IMAGE",
        "sort_order": 4,
        "content": {
          "image1": {
            "url": "/assets/bakers/bakers-crush-falooda.jpg",
            "caption": "Bakers Rose Falooda Crush 750ml Bottle Presentation"
          },
          "image2": {
            "url": "/assets/bakers/bakers-crush-kulfi.jpg",
            "caption": "Bakers Kulfi Falooda Crush 750ml Bottle Presentation"
          }
        }
      },
      {
        "id": "blk_bakers_crush_bottles3",
        "project_id": "prj_bakers_crush",
        "block_type": "TWO_IMAGE",
        "sort_order": 5,
        "content": {
          "image1": {
            "url": "/assets/bakers/bakers-crush-blueberry.jpg",
            "caption": "Bakers Blueberry Crush 750ml Bottle Presentation"
          },
          "image2": {
            "url": "/assets/bakers/bakers-crush-butterscotch.jpg",
            "caption": "Bakers Butterscotch Crush 750ml Bottle Presentation"
          }
        }
      }
    ]
  },
  {
    "id": "prj_bakers_social",
    "title": "Bakers International — Brand & Social Campaigns",
    "slug": "bakers-social-campaigns",
    "client": "Bakers International",
    "category_id": "cat_campaigns",
    "year": "2025",
    "role": "Lead Campaign Art Director",
    "services": [
      "Social Media Direction",
      "Continuous Carousels",
      "Food Retouching",
      "Campaign Art Direction"
    ],
    "description": "High-conversion social media campaigns including continuous narrative carousels, regional festive greetings, and culinary appetite-appeal product posters.",
    "hero_image": "/assets/bakers/bakers-campaign-garlic-mayo.jpg",
    "status": "published",
    "featured": false,
    "sort_order": 3,
    "seo_title": "Bakers International — Multi-Channel Social Campaigns | Sanjay",
    "seo_description": "Social media posters, multi-slide narrative carousels, and food advertising visuals for Bakers International.",
    "brand_accent_color": "#E63946",
    "created_at": "2026-09-18T11:00:00.000Z",
    "updated_at": "2026-09-20T12:00:00.000Z",
    "published_at": "2026-09-18T11:00:00.000Z",
    "blocks": [
      {
        "id": "blk_bakers_social_meta",
        "project_id": "prj_bakers_social",
        "block_type": "PROJECT_METADATA",
        "sort_order": 0,
        "content": {
          "client": "Bakers International",
          "year": "2025",
          "role": "Lead Campaign Art Director",
          "services": [
            "Social Media Direction",
            "Continuous Carousels",
            "Food Retouching",
            "Campaign Art Direction"
          ]
        }
      },
      {
        "id": "blk_bakers_social_hero",
        "project_id": "prj_bakers_social",
        "block_type": "FULL_BLEED_IMAGE",
        "sort_order": 1,
        "content": {
          "url": "/assets/bakers/bakers-campaign-garlic-mayo.jpg",
          "caption": "'This Is Where It Gets Good' — Garlic Mayo Continuous Carousel Presentation"
        }
      },
      {
        "id": "blk_bakers_social_iconic",
        "project_id": "prj_bakers_social",
        "block_type": "FULL_BLEED_IMAGE",
        "sort_order": 2,
        "content": {
          "url": "/assets/bakers/bakers-campaign-iconic-places.jpg",
          "caption": "'Iconic Places' Multi-Slide Carousel Campaign Celebrating Regional Street Delights"
        }
      },
      {
        "id": "blk_bakers_social_posts1",
        "project_id": "prj_bakers_social",
        "block_type": "TWO_IMAGE",
        "sort_order": 3,
        "content": {
          "image1": {
            "url": "/assets/bakers/bakers-post-bbq-sauce.jpg",
            "caption": "Smoky BBQ Sauce Product Highlight Poster"
          },
          "image2": {
            "url": "/assets/bakers/bakers-post-chocolate-syrup.jpg",
            "caption": "Velvety Chocolate Syrup Dessert Creative"
          }
        }
      },
      {
        "id": "blk_bakers_social_posts2",
        "project_id": "prj_bakers_social",
        "block_type": "TWO_IMAGE",
        "sort_order": 4,
        "content": {
          "image1": {
            "url": "/assets/bakers/bakers-post-passion-fruit.jpg",
            "caption": "Tropical Passion Fruit Syrup Refreshment Visual"
          },
          "image2": {
            "url": "/assets/bakers/bakers-post-chikki.jpg",
            "caption": "Traditional Peanut & Sesame Candy Festive Visual"
          }
        }
      }
    ]
  },
  {
    "id": "prj_bkt_thumbnails",
    "title": "Bro Knows Tech — High-CTR Video Artwork",
    "slug": "bro-knows-tech-thumbnails",
    "client": "Bro Knows Tech",
    "category_id": "cat_thumbnails",
    "year": "2025",
    "role": "Thumbnail Artist & Visual Strategist",
    "services": [
      "Video Thumbnails",
      "CTR Optimization",
      "Dynamic Lighting",
      "Visual Composition",
      "Tech Art Direction"
    ],
    "description": "High-impact video thumbnail artwork engineered for maximum click-through rates across tech reviews, television shootouts, and creator podcasts.",
    "hero_image": "/assets/bkt/bkt-thumb-bravia.jpg",
    "status": "published",
    "featured": true,
    "sort_order": 4,
    "seo_title": "Bro Knows Tech — High-CTR YouTube Video Thumbnails | Sanjay",
    "seo_description": "High-converting video thumbnail design for tech creator Bro Knows Tech covering Sony, LG, Samsung, and Meta.",
    "brand_accent_color": "#0066FF",
    "created_at": "2026-09-18T11:30:00.000Z",
    "updated_at": "2026-09-20T12:00:00.000Z",
    "published_at": "2026-09-18T11:30:00.000Z",
    "blocks": [
      {
        "id": "blk_bkt_thumb_meta",
        "project_id": "prj_bkt_thumbnails",
        "block_type": "PROJECT_METADATA",
        "sort_order": 0,
        "content": {
          "client": "Bro Knows Tech",
          "year": "2025 - 2026",
          "role": "Thumbnail Artist & Visual Strategist",
          "services": [
            "Video Thumbnails",
            "CTR Optimization",
            "Dynamic Lighting",
            "Visual Composition"
          ]
        }
      },
      {
        "id": "blk_bkt_thumb_text",
        "project_id": "prj_bkt_thumbnails",
        "block_type": "TEXT",
        "sort_order": 1,
        "content": {
          "eyebrow": "YOUTUBE VISUAL STRATEGY",
          "headline": "Engineering Contrast & Emotion for 12%+ CTR",
          "body": "In the ultra-competitive consumer electronics YouTube niche, thumbnails are the first and most crucial touchpoint. Each thumbnail is constructed with hyper-defined focal points, rim lighting, punchy product cutouts, and emotion-driven typography that commands viewer attention on mobile feeds."
        }
      },
      {
        "id": "blk_bkt_thumb_hero",
        "project_id": "prj_bkt_thumbnails",
        "block_type": "FULL_BLEED_IMAGE",
        "sort_order": 2,
        "content": {
          "url": "/assets/bkt/bkt-thumb-bravia.jpg",
          "caption": "Sony Bravia 2 Flagship Review Thumbnail (CTR 14.2%)"
        }
      },
      {
        "id": "blk_bkt_thumb_pair1",
        "project_id": "prj_bkt_thumbnails",
        "block_type": "TWO_IMAGE",
        "sort_order": 3,
        "content": {
          "image1": {
            "url": "/assets/bkt/bkt-thumb-oled.jpg",
            "caption": "LG OLED Smart TV Cinema Breakdown"
          },
          "image2": {
            "url": "/assets/bkt/bkt-thumb-meta-glasses.jpg",
            "caption": "Oakley Meta Smart Glasses Field Test"
          }
        }
      },
      {
        "id": "blk_bkt_thumb_pair2",
        "project_id": "prj_bkt_thumbnails",
        "block_type": "TWO_IMAGE",
        "sort_order": 4,
        "content": {
          "image1": {
            "url": "/assets/bkt/bkt-thumb-samsung-rgb.jpg",
            "caption": "Samsung Next-Gen RGB Display Shootout"
          },
          "image2": {
            "url": "/assets/bkt/bkt-thumb-podcast.jpg",
            "caption": "Bro Knows Tech Podcast Episode 1 (Neon Glow Edition)"
          }
        }
      },
      {
        "id": "blk_bkt_thumb_pair3",
        "project_id": "prj_bkt_thumbnails",
        "block_type": "TWO_IMAGE",
        "sort_order": 5,
        "content": {
          "image1": {
            "url": "/assets/bkt/bkt-thumb-french-fridge.jpg",
            "caption": "LG Smart French Door Refrigerator Appliance Deep Dive"
          },
          "image2": {
            "url": "/assets/bkt/bkt-thumb-bravia-launch.jpg",
            "caption": "Sony Bravia 2 Launch Edition Key Art"
          }
        }
      }
    ]
  },
  {
    "id": "prj_bkt_logo",
    "title": "Bro Knows Tech — Brand Mark & Identity System",
    "slug": "bro-knows-tech-branding",
    "client": "Bro Knows Tech",
    "category_id": "cat_branding",
    "year": "2025",
    "role": "Brand Identity Designer",
    "services": [
      "Logo Design",
      "Brand Identity System",
      "Vector Geometry",
      "Social Avatar Suite",
      "Typography"
    ],
    "description": "Complete visual identity system, geometric monogram mark, and responsive badge suite built for a modern tech media and review network.",
    "hero_image": "/assets/bkt/bkt-logo-primary.png",
    "status": "published",
    "featured": true,
    "sort_order": 5,
    "seo_title": "Bro Knows Tech — Brand Identity & Vector System | Sanjay",
    "seo_description": "Logo mark, channel avatar suites, and visual guidelines for tech channel Bro Knows Tech.",
    "brand_accent_color": "#0066FF",
    "created_at": "2026-09-18T12:00:00.000Z",
    "updated_at": "2026-09-20T12:00:00.000Z",
    "published_at": "2026-09-18T12:00:00.000Z",
    "blocks": [
      {
        "id": "blk_bkt_logo_meta",
        "project_id": "prj_bkt_logo",
        "block_type": "PROJECT_METADATA",
        "sort_order": 0,
        "content": {
          "client": "Bro Knows Tech",
          "year": "2025",
          "role": "Brand Identity Designer",
          "services": [
            "Logo Design",
            "Brand Identity System",
            "Vector Geometry",
            "Social Avatar Suite"
          ]
        }
      },
      {
        "id": "blk_bkt_logo_text",
        "project_id": "prj_bkt_logo",
        "block_type": "TEXT",
        "sort_order": 1,
        "content": {
          "eyebrow": "IDENTITY ARCHITECTURE",
          "headline": "A Technical Mark with Human Charisma",
          "body": "The Bro Knows Tech logo balances tech precision with creator warmth. Constructed with pure geometric grids, the emblem scales effortlessly from a 16px YouTube channel favicon to a 4K broadcast watermark and physical merchandise embroidery."
        }
      },
      {
        "id": "blk_bkt_logo_hero",
        "project_id": "prj_bkt_logo",
        "block_type": "FULL_BLEED_IMAGE",
        "sort_order": 2,
        "content": {
          "url": "/assets/bkt/bkt-logo-primary.png",
          "caption": "Bro Knows Tech Master Lockup & Geometry System"
        }
      },
      {
        "id": "blk_bkt_logo_pair1",
        "project_id": "prj_bkt_logo",
        "block_type": "TWO_IMAGE",
        "sort_order": 3,
        "content": {
          "image1": {
            "url": "/assets/bkt/bkt-logo-badge.png",
            "caption": "Circular Channel Badge & App Icon Lockup"
          },
          "image2": {
            "url": "/assets/bkt/bkt-logo-mark.png",
            "caption": "Isolated Monogram Icon for Digital Watermarking"
          }
        }
      },
      {
        "id": "blk_bkt_logo_pair2",
        "project_id": "prj_bkt_logo",
        "block_type": "TWO_IMAGE",
        "sort_order": 4,
        "content": {
          "image1": {
            "url": "/assets/bkt/bkt-logo-typography.png",
            "caption": "Custom Wordmark Typography & Kerning Architecture"
          },
          "image2": {
            "url": "/assets/bkt/bkt-post-reveal.jpg",
            "caption": "Brand Reveal & Channel Launch Campaign Artwork"
          }
        }
      }
    ]
  },
  {
    "id": "prj_bkt_carousels",
    "title": "Bro Knows Tech — Tech Breakdown Carousels",
    "slug": "bro-knows-tech-carousels",
    "client": "Bro Knows Tech",
    "category_id": "cat_social_media",
    "year": "2025",
    "role": "Infographic & Carousel Designer",
    "services": [
      "Carousel Design",
      "Tech Explainer Infographics",
      "Social Media Marketing",
      "Visual Storytelling"
    ],
    "description": "High-retention technical explainer carousels simplifying complex consumer tech concepts like OLED panel lifespans and smart inverter technology.",
    "hero_image": "/assets/bkt/bkt-carousel-bosch.jpg",
    "status": "published",
    "featured": false,
    "sort_order": 6,
    "seo_title": "Bro Knows Tech — Technical Breakdown Carousels | Sanjay",
    "seo_description": "Educational tech carousels and infographic slides for Bro Knows Tech.",
    "brand_accent_color": "#0066FF",
    "created_at": "2026-09-18T12:30:00.000Z",
    "updated_at": "2026-09-20T12:00:00.000Z",
    "published_at": "2026-09-18T12:30:00.000Z",
    "blocks": []
  },
  {
    "id": "prj_pavizham_campaigns",
    "title": "Pavizham Jewellers — Royal Heritage Campaigns",
    "slug": "pavizham-jewellers-campaigns",
    "client": "Pavizham Jewellers",
    "category_id": "cat_campaigns",
    "year": "2024",
    "role": "Visual Designer & Art Director",
    "services": [
      "Luxury Art Direction",
      "Jewellery Editorial",
      "Festive Campaigns",
      "Retouching",
      "Typography"
    ],
    "description": "High-glamour campaign posters and multi-grid social direction celebrating heirloom gold, solitaire diamonds, and festive celebrations.",
    "hero_image": "/assets/pavizham/pavizham-campaign-sona.jpg",
    "status": "published",
    "featured": true,
    "sort_order": 7,
    "seo_title": "Pavizham Jewellers — Heritage Gold & Diamond Campaigns | Sanjay",
    "seo_description": "Luxury jewellery art direction, festival social media campaigns, and diamond editorial direction for Pavizham Jewellers.",
    "brand_accent_color": "#D4AF37",
    "created_at": "2026-09-18T13:00:00.000Z",
    "updated_at": "2026-09-20T12:00:00.000Z",
    "published_at": "2026-09-18T13:00:00.000Z",
    "blocks": [
      {
        "id": "blk_pavizham_camp_meta",
        "project_id": "prj_pavizham_campaigns",
        "block_type": "PROJECT_METADATA",
        "sort_order": 0,
        "content": {
          "client": "Pavizham Jewellers",
          "year": "2024",
          "role": "Visual Designer & Art Director",
          "services": [
            "Luxury Art Direction",
            "Jewellery Editorial",
            "Festive Campaigns",
            "Retouching"
          ]
        }
      },
      {
        "id": "blk_pavizham_camp_text",
        "project_id": "prj_pavizham_campaigns",
        "block_type": "TEXT",
        "sort_order": 1,
        "content": {
          "eyebrow": "HERITAGE ART DIRECTION",
          "headline": "Capturing the Brilliance of Solitaire & Gold",
          "body": "Pavizham Jewellers is an established luxury jewellery atelier. The campaign strategy harmonized deep emerald tones, warm golden ambient lighting, and razor-sharp macro focus on diamond cuts to convey uncompromising opulence across festive print and digital media."
        }
      },
      {
        "id": "blk_pavizham_camp_hero",
        "project_id": "prj_pavizham_campaigns",
        "block_type": "FULL_BLEED_IMAGE",
        "sort_order": 2,
        "content": {
          "url": "/assets/pavizham/pavizham-campaign-sona.jpg",
          "caption": "Pavizham Sona Collection Master 9-Grid Campaign Presentation"
        }
      },
      {
        "id": "blk_pavizham_camp_pair1",
        "project_id": "prj_pavizham_campaigns",
        "block_type": "TWO_IMAGE",
        "sort_order": 3,
        "content": {
          "image1": {
            "url": "/assets/pavizham/pavizham-campaign-sona-1.jpg",
            "caption": "Sona Editorial Hero Poster 1: Heritage Temple Choker"
          },
          "image2": {
            "url": "/assets/pavizham/pavizham-campaign-sona-2.jpg",
            "caption": "Sona Editorial Hero Poster 2: Polki Emerald Bangles"
          }
        }
      },
      {
        "id": "blk_pavizham_camp_pair2",
        "project_id": "prj_pavizham_campaigns",
        "block_type": "TWO_IMAGE",
        "sort_order": 4,
        "content": {
          "image1": {
            "url": "/assets/pavizham/pavizham-post-emerald.jpg",
            "caption": "Emerald Royale Diamond Necklace Editorial"
          },
          "image2": {
            "url": "/assets/pavizham/pavizham-post-diamond-grid.jpg",
            "caption": "Pavizham Diamond Collection Festive Grid"
          }
        }
      },
      {
        "id": "blk_pavizham_camp_pair3",
        "project_id": "prj_pavizham_campaigns",
        "block_type": "TWO_IMAGE",
        "sort_order": 5,
        "content": {
          "image1": {
            "url": "/assets/pavizham/pavizham-post-diwali.jpg",
            "caption": "Auspicious Diwali Gold Celebration Poster"
          },
          "image2": {
            "url": "/assets/pavizham/pavizham-post-christmas.jpg",
            "caption": "Christmas Diamond Solitaire Season Feature"
          }
        }
      }
    ]
  },
  {
    "id": "prj_pavizham_print",
    "title": "Pavizham Jewellers — Editorial Print & Hoardings",
    "slug": "pavizham-print-collateral",
    "client": "Pavizham Jewellers",
    "category_id": "cat_print",
    "year": "2024",
    "role": "Print Production & Editorial Designer",
    "services": [
      "Print Design",
      "Outdoor Advertising",
      "Event Collateral",
      "Catalogue Layout",
      "Typography"
    ],
    "description": "Large-format showroom launch hoardings, foil-stamped luxury inauguration invitation suites, and an A4 diamond collection editorial lookbook.",
    "hero_image": "/assets/pavizham/pavizham-print-hoarding.jpg",
    "status": "published",
    "featured": false,
    "sort_order": 8,
    "seo_title": "Pavizham Jewellers — Print Collateral & Hoardings | Sanjay",
    "seo_description": "Showroom inauguration hoardings, editorial catalogs, and luxury invitations for Pavizham Jewellers.",
    "brand_accent_color": "#D4AF37",
    "created_at": "2026-09-18T13:30:00.000Z",
    "updated_at": "2026-09-20T12:00:00.000Z",
    "published_at": "2026-09-18T13:30:00.000Z",
    "blocks": []
  },
  {
    "id": "prj_kings",
    "title": "KINGS — Shirts For A Higher Standard",
    "slug": "kings",
    "client": "KINGS",
    "category_id": "cat_branding",
    "year": "2026",
    "role": "Lead Brand Designer & Digital Builder",
    "services": [
      "Branding",
      "Art Direction",
      "Packaging Design",
      "Website Design",
      "Digital Experience"
    ],
    "description": "End-to-end brand architecture, luxury packaging engineering, and digital wholesale platform for KINGS — premium shirts, dhoties, and traditional wear.",
    "hero_image": "/assets/kings/kings-box-model.jpg",
    "status": "published",
    "featured": true,
    "sort_order": 9,
    "seo_title": "KINGS — Luxury Menswear Brand & Digital Platform | Sanjay",
    "seo_description": "Complete independent branding, packaging design, and responsive digital experience for KINGS.",
    "brand_accent_color": "#8B2635",
    "live_url": "https://kings-app.vercel.app",
    "created_at": "2026-09-18T14:00:00.000Z",
    "updated_at": "2026-09-20T12:00:00.000Z",
    "published_at": "2026-09-18T14:00:00.000Z",
    "blocks": [
      {
        "id": "blk_kings_meta",
        "project_id": "prj_kings",
        "block_type": "PROJECT_METADATA",
        "sort_order": 0,
        "content": {
          "client": "KINGS",
          "year": "2026",
          "role": "Lead Brand Designer & Digital Builder",
          "services": [
            "Branding",
            "Art Direction",
            "Packaging Design",
            "Website Design",
            "Digital Experience"
          ]
        }
      },
      {
        "id": "blk_kings_text1",
        "project_id": "prj_kings",
        "block_type": "TEXT",
        "sort_order": 1,
        "content": {
          "eyebrow": "THE FOUNDATION",
          "headline": "Shirts For A Higher Standard",
          "body": "KINGS was founded on the conviction that everyday Indian men's formalwear deserved royal craftsmanship. We built an identity balancing regal pride with contemporary Scandinavian precision."
        }
      },
      {
        "id": "blk_kings_hero",
        "project_id": "prj_kings",
        "block_type": "FULL_BLEED_IMAGE",
        "sort_order": 2,
        "content": {
          "url": "/assets/kings/kings-box-model.jpg",
          "caption": "Rigid Two-Piece Gold-Embossed Shirt Box Prototype"
        }
      },
      {
        "id": "blk_kings_pair1",
        "project_id": "prj_kings",
        "block_type": "TWO_IMAGE",
        "sort_order": 3,
        "content": {
          "image1": {
            "url": "/assets/kings/kings-shirt-1.jpg",
            "caption": "Single-Needle Pure Cotton Tailoring"
          },
          "image2": {
            "url": "/assets/kings/kings-shirt-2.jpg",
            "caption": "Mother of Pearl Button & Stitch Precision"
          }
        }
      },
      {
        "id": "blk_kings_pair2",
        "project_id": "prj_kings",
        "block_type": "TWO_IMAGE",
        "sort_order": 4,
        "content": {
          "image1": {
            "url": "/assets/kings/kings-tags.jpg",
            "caption": "Dual-Ply Woven Neck Labels & 600gsm Cotton Hangtags"
          },
          "image2": {
            "url": "/assets/kings/kings-packaging-detail.jpg",
            "caption": "Matte Black Foil Stamped Luxury Seal"
          }
        }
      }
    ]
  },
  {
    "id": "prj_zen_thumbnails",
    "title": "Zen Spaces — Architecture & Ergonomics Artwork",
    "slug": "zen-spaces-thumbnails",
    "client": "Zen Spaces",
    "category_id": "cat_thumbnails",
    "year": "2025",
    "role": "Thumbnail Strategist & 3D Artist",
    "services": [
      "YouTube Thumbnails",
      "3D Spatial Layout",
      "Visual Composition",
      "CTR Strategy",
      "Commercial Interiors"
    ],
    "description": "High-performing video thumbnails showcasing custom office furniture design, ergonomics science, and modern commercial office fitouts.",
    "hero_image": "/assets/zen/zen-thumb-science.jpg",
    "status": "published",
    "featured": true,
    "sort_order": 10,
    "seo_title": "Zen Spaces — Workspace Planning Video Thumbnails | Sanjay",
    "seo_description": "YouTube thumbnails and digital cover art for Zen Spaces office architecture and custom furniture.",
    "brand_accent_color": "#2A9D8F",
    "created_at": "2026-09-18T14:30:00.000Z",
    "updated_at": "2026-09-20T12:00:00.000Z",
    "published_at": "2026-09-18T14:30:00.000Z",
    "blocks": [
      {
        "id": "blk_zen_thumb_meta",
        "project_id": "prj_zen_thumbnails",
        "block_type": "PROJECT_METADATA",
        "sort_order": 0,
        "content": {
          "client": "Zen Spaces",
          "year": "2025",
          "role": "Thumbnail Strategist & 3D Artist",
          "services": [
            "YouTube Thumbnails",
            "3D Spatial Layout",
            "Visual Composition",
            "CTR Strategy"
          ]
        }
      },
      {
        "id": "blk_zen_thumb_hero",
        "project_id": "prj_zen_thumbnails",
        "block_type": "FULL_BLEED_IMAGE",
        "sort_order": 1,
        "content": {
          "url": "/assets/zen/zen-thumb-science.jpg",
          "caption": "The Science Behind ZEN Spaces (CTR 13.8%)"
        }
      },
      {
        "id": "blk_zen_thumb_pair1",
        "project_id": "prj_zen_thumbnails",
        "block_type": "TWO_IMAGE",
        "sort_order": 2,
        "content": {
          "image1": {
            "url": "/assets/zen/zen-thumb-future-workspaces.jpg",
            "caption": "Afrah Future of Workspaces Thought Leadership"
          },
          "image2": {
            "url": "/assets/zen/zen-thumb-workspace-planning.jpg",
            "caption": "Workspace Planning — Elecon Engineering Enterprise Case"
          }
        }
      },
      {
        "id": "blk_zen_thumb_pair2",
        "project_id": "prj_zen_thumbnails",
        "block_type": "TWO_IMAGE",
        "sort_order": 3,
        "content": {
          "image1": {
            "url": "/assets/zen/zen-thumb-designed-success.jpg",
            "caption": "Designed for Success: Vignesh Founder Spotlight"
          },
          "image2": {
            "url": "/assets/zen/zen-thumb-office-designed.jpg",
            "caption": "How Your Office Is Designed Behind the Scenes"
          }
        }
      }
    ]
  },
  {
    "id": "prj_zen_furniture",
    "title": "Zen Spaces — Custom Furniture Thought Leadership",
    "slug": "zen-spaces-furniture",
    "client": "Zen Spaces",
    "category_id": "cat_social_media",
    "year": "2025",
    "role": "Editorial & Social Designer",
    "services": [
      "Social Media Posters",
      "Thought Leadership Carousels",
      "Brand Communications",
      "Ergonomics Design"
    ],
    "description": "Multi-part educational social poster campaign breaking down the ergonomics, cost benefits, and productivity impact of custom commercial furniture.",
    "hero_image": "/assets/zen/zen-post-furniture-part1.jpg",
    "status": "published",
    "featured": false,
    "sort_order": 11,
    "seo_title": "Zen Spaces — Custom Furniture Social Series | Sanjay",
    "seo_description": "Educational carousel series and campaign posters on office furniture engineering for Zen Spaces.",
    "brand_accent_color": "#2A9D8F",
    "created_at": "2026-09-18T15:00:00.000Z",
    "updated_at": "2026-09-20T12:00:00.000Z",
    "published_at": "2026-09-18T15:00:00.000Z",
    "blocks": []
  },
  {
    "id": "prj_loft_posters",
    "title": "Loft — Cinema, F1 Culture & Event Series",
    "slug": "loft-cinema-culture",
    "client": "Loft",
    "category_id": "cat_print",
    "year": "2025",
    "role": "Brand & Cultural Poster Designer",
    "services": [
      "Editorial Poster Design",
      "Film Art Direction",
      "Event Promotion",
      "Pop Culture Visuals",
      "Typography"
    ],
    "description": "Cult cinema tribute series celebrating unsung visionary filmmakers, Formula 1 Grand Prix race-day posters, and immersive Halloween events.",
    "hero_image": "/assets/loft/loft-posters-unsung-presentation.jpg",
    "status": "published",
    "featured": true,
    "sort_order": 12,
    "seo_title": "Loft — Cinema, F1 & Nightlife Event Posters | Sanjay",
    "seo_description": "Editorial posters, Formula 1 Grand Prix artwork, and filmmaker tribute series for Loft venue.",
    "brand_accent_color": "#E76F51",
    "created_at": "2026-09-18T15:30:00.000Z",
    "updated_at": "2026-09-20T12:00:00.000Z",
    "published_at": "2026-09-18T15:30:00.000Z",
    "blocks": [
      {
        "id": "blk_loft_meta",
        "project_id": "prj_loft_posters",
        "block_type": "PROJECT_METADATA",
        "sort_order": 0,
        "content": {
          "client": "Loft",
          "year": "2025",
          "role": "Brand & Cultural Poster Designer",
          "services": [
            "Editorial Poster Design",
            "Film Art Direction",
            "Event Promotion",
            "Pop Culture Visuals"
          ]
        }
      },
      {
        "id": "blk_loft_hero",
        "project_id": "prj_loft_posters",
        "block_type": "FULL_BLEED_IMAGE",
        "sort_order": 1,
        "content": {
          "url": "/assets/loft/loft-posters-unsung-presentation.jpg",
          "caption": "Unsung Directors Master Cinema Series Presentation"
        }
      },
      {
        "id": "blk_loft_pair1",
        "project_id": "prj_loft_posters",
        "block_type": "TWO_IMAGE",
        "sort_order": 2,
        "content": {
          "image1": {
            "url": "/assets/loft/loft-posters-unsung-1.jpg",
            "caption": "Unsung Directors Chapter 1: Atmospheric Indie Cinephile Tribute"
          },
          "image2": {
            "url": "/assets/loft/loft-posters-unsung-2.jpg",
            "caption": "Unsung Directors Chapter 2: Neo-Noir & Psychological Drama"
          }
        }
      },
      {
        "id": "blk_loft_pair2",
        "project_id": "prj_loft_posters",
        "block_type": "TWO_IMAGE",
        "sort_order": 3,
        "content": {
          "image1": {
            "url": "/assets/loft/loft-posters-f1-british.jpg",
            "caption": "British Grand Prix Race Weekend Poster: High Octane at Silverstone"
          },
          "image2": {
            "url": "/assets/loft/loft-posters-f1-italy.jpg",
            "caption": "Italian Grand Prix Race Weekend Poster: Temple of Speed Monza"
          }
        }
      },
      {
        "id": "blk_loft_pair3",
        "project_id": "prj_loft_posters",
        "block_type": "TWO_IMAGE",
        "sort_order": 4,
        "content": {
          "image1": {
            "url": "/assets/loft/loft-posters-halloween.jpg",
            "caption": "Haunted Halloween Night Social Poster & Event Key Art"
          },
          "image2": {
            "url": "/assets/loft/loft-posters-singles-day.jpg",
            "caption": "Singles Day Rooftop Celebration Poster"
          }
        }
      }
    ]
  },
  {
    "id": "prj_loft_calendars",
    "title": "Loft — Monthly Sports Calendars & Pantry Identity",
    "slug": "loft-calendars-pantry",
    "client": "Loft",
    "category_id": "cat_social_media",
    "year": "2025",
    "role": "Print & Editorial Layout Designer",
    "services": [
      "Editorial Layout",
      "Typography",
      "Monthly Event Schedules",
      "Menu Branding",
      "Print Collateral"
    ],
    "description": "Clean typographic sports broadcast calendars, curated movie streaming recommendations, and mouth-watering artisanal cafe menu collateral.",
    "hero_image": "/assets/loft/loft-calendar-dec.jpg",
    "status": "published",
    "featured": false,
    "sort_order": 13,
    "seo_title": "Loft — Editorial Sports Calendars & Pantry Design | Sanjay",
    "seo_description": "Sports screening calendars, cafe menu identities, and editorial layouts for Loft.",
    "brand_accent_color": "#E76F51",
    "created_at": "2026-09-18T16:00:00.000Z",
    "updated_at": "2026-09-20T12:00:00.000Z",
    "published_at": "2026-09-18T16:00:00.000Z",
    "blocks": []
  },
  {
    "id": "prj_woneten",
    "title": "Woneten — Contemporary Ethnic & Festive Couture",
    "slug": "woneten-fashion-campaigns",
    "client": "Woneten",
    "category_id": "cat_campaigns",
    "year": "2025",
    "role": "Fashion Art Director & Campaign Designer",
    "services": [
      "Fashion Art Direction",
      "Carousel Design",
      "Festive Campaigns",
      "Apparel Marketing",
      "Social Media"
    ],
    "description": "Vibrant ethnic fashion marketing campaigns: multi-slide Kurti lookbook carousels, AI-augmented fashion posters, and festive collections.",
    "hero_image": "/assets/woneten/woneten-carousel-presentation.jpg",
    "status": "published",
    "featured": true,
    "sort_order": 14,
    "seo_title": "Woneten — Contemporary Ethnic Fashion Campaigns | Sanjay",
    "seo_description": "Apparel lookbooks, multi-slide Kurti carousels, and festive fashion campaigns for Woneten.",
    "brand_accent_color": "#D62828",
    "created_at": "2026-09-18T16:30:00.000Z",
    "updated_at": "2026-09-20T12:00:00.000Z",
    "published_at": "2026-09-18T16:30:00.000Z",
    "blocks": [
      {
        "id": "blk_woneten_meta",
        "project_id": "prj_woneten",
        "block_type": "PROJECT_METADATA",
        "sort_order": 0,
        "content": {
          "client": "Woneten",
          "year": "2025",
          "role": "Fashion Art Director & Campaign Designer",
          "services": [
            "Fashion Art Direction",
            "Carousel Design",
            "Festive Campaigns",
            "Apparel Marketing"
          ]
        }
      },
      {
        "id": "blk_woneten_hero",
        "project_id": "prj_woneten",
        "block_type": "FULL_BLEED_IMAGE",
        "sort_order": 1,
        "content": {
          "url": "/assets/woneten/woneten-carousel-presentation.jpg",
          "caption": "Woneten Designer Kurti Carousel Full Presentation"
        }
      },
      {
        "id": "blk_woneten_pair1",
        "project_id": "prj_woneten",
        "block_type": "TWO_IMAGE",
        "sort_order": 2,
        "content": {
          "image1": {
            "url": "/assets/woneten/woneten-post-ai.jpg",
            "caption": "Woneten AI-Assisted Modern Fashion Campaign Poster"
          },
          "image2": {
            "url": "/assets/woneten/woneten-post-mens.jpg",
            "caption": "Woneten Premium Menswear Autumn / Festive Collection"
          }
        }
      },
      {
        "id": "blk_woneten_pair2",
        "project_id": "prj_woneten",
        "block_type": "TWO_IMAGE",
        "sort_order": 3,
        "content": {
          "image1": {
            "url": "/assets/woneten/woneten-post-luxe-bakrid.jpg",
            "caption": "Luxe Bakrid Festive Couture Editorial"
          },
          "image2": {
            "url": "/assets/woneten/woneten-post-onam.jpg",
            "caption": "Onam Tradition Reimagined Festive Poster"
          }
        }
      }
    ]
  },
  {
    "id": "prj_bea",
    "title": "BEA — Retail Appliance Video Artwork",
    "slug": "bea-retail-appliances",
    "client": "BEA",
    "category_id": "cat_thumbnails",
    "year": "2025",
    "role": "Digital Marketing & Thumbnail Designer",
    "services": [
      "YouTube Thumbnails",
      "Retail Creative",
      "Appliance Marketing",
      "Festival Posters",
      "Visual Hierarchy"
    ],
    "description": "High-conversion AC and home appliance review thumbnails for top consumer brands including Bluestar, Hitachi, Godrej, IFB, and Samsung.",
    "hero_image": "/assets/bea/bea-thumb-bluestar.jpg",
    "status": "published",
    "featured": false,
    "sort_order": 15,
    "seo_title": "BEA — Home Appliance Video Thumbnails | Sanjay",
    "seo_description": "Consumer appliance thumbnails and retail campaigns for BEA Electronics.",
    "brand_accent_color": "#1D3557",
    "created_at": "2026-09-18T17:00:00.000Z",
    "updated_at": "2026-09-20T12:00:00.000Z",
    "published_at": "2026-09-18T17:00:00.000Z",
    "blocks": []
  },
  {
    "id": "prj_siggis",
    "title": "SIGGIS — Zero-Preservative Condiments & Packaging",
    "slug": "siggis-preservative-free",
    "client": "SIGGIS",
    "category_id": "cat_packaging",
    "year": "2025",
    "role": "Packaging & Brand Designer",
    "services": [
      "Packaging Design",
      "Food Labeling",
      "Social Creative",
      "Product Launch",
      "Brand System"
    ],
    "description": "Eco-conscious food packaging for zero-preservative pickles, organic food colors, and natural spices celebrating authentic culinary heritage.",
    "hero_image": "/assets/siggis/siggis-pack-citron-pickle.jpg",
    "status": "published",
    "featured": false,
    "sort_order": 16,
    "seo_title": "SIGGIS — Food Packaging & Campaign Design | Sanjay",
    "seo_description": "Zero-preservative food packaging, organic spice labels, and campaign creatives for SIGGIS.",
    "brand_accent_color": "#F4A261",
    "created_at": "2026-09-18T17:30:00.000Z",
    "updated_at": "2026-09-20T12:00:00.000Z",
    "published_at": "2026-09-18T17:30:00.000Z",
    "blocks": []
  },
  {
    "id": "prj_bevis",
    "title": "Bevis — Pure Mineral Water & Corporate Identity",
    "slug": "bevis-mineral-water",
    "client": "Bevis",
    "category_id": "cat_packaging",
    "year": "2025",
    "role": "Packaging & Identity Designer",
    "services": [
      "Bottle Mockups",
      "Packaging Design",
      "Hiring Ad Campaigns",
      "Festive Creatives",
      "3D Visualization"
    ],
    "description": "3D mineral water bottle engineering, corporate visual identity, and high-engagement dynamic recruitment campaign posters.",
    "hero_image": "/assets/bevis/bevis-pack-bottle-mockup-1.jpg",
    "status": "published",
    "featured": false,
    "sort_order": 17,
    "seo_title": "Bevis — Mineral Water Packaging & Brand Collateral | Sanjay",
    "seo_description": "3D bottle mockups, recruitment campaigns, and corporate branding for Bevis Mineral Water.",
    "brand_accent_color": "#0077B6",
    "created_at": "2026-09-18T18:00:00.000Z",
    "updated_at": "2026-09-20T12:00:00.000Z",
    "published_at": "2026-09-18T18:00:00.000Z",
    "blocks": []
  },
  {
    "id": "prj_sms",
    "title": "SMS — Educational Brand Carousels & Storytelling",
    "slug": "sms-educational-branding",
    "client": "Senthil Matric School",
    "category_id": "cat_social_media",
    "year": "2025",
    "role": "Educational Visual Strategist",
    "services": [
      "Educational Infographics",
      "Multi-Slide Carousels",
      "Brand Storytelling",
      "Social Strategy"
    ],
    "description": "Empathetic educational carousels exploring modern pedagogy: '5 Things Every School Must Make a Child Feel' and 'Step Inside Learning Spaces'.",
    "hero_image": "/assets/sms/sms-carousel-5things-presentation.jpg",
    "status": "published",
    "featured": false,
    "sort_order": 18,
    "seo_title": "Senthil Matric School — Educational Carousels & Branding | Sanjay",
    "seo_description": "Values-based education storytelling carousels and school branding for Senthil Matric School.",
    "brand_accent_color": "#1E3A8A",
    "created_at": "2026-09-18T18:30:00.000Z",
    "updated_at": "2026-09-20T12:00:00.000Z",
    "published_at": "2026-09-18T18:30:00.000Z",
    "blocks": []
  },
  {
    "id": "prj_yaazhi",
    "title": "Yaazhi — 3D E-Commerce Jewellery Visual System",
    "slug": "yaazhi-jewellery-renders",
    "client": "Yaazhi",
    "category_id": "cat_digital_web",
    "year": "2025",
    "role": "3D Product Visualizer & Digital Catalog Designer",
    "services": [
      "3D Product Visuals",
      "E-Commerce Asset Design",
      "Digital Catalog",
      "UI Graphics",
      "Lighting Simulation"
    ],
    "description": "Precision photorealistic 3D pendant jewelry renders and clean e-commerce digital catalog system across 9 distinct jewelry collections.",
    "hero_image": "/assets/yaazhi/yaazhi-render-composite.jpg",
    "status": "published",
    "featured": false,
    "sort_order": 19,
    "seo_title": "Yaazhi — 3D E-Commerce Jewellery Renders | Sanjay",
    "seo_description": "Photorealistic 3D jewelry renders and e-commerce digital storefront assets for Yaazhi.",
    "brand_accent_color": "#9A7B38",
    "created_at": "2026-09-18T19:00:00.000Z",
    "updated_at": "2026-09-20T12:00:00.000Z",
    "published_at": "2026-09-18T19:00:00.000Z",
    "blocks": []
  },
  {
    "id": "prj_thriveni",
    "title": "Thriveni — Industrial Power & Mining Campaigns",
    "slug": "thriveni-industrial-campaigns",
    "client": "Thriveni",
    "category_id": "cat_print",
    "year": "2024",
    "role": "Industrial & Corporate Art Director",
    "services": [
      "Corporate Print",
      "Industrial Storytelling",
      "Commemorative Posters",
      "Large Format Design"
    ],
    "description": "High-impact industrial visuals celebrating 'Powering India\\'s Gold', national resource development, and heavy engineering workforces.",
    "hero_image": "/assets/thriveni/thriveni-post-gold.jpg",
    "status": "published",
    "featured": false,
    "sort_order": 20,
    "seo_title": "Thriveni — Industrial Power & Mining Campaigns | Sanjay",
    "seo_description": "Corporate industrial print campaigns and commemorative artwork for Thriveni Mining.",
    "brand_accent_color": "#B45309",
    "created_at": "2026-09-18T19:30:00.000Z",
    "updated_at": "2026-09-20T12:00:00.000Z",
    "published_at": "2026-09-18T19:30:00.000Z",
    "blocks": []
  },
  {
    "id": "prj_tmg_subiksham",
    "title": "TMG & Subiksham — Commercial Retail & Festive Promotions",
    "slug": "tmg-subiksham-commercial",
    "client": "TMG / Subiksham",
    "category_id": "cat_campaigns",
    "year": "2025",
    "role": "Commercial Advertising Designer",
    "services": [
      "Commercial Advertising",
      "Retail Offer Creatives",
      "Festive Fashion Posters",
      "Social Collateral"
    ],
    "description": "High-energy retail sales campaigns, 'Why TMG?' value carousels, and festive ethnic fashion campaigns for Subiksham Aadi & Onam sales.",
    "hero_image": "/assets/tmg/tmg-campaign-why.jpg",
    "status": "published",
    "featured": false,
    "sort_order": 21,
    "seo_title": "TMG & Subiksham — Retail & Festive Commercial Posters | Sanjay",
    "seo_description": "Commercial supermarket promotions, retail value carousels, and ethnic fashion posters for TMG and Subiksham.",
    "brand_accent_color": "#059669",
    "created_at": "2026-09-18T20:00:00.000Z",
    "updated_at": "2026-09-20T12:00:00.000Z",
    "published_at": "2026-09-18T20:00:00.000Z",
    "blocks": []
  }
];

  // Upsert or create each project and its content blocks
  for (const item of projectsData) {
    const { blocks, ...projectFields } = item;
    const existing = await db.getProjectById(projectFields.id);
    if (existing) {
      await db.updateProject(projectFields.id, projectFields, blocks);
      console.log(`[SEED] Updated project: ${projectFields.title} (${projectFields.category_id})`);
    } else {
      await db.createProject(projectFields, blocks);
      console.log(`[SEED] Created project: ${projectFields.title} (${projectFields.category_id})`);
    }
  }

  // 6. Log activity
  await db.logActivity('System Seed', 'Installed initial portfolio data.');
  await db.setMeta('initial_portfolio_seed_complete', true);
  console.log('[SEED] Database seed complete.');
  } catch (err) {
    console.warn('[SEED] Database seed encountered non-fatal error:', err?.message || err);
  }
};

// If run directly via node seed.js
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  initializeDatabase()
    .then(() => seedDatabase())
    .then(() => {
      console.log('[SEED] Done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[SEED] Error seeding:', err);
      process.exit(1);
    });
}
