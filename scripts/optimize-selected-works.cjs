const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SOURCE_BASE = path.resolve(__dirname, '../Selected works/Selected works');
const DEST_BASE = path.resolve(__dirname, '../public/assets');

const itemsToProcess = [
  // LOFT - F1 Posters
  { src: 'LOFT/Loft - F1 posters/British GP.png', dest: 'loft/loft-f1-british.jpg' },
  { src: 'LOFT/Loft - F1 posters/Belgium GP.png', dest: 'loft/loft-f1-belgium.jpg' },
  { src: 'LOFT/Loft - F1 posters/Austrian GP.png', dest: 'loft/loft-f1-austrian.jpg' },
  { src: 'LOFT/Loft - F1 posters/Azerbaizan GP.png', dest: 'loft/loft-f1-azerbaijan.jpg' },
  { src: 'LOFT/Loft - F1 posters/Brazilian GP.png', dest: 'loft/loft-f1-brazilian.jpg' },
  { src: 'LOFT/Loft - F1 posters/Melbourne GP.png', dest: 'loft/loft-f1-melbourne.jpg' },
  { src: 'LOFT/Loft - F1 posters/Netherlands GP.png', dest: 'loft/loft-f1-netherlands.jpg' },
  { src: 'LOFT/Loft - F1 posters/Qatar GP.png', dest: 'loft/loft-f1-qatar.jpg' },

  // LOFT - Carousels & Events
  { src: 'LOFT/Loft  - Anime to watch/Loft - Anime  Carousel Presentation.png', dest: 'loft/loft-anime-presentation.jpg' },
  { src: 'LOFT/Loft  - Anime to watch/Loft - Anime  Carousel Cover.png', dest: 'loft/loft-anime-cover.jpg' },
  { src: 'LOFT/Loft  - Anime to watch/Loft - Anime  Carousel 1.png', dest: 'loft/loft-anime-1.jpg' },
  { src: 'LOFT/Loft  - Anime to watch/Loft - Anime  Carousel 2.png', dest: 'loft/loft-anime-2.jpg' },
  { src: 'LOFT/Loft  - Anime to watch/Loft - Anime  Carousel 3.png', dest: 'loft/loft-anime-3.jpg' },
  { src: 'LOFT/Loft - Movies to watch with dad/Loft - Fathers Day movie presentation.png', dest: 'loft/loft-dad-movies-presentation.jpg' },
  { src: 'LOFT/OTT Binge watch June 3/Loft - OTT Binge watch presentation.png', dest: 'loft/loft-ott-binge-presentation.jpg' },
  { src: 'LOFT/Loft - The Boys Screening.png', dest: 'loft/loft-the-boys.jpg' },
  { src: 'LOFT/Loft - T20 Worldcup Final.png', dest: 'loft/loft-t20-worldcup.jpg' },

  // BAKERS - Carousels & Packaging
  { src: 'BAKERS/Bakers - Mr.B intro carousel/Bakers - Mr.B intro carousel_1.png', dest: 'bakers/bakers-mrb-intro-1.jpg' },
  { src: 'BAKERS/Bakers - Mr.B intro carousel/Bakers - Mr.B intro carousel_2.png', dest: 'bakers/bakers-mrb-intro-2.jpg' },
  { src: 'BAKERS/Bakers - Mr.B intro carousel/Bakers - Mr.B intro carousel_3.png', dest: 'bakers/bakers-mrb-intro-3.jpg' },
  { src: 'BAKERS/Bakers - Garlic mayo Carousel/Bakers - Garlic mayo Carousel presentation.png', dest: 'bakers/bakers-garlic-mayo-presentation.jpg' },
  { src: 'BAKERS/Bakers - Garlic mayo Carousel/Bakers - Garlic mayo carousel_1.png', dest: 'bakers/bakers-garlic-mayo-1.jpg' },
  { src: 'BAKERS/Bakers - Garlic mayo Carousel/Bakers - Garlic mayo carousel_2.png', dest: 'bakers/bakers-garlic-mayo-2.jpg' },
  { src: 'BAKERS/Bakers - Garlic mayo Carousel/Bakers - Garlic mayo carousel_3.png', dest: 'bakers/bakers-garlic-mayo-3.jpg' },
  { src: 'BAKERS/Bakers - Garlic mayo Carousel/Bakers - Garlic mayo carousel_4.png', dest: 'bakers/bakers-garlic-mayo-4.jpg' },
  { src: 'BAKERS/Bakers - Garlic mayo Carousel/Bakers - Garlic mayo carousel_5.png', dest: 'bakers/bakers-garlic-mayo-5.jpg' },
  { src: 'BAKERS/Bakers - Apple CIder vinegar.png', dest: 'bakers/bakers-pack-cider-vinegar.jpg' },
  { src: 'BAKERS/Bakers - Blue Coraco Syrup.png', dest: 'bakers/bakers-pack-blue-curacao.jpg' },
  { src: 'BAKERS/Bakers - Chocolate Syrup.png', dest: 'bakers/bakers-pack-chocolate-syrup.jpg' },
  { src: 'BAKERS/Bakers - soye sauce.png', dest: 'bakers/bakers-pack-soya-sauce.jpg' },
  { src: 'BAKERS/Bakers - Tomato sauce.png', dest: 'bakers/bakers-pack-tomato-sauce.jpg' },
  { src: 'BAKERS/Bakers - Veg Mayo poster.png', dest: 'bakers/bakers-post-veg-mayo.jpg' },
  { src: 'BAKERS/Bakers Peanut Candy.png', dest: 'bakers/bakers-pack-peanut-candy.jpg' },
  { src: 'BAKERS/Bakers Sesame Candy.png', dest: 'bakers/bakers-pack-sesame-candy.jpg' },
  { src: 'BAKERS/Bakers_Gulf_mailer.png', dest: 'bakers/bakers-print-gulf-mailer.jpg' },
  { src: 'BAKERS/Bakers_Stall_invite.png', dest: 'bakers/bakers-print-stall-invite.jpg' },

  // BEVIS
  { src: 'BEVIS/Packaging/Output of the package design.png', dest: 'bevis/bevis-packaging-output.jpg' },
  { src: 'BEVIS/Packaging/Bottle 1/Bevis - Naatu Sakkarai - Mockup.png', dest: 'bevis/bevis-pack-naatu-sakkarai.jpg' },
  { src: 'BEVIS/Packaging/Bottle 2/Bevis - Curry leaf Bottle - Mockup.png', dest: 'bevis/bevis-pack-curry-leaf.jpg' },
  { src: 'BEVIS/Packaging/Gift box/Bevis - Box Mockup 1.png', dest: 'bevis/bevis-pack-gift-box-1.jpg' },
  { src: 'BEVIS/Packaging/Gift box/Bevis - Box Mockup 2.png', dest: 'bevis/bevis-pack-gift-box-2.jpg' },
  { src: 'BEVIS/Packaging/Gift box/Box Design Diecut.png', dest: 'bevis/bevis-pack-box-diecut.jpg' },
  { src: 'BEVIS/Bevis -Diwali Thumbnail.png', dest: 'bevis/bevis-thumb-diwali.jpg' },
  { src: 'BEVIS/Bevis Dear Entrepeneur Thumbnail.png', dest: 'bevis/bevis-thumb-entrepreneur.jpg' },

  // BEA
  { src: 'BEA/BEA - Panasonic 8 in 1 Convertible AC - Thumbnail.png', dest: 'bea/bea-thumb-panasonic.jpg' },
  { src: 'BEA/BEA - Samsung Windfree AC Thumbnail.png', dest: 'bea/bea-thumb-samsung-windfree.jpg' },
  { src: 'BEA/Bea - Summer Sale Wrap - Thumbnail.png', dest: 'bea/bea-thumb-summer-sale.jpg' },
  { src: 'BEA/BEA - Trusted by Millions - Daiken AC - Thumbnail.png', dest: 'bea/bea-thumb-daikin.jpg' },
  { src: 'BEA/BEA Reel 1 - thumbnail.png', dest: 'bea/bea-thumb-reel1.jpg' },
  { src: 'BEA/Bea-Godrej AC Thumbnail.png', dest: 'bea/bea-thumb-godrej.jpg' },
  { src: 'BEA/Bea - Labours Day story.png', dest: 'bea/bea-post-labours-day.jpg' },

  // BRO KNOWS TECH
  { src: 'Bro Knows Tech/BKT - Bravia 2 II Launch.png', dest: 'bkt/bkt-thumb-bravia-launch.jpg' },
  { src: 'Bro Knows Tech/BKT - Sasmung Next Gen RGB thumbnail.png', dest: 'bkt/bkt-thumb-samsung-rgb.jpg' },
  { src: 'Bro Knows Tech/BKT Podcast 1 thumbnail.png', dest: 'bkt/bkt-thumb-podcast1.jpg' },
  { src: 'Bro Knows Tech/BKT Podcast 2 Thumbnail.png', dest: 'bkt/bkt-thumb-podcast2.jpg' },
  { src: 'Bro Knows Tech/Bro knows tech - LG - French Door Fridge_Thumbnail.png', dest: 'bkt/bkt-thumb-french-fridge.jpg' },
  { src: 'Bro Knows Tech/Bro knows tech - Revealing poster_V4.png', dest: 'bkt/bkt-post-reveal-v4.jpg' },
  { src: 'Bro Knows Tech/Bkt bosch carousel/Bro Knows Tech - Bosch SBS refrigirator carousel_presentation.png', dest: 'bkt/bkt-carousel-bosch-pres.jpg' },

  // PAVIZHAM
  { src: 'PAVIZHAM/Pavizham - Diwali  Poster.png', dest: 'pavizham/pavizham-post-diwali.jpg' },
  { src: 'PAVIZHAM/Pavizham - Emerald Necklace.png', dest: 'pavizham/pavizham-post-emerald.jpg' },
  { src: 'PAVIZHAM/Pavizham Opening Hoarding.png', dest: 'pavizham/pavizham-print-hoarding.jpg' },
  { src: 'PAVIZHAM/Pavizham Aalaya -  thumbnail.png', dest: 'pavizham/pavizham-thumb-aalaya.jpg' },
  { src: 'PAVIZHAM/Pavizham Diamond thumbnail.png', dest: 'pavizham/pavizham-thumb-diamond.jpg' },
  { src: 'PAVIZHAM/Pavizham thumbnail - Tejasvi.png', dest: 'pavizham/pavizham-thumb-tejasvi.jpg' },
  { src: 'PAVIZHAM/Pavizham thumbnail_Abhivriddhi.png', dest: 'pavizham/pavizham-thumb-abhivriddhi.jpg' },
  { src: 'PAVIZHAM/Pavizham-Black Friday offer.png', dest: 'pavizham/pavizham-post-black-friday.jpg' },

  // SIGGIS
  { src: 'SIGGIS/Citron Pickle - Siggis.png', dest: 'siggis/siggis-pack-citron-pickle.jpg' },
  { src: 'SIGGIS/Siggis - Mango thokku poster.png', dest: 'siggis/siggis-post-mango-thokku.jpg' },
  { src: 'SIGGIS/Siggis - Spiderman poster 3.png', dest: 'siggis/siggis-post-spiderman.jpg' },

  // SMS (Senthil Matric School)
  { src: 'SMS/5 things/Senthil Matric School - 5 things every school must make a child feel (Carousel).png', dest: 'sms/sms-carousel-5things-pres.jpg' },
  { src: 'SMS/5 things/1.png', dest: 'sms/sms-5things-1.jpg' },
  { src: 'SMS/5 things/2.png', dest: 'sms/sms-5things-2.jpg' },
  { src: 'SMS/5 things/3.png', dest: 'sms/sms-5things-3.jpg' },
  { src: 'SMS/5 things/4.png', dest: 'sms/sms-5things-4.jpg' },
  { src: 'SMS/5 things/5.png', dest: 'sms/sms-5things-5.jpg' },
  { src: 'SMS/5 things/6.png', dest: 'sms/sms-5things-6.jpg' },
  { src: 'SMS/5 things/7.png', dest: 'sms/sms-5things-7.jpg' },
  { src: 'SMS/5 things/8.png', dest: 'sms/sms-5things-8.jpg' },
  { src: 'SMS/SPS - Friendship day.png', dest: 'sms/sms-post-friendship.jpg' },

  // SUBIKSHAM
  { src: 'Subiksham/Subiksham - Aadi sale.png', dest: 'subiksham/subiksham-post-aadi.jpg' },
  { src: 'Subiksham/Subiksham - Aadi sale_2.png', dest: 'subiksham/subiksham-post-aadi-2.jpg' },
  { src: 'Subiksham/Subiksham Aadi sale - Kurthi_1.png', dest: 'subiksham/subiksham-post-kurthi-1.jpg' },
  { src: 'Subiksham/Subiksham Aadi sale - Kurthi_2.png', dest: 'subiksham/subiksham-post-kurthi-2.jpg' },
  { src: 'Subiksham/Subiksham_Onam_1.png', dest: 'subiksham/subiksham-post-onam-1.jpg' },
  { src: 'Subiksham/Subiksham_Onam_2.png', dest: 'subiksham/subiksham-post-onam-2.jpg' },
  { src: 'Subiksham/Subiksham - Independence story.png', dest: 'subiksham/subiksham-post-independence.jpg' },

  // TARANGI
  { src: 'Tarangi/Tarangi - Ayudha Pooja.png', dest: 'tarangi/tarangi-post-ayudha-pooja.jpg' },

  // THRIVENI
  { src: 'Thriveni/Thriveni onam story_2.png', dest: 'thriveni/thriveni-post-onam.jpg' },

  // TMG
  { src: 'TMG/TMG -Valentines Wishes.png', dest: 'tmg/tmg-post-valentines.jpg' },
  { src: 'TMG/TMG_Classic_Collections_1@2x.png', dest: 'tmg/tmg-post-classic-collections.jpg' },
  { src: 'TMG/TMG_Kangeyam Exclusive.png', dest: 'tmg/tmg-post-kangeyam.jpg' },
  { src: 'TMG/Why TMG_1/Why TMG_1.png', dest: 'tmg/tmg-why-1.jpg' },
  { src: 'TMG/Why TMG_1/Why TMG_2.png', dest: 'tmg/tmg-why-2.jpg' },
  { src: 'TMG/Why TMG_1/Why TMG_3.png', dest: 'tmg/tmg-why-3.jpg' },
  { src: 'TMG/Why TMG_1/Why TMG_4.png', dest: 'tmg/tmg-why-4.jpg' },

  // WONETEN
  { src: 'Woneten/Woneten Ai Poster  FInal.png', dest: 'woneten/woneten-ai-poster.jpg' },
  { src: 'Woneten/Wonten Diwali Sale Starts -OUT.png', dest: 'woneten/woneten-post-diwali-sale.jpg' },

  // YAAZHI
  { src: 'Yaazhi/Pendant 2/Pendant Chain 2_1.png', dest: 'yaazhi/yaazhi-pendant-chain-1.jpg' },
  { src: 'Yaazhi/Pendant 2/Pendant Chain 2_2.png', dest: 'yaazhi/yaazhi-pendant-chain-2.jpg' },
  { src: 'Yaazhi/Pendant 2/Pendant Chain 2_3.png', dest: 'yaazhi/yaazhi-pendant-chain-3.jpg' },

  // ZEN
  { src: 'ZEN/Afrah Future of Workspaces - thumbnail.png', dest: 'zen/zen-thumb-afrah.jpg' },
  { src: 'ZEN/Factory Manager  -  thumbnail.png', dest: 'zen/zen-thumb-factory-manager.jpg' },
  { src: 'ZEN/How your office is designed - thumbnail.png', dest: 'zen/zen-thumb-office-designed.jpg' },

  // ANIVOM
  { src: 'Anivom/Anivom - Rakshabandhan story.jpeg', dest: 'anivom/anivom-post-raksha.jpg' },
];

async function run() {
  console.log(`Starting optimization of ${itemsToProcess.length} portfolio assets...`);
  let count = 0;
  for (const item of itemsToProcess) {
    const srcPath = path.join(SOURCE_BASE, item.src);
    const destPath = path.join(DEST_BASE, item.dest);

    if (!fs.existsSync(srcPath)) {
      console.warn(`[WARN] Source not found: ${srcPath}`);
      continue;
    }

    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // Strictly preserve original aspect ratio:
    // Only constrain max width to 2000px without enlargement, let height scale naturally.
    await sharp(srcPath)
      .resize({ width: 2000, withoutEnlargement: true })
      .jpeg({ quality: 86, progressive: true })
      .toFile(destPath);

    count++;
  }
  console.log(`Successfully optimized and verified ${count} assets!`);
}

run().catch(console.error);
