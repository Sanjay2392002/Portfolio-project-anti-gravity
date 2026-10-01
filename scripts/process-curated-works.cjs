const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SOURCE_BASE = 'F:\\AA Portfoliio works';
const DEST_BASE = path.resolve(__dirname, '../public/assets');

// List of all carefully curated best works
const curatedAssets = [
  // Bakers International
  { src: 'Bakers/Dec/Stall design/Bakers - mockup.png', dest: 'bakers/bakers-stall-mockup.jpg' },
  { src: 'Bakers/Dec/Stall design/1500x900mm_Live_counter_green_apple_strawberry_mojito@.png', dest: 'bakers/bakers-stall-live-counter-1.jpg' },
  { src: 'Bakers/Dec/Stall design/1500x900mm_Live_counter_nannari_passion_mojito@2x.png', dest: 'bakers/bakers-stall-live-counter-2.jpg' },
  { src: 'Bakers/Dec/Stall design/1000_400_CASAPINOY.png', dest: 'bakers/bakers-stall-casapinoy.jpg' },
  { src: 'Bakers/May 26/Bakers_Stall_invite_GulfFood_2026._Finalpng.png', dest: 'bakers/bakers-stall-invite.jpg' },
  { src: 'Bakers/Packaging/750 ml mockups- sample.png', dest: 'bakers/bakers-crush-lineup.jpg' },
  { src: 'Bakers/Packaging/750 ml - Mango crush  out.png', dest: 'bakers/bakers-crush-mango.jpg' },
  { src: 'Bakers/Packaging/750 ml - Strawberry Crush .png', dest: 'bakers/bakers-crush-strawberry.jpg' },
  { src: 'Bakers/Packaging/750 ml - Blueberry Crush .png', dest: 'bakers/bakers-crush-blueberry.jpg' },
  { src: 'Bakers/Packaging/750 ml - Rose Falooda Crush .png', dest: 'bakers/bakers-crush-falooda.jpg' },
  { src: 'Bakers/Packaging/750 ml - Kulfi Falooda Crush .png', dest: 'bakers/bakers-crush-kulfi.jpg' },
  { src: 'Bakers/Packaging/750 ml - Butterscotch Crush .png', dest: 'bakers/bakers-crush-butterscotch.jpg' },
  { src: 'Bakers/Packaging/750 ml - Green Apple Crush  copy.png', dest: 'bakers/bakers-crush-greenapple.jpg' },
  { src: 'Bakers/August 2026/This is where it gets good - Continous carousel-20260920T104854Z-1-001/This is where it gets good - Continous carousel/Bakers - Garlic mayo presentation.png', dest: 'bakers/bakers-campaign-garlic-mayo.jpg' },
  { src: 'Bakers/August 2026/Iconic places carousel/Bakers_iconic places_presentation.png', dest: 'bakers/bakers-campaign-iconic-places.jpg' },
  { src: 'Bakers/Aug 25/Bakers - Chocolate Syrup v1@2x.png', dest: 'bakers/bakers-post-chocolate-syrup.jpg' },
  { src: 'Bakers/Aug 25/Bakers - BBQ Sauce v3.png', dest: 'bakers/bakers-post-bbq-sauce.jpg' },
  { src: 'Bakers/Aug 25/Bakers - Passion Fruit v1.png', dest: 'bakers/bakers-post-passion-fruit.jpg' },
  { src: 'Bakers/Sep 25/Sep poster/Chikki New v3.png', dest: 'bakers/bakers-post-chikki.jpg' },
  { src: 'Bakers/Dec/Chikki AI video thumbnail.png', dest: 'bakers/bakers-thumb-chikki-ai.jpg' },
  { src: 'Bakers/November/Bakers -Pizza Pasta Sauce Thumbnail.png', dest: 'bakers/bakers-thumb-pizza-sauce.jpg' },

  // Bro Knows Tech (BKT)
  { src: 'BKT/Bro knows tech - Sony Bravia thumbnail.png', dest: 'bkt/bkt-thumb-bravia.jpg' },
  { src: 'BKT/Bro knows tech - LG - OLED Smart TV Thumbnail_v1.png', dest: 'bkt/bkt-thumb-oled.jpg' },
  { src: 'BKT/BKT - Oaklay Meta glass thumbnail_updated.png', dest: 'bkt/bkt-thumb-meta-glasses.jpg' },
  { src: 'BKT/BKT - Sasmung Next Gen RGB thumbnail_v3_updated.png', dest: 'bkt/bkt-thumb-samsung-rgb.jpg' },
  { src: 'BKT/Bro knows tech - LG - French Door Fridge_Thumbnail.png', dest: 'bkt/bkt-thumb-french-fridge.jpg' },
  { src: 'BKT/BKT Podcast 1 thumbnail_GLOW.png', dest: 'bkt/bkt-thumb-podcast.jpg' },
  { src: 'BKT/BKT - Bravia 2 II Final.png', dest: 'bkt/bkt-thumb-bravia-launch.jpg' },
  { src: 'BKT/Bro Knows Tech Logo/300ppi/11.png', dest: 'bkt/bkt-logo-primary.png', isPng: true },
  { src: 'BKT/Bro Knows Tech Logo/300ppi/6.png', dest: 'bkt/bkt-logo-badge.png', isPng: true },
  { src: 'BKT/Bro Knows Tech Logo/300ppi/5.png', dest: 'bkt/bkt-logo-mark.png', isPng: true },
  { src: 'BKT/Bro Knows Tech Logo/300ppi/1.png', dest: 'bkt/bkt-logo-typography.png', isPng: true },
  { src: 'BKT/Bosch SBS carousel/Bro Knows Tech - Bosch SBS refrigirator carousel_presentation.png', dest: 'bkt/bkt-carousel-bosch.jpg' },
  { src: 'BKT/Oled Carousel/Bro knows tech - OLED lifespan carousel.png', dest: 'bkt/bkt-carousel-oled.jpg' },
  { src: 'BKT/Oled Carousel/Revealing post/Bro knows tech - Revealing poster_V4.png', dest: 'bkt/bkt-post-reveal.jpg' },

  // Pavizham Jewellers
  { src: 'Pavizham/Aug 2026/Sona/Pavizham - Sona Grid Image_Presentation.png', dest: 'pavizham/pavizham-campaign-sona.jpg' },
  { src: 'Pavizham/Aug 2026/Sona/Pavizham - Sona Grid Image_1.png', dest: 'pavizham/pavizham-campaign-sona-1.jpg' },
  { src: 'Pavizham/Aug 2026/Sona/Pavizham - Sona Grid Image_2.png', dest: 'pavizham/pavizham-campaign-sona-2.jpg' },
  { src: 'Pavizham/Aug 2026/Sona/Pavizham - Sona Grid Image_3.png', dest: 'pavizham/pavizham-campaign-sona-3.jpg' },
  { src: 'Pavizham/Dec/Pavizham - Emerald Necklace.png', dest: 'pavizham/pavizham-post-emerald.jpg' },
  { src: 'Pavizham/Dec/Pavizham Diamond Grid.png', dest: 'pavizham/pavizham-post-diamond-grid.jpg' },
  { src: 'Pavizham/Pavizham - Diwali  Poster.png', dest: 'pavizham/pavizham-post-diwali.jpg' },
  { src: 'Pavizham/Dec/Pavizham - Christmas_1.png', dest: 'pavizham/pavizham-post-christmas.jpg' },
  { src: 'Pavizham/Nov/Pavizham Hoarding.png', dest: 'pavizham/pavizham-print-hoarding.jpg' },
  { src: 'Pavizham/Nov/Pavizham_Inaugration_Invite.png', dest: 'pavizham/pavizham-print-inauguration.jpg' },
  { src: 'Pavizham/Dec/Pavizham_2026_A4.png', dest: 'pavizham/pavizham-print-catalog.jpg' },
  { src: 'Pavizham/Dec/Pavizham_Diamond_Cover.png', dest: 'pavizham/pavizham-print-diamond-cover.jpg' },
  { src: 'Pavizham/Aug 2026/Product shoot/Pavizham Product shoot - Images Presentation.png', dest: 'pavizham/pavizham-photo-presentation.jpg' },
  { src: 'Pavizham/Diamond Images/DSC08615_cc.png', dest: 'pavizham/pavizham-photo-macro.jpg' },

  // Zen Spaces
  { src: 'Zen/Aug/ZEN - Science Behind ZEN Spaces (Thumbnail).png', dest: 'zen/zen-thumb-science.jpg' },
  { src: 'Zen/July/Afrah Future of Workspaces - thumbnail.png', dest: 'zen/zen-thumb-future-workspaces.jpg' },
  { src: 'Zen/July/Designed for success ( Vignesh )   - Zen Thumbnail.png', dest: 'zen/zen-thumb-designed-success.jpg' },
  { src: 'Zen/July/Workspace Planning - Elecon Engineering.png', dest: 'zen/zen-thumb-workspace-planning.jpg' },
  { src: 'Zen/July/How your office is designed - thumbnail.png', dest: 'zen/zen-thumb-office-designed.jpg' },
  { src: 'Zen/July/Legsgo - Testimonial thumbnail.png', dest: 'zen/zen-thumb-testimonial-legsgo.jpg' },
  { src: 'Zen/July/Timbertruss - Testimonial thumbnail.png', dest: 'zen/zen-thumb-testimonial-timbertruss.jpg' },
  { src: 'Zen/Aug/Why custom furniture - Zen part 1.png', dest: 'zen/zen-post-furniture-part1.jpg' },
  { src: 'Zen/Aug/Why custom furniture - Zen part 2.png', dest: 'zen/zen-post-furniture-part2.jpg' },
  { src: 'Zen/Aug/Zen - Independence day poster.png', dest: 'zen/zen-post-independence.jpg' },
  { src: 'Zen/July/Fathers day - Zen quote change v5.png', dest: 'zen/zen-post-fathers-day.jpg' },

  // Loft
  { src: 'Loft/Oct 25/Unsung directors/Loft - Unsung Directors presentation.png', dest: 'loft/loft-posters-unsung-presentation.jpg' },
  { src: 'Loft/Oct 25/Unsung directors/Loft - Unsung Directors 1.png', dest: 'loft/loft-posters-unsung-1.jpg' },
  { src: 'Loft/Oct 25/Unsung directors/loft - unsung drectors 2.png', dest: 'loft/loft-posters-unsung-2.jpg' },
  { src: 'Loft/Oct 25/Unsung directors/loft - unsung drectors 3.png', dest: 'loft/loft-posters-unsung-3.jpg' },
  { src: 'Loft/Oct 25/Unsung directors/loft - unsung drectors 4.png', dest: 'loft/loft-posters-unsung-4.jpg' },
  { src: 'Loft/Nov 25/Haunted Halloween Event Images/Haunted Halloween Event Images - 01.png', dest: 'loft/loft-posters-halloween.jpg' },
  { src: 'Loft/Nov 25/Singles day/Loft - Singles Day - Cover.png', dest: 'loft/loft-posters-singles-day.jpg' },
  { src: 'Loft/Jul 25/Loft - British GP - F1 poster.png', dest: 'loft/loft-posters-f1-british.jpg' },
  { src: 'Loft/Jul 25/Loft - Belgium F1 Poster.png', dest: 'loft/loft-posters-f1-belgium.jpg' },
  { src: 'Loft/Sep 25/F1  -Italy v2.png', dest: 'loft/loft-posters-f1-italy.jpg' },
  { src: 'Loft/Dec 25/Loft_F1_Abudhabhi.png', dest: 'loft/loft-posters-f1-abudhabi.jpg' },
  { src: 'Loft/Dec 25/Sports calendar/Loft - December Sports Calendar 1.png', dest: 'loft/loft-calendar-dec.jpg' },
  { src: 'Loft/Nov 25/Sports calendar/Loft - November Sports Calendar  1.png', dest: 'loft/loft-calendar-nov.jpg' },
  { src: 'Loft/Sep 25/Loft - Pantry/Loft Pantry cover.png', dest: 'loft/loft-pantry-cover.jpg' },
  { src: 'Loft/Sep 25/Loft - Pantry/hot chocolate.png', dest: 'loft/loft-pantry-hot-chocolate.jpg' },
  { src: 'Loft/Sep 25/Loft - Pantry/Masala fries.png', dest: 'loft/loft-pantry-fries.jpg' },

  // Woneten
  { src: 'Woneten/Kurti - Carousel/Woneten - carousel presentation.png', dest: 'woneten/woneten-carousel-presentation.jpg' },
  { src: 'Woneten/Kurti - Carousel/1.png', dest: 'woneten/woneten-carousel-slide1.jpg' },
  { src: 'Woneten/Kurti - Carousel/2.png', dest: 'woneten/woneten-carousel-slide2.jpg' },
  { src: 'Woneten/Kurti - Carousel/4.png', dest: 'woneten/woneten-carousel-slide4.jpg' },
  { src: 'Woneten/Woneten Ai Poster  FInal.png', dest: 'woneten/woneten-post-ai.jpg' },
  { src: 'Woneten/Woneten - Mens collection v4.png', dest: 'woneten/woneten-post-mens.jpg' },
  { src: 'Woneten/woneten luxe bakrid.png', dest: 'woneten/woneten-post-luxe-bakrid.jpg' },
  { src: 'Woneten/Woneten Onam Poster.png', dest: 'woneten/woneten-post-onam.jpg' },
  { src: 'Woneten/Woneten - Diwali  Thumbnail V4.png', dest: 'woneten/woneten-thumb-diwali.jpg' },

  // BEA
  { src: 'Bea/Bea - Bluestar AC ( Thumbnail ).png', dest: 'bea/bea-thumb-bluestar.jpg' },
  { src: 'Bea/BEA - Hitachi AC Thumbnail_1.png', dest: 'bea/bea-thumb-hitachi.jpg' },
  { src: 'Bea/BEA - Godrej AC ( Thumbnail ).png', dest: 'bea/bea-thumb-godrej.jpg' },
  { src: 'Bea/BEA - IFB AC - Thumbnail.png', dest: 'bea/bea-thumb-ifb.jpg' },
  { src: 'Bea/BEA - Samsung Windfree AC Thumbnail Updated .png', dest: 'bea/bea-thumb-samsung-windfree.jpg' },
  { src: 'Bea/BEA - Panasonic 8 in 1 Convertible AC - Thumbnail_v3.png', dest: 'bea/bea-thumb-panasonic.jpg' },
  { src: 'Bea/BEA - General AC Thumbnail.png', dest: 'bea/bea-thumb-general.jpg' },
  { src: 'Bea/Bea - Summer Sale Wrap - Thumbnail_1.png', dest: 'bea/bea-thumb-summer-sale.jpg' },
  { src: 'Bea/BEA - Mothers Day.png', dest: 'bea/bea-post-mothers-day.jpg' },
  { src: 'Bea/BEA - Easter_Wishes.png', dest: 'bea/bea-post-easter.jpg' },

  // SIGGIS
  { src: 'SIGGIS/Citron Pickle - Siggis.png', dest: 'siggis/siggis-pack-citron-pickle.jpg' },
  { src: 'SIGGIS/Siggis - Mango thokku poster.png', dest: 'siggis/siggis-pack-mango-thokku.jpg' },
  { src: 'SIGGIS/No preservatives-20260920T102053Z-1-001/No preservatives/Siggis - No preservatives_1.png', dest: 'siggis/siggis-pack-no-preservatives-1.jpg' },
  { src: 'SIGGIS/No preservatives-20260920T102053Z-1-001/No preservatives/Siggis - No preservatives_2.png', dest: 'siggis/siggis-pack-no-preservatives-2.jpg' },
  { src: 'SIGGIS/Food colors-20260920T102053Z-1-001/Food colors/Siggis - Food colors_1.png', dest: 'siggis/siggis-pack-food-colors-1.jpg' },
  { src: 'SIGGIS/Food colors-20260920T102053Z-1-001/Food colors/Siggis - Food colors_2.png', dest: 'siggis/siggis-pack-food-colors-2.jpg' },
  { src: 'SIGGIS/Food Sugar-20260920T102053Z-1-001/Food Sugar/Siggis - Food Sugar_1.png', dest: 'siggis/siggis-pack-food-sugar-1.jpg' },
  { src: 'SIGGIS/Siggis - Spiderman poster 3.png', dest: 'siggis/siggis-post-spiderman.jpg' },

  // Bevis
  { src: 'Bevis/Bevis - Bottle  mockup 1.png', dest: 'bevis/bevis-pack-bottle-mockup-1.jpg' },
  { src: 'Bevis/Bevis - Bottle mockup 2.png', dest: 'bevis/bevis-pack-bottle-mockup-2.jpg' },
  { src: 'Bevis/Bevis - Mockup 1.png', dest: 'bevis/bevis-pack-mockup-1.jpg' },
  { src: 'Bevis/Hiring old/Hiring poster presentation.png', dest: 'bevis/bevis-campaign-hiring.jpg' },
  { src: 'Bevis/Bevis - Ganapathy Mart Thumbnail.png', dest: 'bevis/bevis-thumb-ganapathy-mart.jpg' },
  { src: 'Bevis/Bevis - Christmas.png', dest: 'bevis/bevis-post-christmas.jpg' },
  { src: 'Bevis/Bevis_Republic Day_1.png', dest: 'bevis/bevis-post-republic-day.jpg' },

  // SMS
  { src: 'SMS/5 things/Senthil Matric School - 5 things every school must make a child feel (Carousel).png', dest: 'sms/sms-carousel-5things-presentation.jpg' },
  { src: 'SMS/5 things/1.png', dest: 'sms/sms-carousel-5things-1.jpg' },
  { src: 'SMS/5 things/2.png', dest: 'sms/sms-carousel-5things-2.jpg' },
  { src: 'SMS/Step inside/Senthil Matric School - Step inside learning space_Fd 2.png', dest: 'sms/sms-carousel-step-inside.jpg' },
  { src: 'SMS/SPS - Friendship day.png', dest: 'sms/sms-post-friendship.jpg' },

  // Yaazhi
  { src: 'Yaazhi/out/1.png', dest: 'yaazhi/yaazhi-render-composite.jpg' },
  { src: 'Yaazhi/out/2.png', dest: 'yaazhi/yaazhi-render-angle-2.jpg' },
  { src: 'Yaazhi/out/3.png', dest: 'yaazhi/yaazhi-render-angle-3.jpg' },
  { src: 'Yaazhi/Yaazhi Ecom/Pendant 1/Pendant Chain 1_1.png', dest: 'yaazhi/yaazhi-pendant-1.jpg' },
  { src: 'Yaazhi/Yaazhi Ecom/Pendant 6/Pendant 6_1.png', dest: 'yaazhi/yaazhi-pendant-6.jpg' },
  { src: 'Yaazhi/Yaazhi Ecom/Pendant 15/Pendant 15_1.png', dest: 'yaazhi/yaazhi-pendant-15.jpg' },

  // Thriveni
  { src: 'Thriveni/Thriveni - Powering India’s Gold_updated_img.png', dest: 'thriveni/thriveni-post-gold.jpg' },
  { src: 'Thriveni/Thriveni - Labors day post1.png', dest: 'thriveni/thriveni-post-labors-day.jpg' },
  { src: 'Thriveni/Thriveni - Father\'s Day Post .png', dest: 'thriveni/thriveni-post-fathers-day.jpg' },
  { src: 'Thriveni/Thriveni Easter Poster.png', dest: 'thriveni/thriveni-post-easter.jpg' },

  // TMG
  { src: 'TMG/Why TMG_1.png', dest: 'tmg/tmg-campaign-why.jpg' },
  { src: 'TMG/TMG - Buy 3 Get 3_1.png', dest: 'tmg/tmg-campaign-buy3get3.jpg' },
  { src: 'TMG/TMG_Kangeyam Exclusive.png', dest: 'tmg/tmg-campaign-exclusive.jpg' },
  { src: 'TMG/TMG -Valentines Wishes.png', dest: 'tmg/tmg-campaign-valentines.jpg' },
  { src: 'TMG/TMG - Republic Day_1.png', dest: 'tmg/tmg-campaign-republic.jpg' },

  // Subiksham
  { src: 'Subiksham/Subiksham - Aadi sale.png', dest: 'subiksham/subiksham-post-aadi.jpg' },
  { src: 'Subiksham/Subiksham_Onam_1.png', dest: 'subiksham/subiksham-post-onam.jpg' },
  { src: 'Subiksham/Subiksham Aadi sale - Kurthi_1.png', dest: 'subiksham/subiksham-post-kurthi.jpg' },
];

