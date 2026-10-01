import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const sourceRoot = path.resolve('Selected works/Selected works');
const manifestPath = path.resolve('src/data/selectedWorks.ts');
const manifest = await fs.readFile(manifestPath, 'utf8');
const encodedWorks = manifest.match(/export const selectedWorks: SelectedWorkItem\[\] = ([\s\S]*);\s*$/)?.[1];
if (!encodedWorks) throw new Error('Could not read the selected works manifest.');
const works = JSON.parse(encodedWorks);
const sourceByStem = new Map();
const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);
const filesByDirectory = new Map();
const carouselFiles = new Set();

async function walk(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(absolute);
    else {
      const relative = path.relative(sourceRoot, absolute);
      sourceByStem.set(relative.replace(/\.[^.]+$/, '').toLowerCase(), absolute);
      if (imageExtensions.has(path.extname(absolute).toLowerCase())) {
        const directory = path.dirname(absolute);
        filesByDirectory.set(directory, [...(filesByDirectory.get(directory) || []), absolute]);
      }
    }
  }
}
await walk(sourceRoot);

const carouselDirectories = new Set();
for (const [directory, files] of filesByDirectory) {
  const names = files.map((file) => path.basename(file).toLowerCase());
  const folderName = path.basename(directory).toLowerCase();
  const presentationSequence = files.length >= 4 && names.some((name) => name.includes('presentation'));
  const explicitlyPosterWork = /(poster|packaging|thumbnail|story)/i.test(folderName);
  if (!explicitlyPosterWork && (folderName.includes('carousel') || presentationSequence)) carouselDirectories.add(directory);
  if (!explicitlyPosterWork) {
    const numberedFamilies = new Map();
    for (const file of files.filter((item) => !/(poster|packaging|thumbnail|story)/i.test(path.basename(item)))) {
      const stem = path.basename(file, path.extname(file)).toLowerCase().replace(/(?:[_\s-]*\d+)$/, '').replace(/[^a-z0-9]+/g, '');
      numberedFamilies.set(stem, [...(numberedFamilies.get(stem) || []), file]);
    }
    for (const family of numberedFamilies.values()) {
      if (family.length >= 4) family.forEach((file) => carouselFiles.add(file));
    }
  }
}

function cleanCollectionLabel(label, brand) {
  const brandPrefix = new RegExp(`^(?:${brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}|bkt)[\\s_-]*`, 'i');
  const clean = label.replace(brandPrefix, '').replace(/\b(carousel|presentation|cover)\b/gi, ' ')
    .replace(/[(_-]?\s*\d+\)?$/g, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim() || 'Carousel';
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

for (const work of works) {
  const relativeAsset = decodeURIComponent(work.image.replace(/^\/selected-works\//, '')).replaceAll('/', path.sep);
  const sourcePath = sourceByStem.get(relativeAsset.replace(/\.webp$/i, '').toLowerCase());
  let width = 0;
  let height = 0;
  if (sourcePath && work.type !== 'pdf') {
    const metadata = await sharp(sourcePath, { limitInputPixels: false }).metadata();
    width = metadata.width || 0;
    height = metadata.height || 0;
    if (metadata.orientation && metadata.orientation >= 5 && metadata.orientation <= 8) [width, height] = [height, width];
  }

  const hints = `${relativeAsset} ${work.title}`.toLowerCase();
  const ratio = width && height ? width / height : 0;
  const hasStoryLabel = /(^|[\\/ _-])(story|stories)([\\/ _-]|$)/i.test(hints);
  const hasThumbnailLabel = /(thumbnail|thumbs?|youtube)/i.test(hints);
  const sourceDirectory = sourcePath ? path.dirname(sourcePath) : '';
  const hasCarouselLabel = /carousel/i.test(hints) || carouselDirectories.has(sourceDirectory) || carouselFiles.has(sourcePath);
  const hasLogoPresentationLabel = /logo.*presentation|presentation.*logo/i.test(hints);
  const isStory = hasStoryLabel || (!hasThumbnailLabel && !hasCarouselLabel && ratio <= 0.63);
  const isThumbnail = !hasStoryLabel && hasThumbnailLabel;
  const isCarousel = !hasStoryLabel && !hasThumbnailLabel && hasCarouselLabel;
  const isPoster = !isStory && !isThumbnail && !isCarousel && (
    (ratio >= 0.70 && ratio <= 0.96) || /(poster|\bads?\b|campaign|carousel|social|creative|\bpost\b)/i.test(hints)
  );

  work.width = width;
  work.height = height;
  work.category = hasLogoPresentationLabel ? 'Logo Presentation' : isStory ? 'Stories' : isThumbnail ? 'Thumbnails' : isCarousel ? 'Carousels' : isPoster ? 'Posters & Ads' : 'Other';
  if (isCarousel) {
    const relativeParts = relativeAsset.split(path.sep);
    const collectionSource = relativeParts.length > 2 ? relativeParts[1] : work.title;
    work.collection = cleanCollectionLabel(collectionSource, work.brand);
  } else {
    work.collection = '';
  }
}

const brands = [...new Set(works.map((work) => work.brand))];
const output = `// Generated from the brand-organized Selected works folder.\nexport type SelectedWorkCategory = 'Logo Presentation' | 'Stories' | 'Posters & Ads' | 'Thumbnails' | 'Carousels' | 'Other';\nexport interface SelectedWorkItem { id: number; brand: string; title: string; image: string; type: 'image' | 'pdf'; width: number; height: number; category: SelectedWorkCategory; collection: string; }\nexport const selectedWorkBrands = ${JSON.stringify(brands, null, 2)} as const;\nexport const selectedWorks: SelectedWorkItem[] = ${JSON.stringify(works, null, 2)};\n`;
await fs.writeFile(manifestPath, output);
const counts = Object.groupBy(works, (work) => work.category);
for (const [category, items] of Object.entries(counts)) console.log(`${category}: ${items.length}`);