async function processAll() {
  console.log(`Starting curation processing of ${curatedAssets.length} best works...`);
  let successCount = 0;
  let failCount = 0;

  for (const item of curatedAssets) {
    const fullSrc = path.join(SOURCE_BASE, item.src);
    const fullDest = path.join(DEST_BASE, item.dest);

    if (!fs.existsSync(fullSrc)) {
      console.warn(`[MISSING] ${fullSrc}`);
      failCount++;
      continue;
    }

    const destDir = path.dirname(fullDest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    try {
      const transformer = sharp(fullSrc).resize({
        width: 1600,
        height: 1600,
        fit: 'inside',
        withoutEnlargement: true,
      });

      if (item.isPng) {
        await transformer.png({ quality: 90, compressionLevel: 8 }).toFile(fullDest);
      } else {
        await transformer.jpeg({ quality: 88, mozjpeg: true }).toFile(fullDest);
      }

      const srcSizeMb = (fs.statSync(fullSrc).size / (1024 * 1024)).toFixed(2);
      const destSizeKb = (fs.statSync(fullDest).size / 1024).toFixed(1);
      console.log(`✓ Processed: ${item.dest} (${srcSizeMb}MB -> ${destSizeKb}KB)`);
      successCount++;
    } catch (err) {
      console.error(`✗ Error processing ${item.src}:`, err.message);
      failCount++;
    }
  }

  console.log(`\nComplete! Successfully processed: ${successCount} assets. Failed: ${failCount}`);
}

processAll();
