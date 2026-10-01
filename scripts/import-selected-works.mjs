import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const sourceRoot = path.resolve('Selected works/Selected works');
const outputRoot = path.resolve('public/selected-works');
const manifestPath = path.resolve('src/data/selectedWorks.ts');
const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);
const categories = ['Logo Presentation', 'Stories', 'Posters & Ads', 'Thumbnails', 'Carousels', 'Other'];
const files = [];
const carouselFiles = new Set();

function cleanCollectionLabel(label, brand) {
  const brandPrefix = new RegExp(`^(?:${brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}|bkt)[\\s_-]*`, 'i');
  const clean = label.replace(brandPrefix, '').replace(/\b(carousel|presentation|cover)\b/gi, ' ')
    .replace(/[(_-]?\s*\d+\)?$/g, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim() || 'Carousel';
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function classifyWork(relative, title, width, height, isCarouselDirectory) {
  const hints = `${relative} ${title}`.toLowerCase();
  const ratio = width && height ? width / height : 0;
  const hasStoryLabel = /(^|[\\/ _-])(story|stories)([\\/ _-]|$)/i.test(hints);
  const hasThumbnailLabel = /(thumbnail|thumbs?|youtube)/i.test(hints);
  const hasCarouselLabel = /carousel/i.test(hints) || isCarouselDirectory;
  if (/logo.*presentation|presentation.*logo/i.test(hints)) return 'Logo Presentation';
  if (hasStoryLabel || (!hasThumbnailLabel && !hasCarouselLabel && ratio <= 0.63)) return 'Stories';
  if (!hasStoryLabel && hasThumbnailLabel) return 'Thumbnails';
  if (!hasStoryLabel && !hasThumbnailLabel && hasCarouselLabel) return 'Carousels';
  if ((ratio >= 0.70 && ratio <= 0.96) || /(poster|\bads?\b|campaign|carousel|social|creative|\bpost\b)/i.test(hints)) return 'Posters & Ads';
  return 'Other';
}

async function walk(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(absolute);
    else if (imageExtensions.has(path.extname(entry.name).toLowerCase()) || path.extname(entry.name).toLowerCase() === '.pdf') files.push(absolute);
  }
}

await walk(sourceRoot);
files.sort((a, b) => a.localeCompare(b));
const filesByDirectory = new Map();
for (const file of files.filter((item) => imageExtensions.has(path.extname(item).toLowerCase()))) {
  const directory = path.dirname(file);
  filesByDirectory.set(directory, [...(filesByDirectory.get(directory) || []), file]);
}
const carouselDirectories = new Set();
for (const [directory, members] of filesByDirectory) {
  const names = members.map((file) => path.basename(file).toLowerCase());
  const folderName = path.basename(directory).toLowerCase();
  const presentationSequence = members.length >= 4 && names.some((name) => name.includes('presentation'));
  const explicitlyPosterWork = /(poster|packaging|thumbnail|story)/i.test(folderName);
  if (!explicitlyPosterWork && (folderName.includes('carousel') || presentationSequence)) carouselDirectories.add(directory);
  if (!explicitlyPosterWork) {
    const numberedFamilies = new Map();
    for (const file of members.filter((item) => !/(poster|packaging|thumbnail|story)/i.test(path.basename(item)))) {
      const stem = path.basename(file, path.extname(file)).toLowerCase().replace(/(?:[_\s-]*\d+)$/, '').replace(/[^a-z0-9]+/g, '');
      numberedFamilies.set(stem, [...(numberedFamilies.get(stem) || []), file]);
    }
    for (const family of numberedFamilies.values()) {
      if (family.length >= 4) family.forEach((file) => carouselFiles.add(file));
    }
  }
}
const works = [];

for (const [index, file] of files.entries()) {
  const relative = path.relative(sourceRoot, file);
  const parts = relative.split(path.sep);
  const brand = parts[0];
  const parentIsCarousel = carouselDirectories.has(path.dirname(file)) || carouselFiles.has(file);
  const isPdf = path.extname(file).toLowerCase() === '.pdf';
  const title = path.basename(file, path.extname(file)).replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  const outputRelative = isPdf ? relative : relative.replace(/\.[^.]+$/, '.webp');
  const output = path.join(outputRoot, outputRelative);
  await fs.mkdir(path.dirname(output), { recursive: true });
  let width = 0;
  let height = 0;
  if (isPdf) {
    await fs.copyFile(file, output);
  } else {
    const metadata = await sharp(file, { limitInputPixels: false }).metadata();
    width = metadata.width || 0;
    height = metadata.height || 0;
    if (metadata.orientation && metadata.orientation >= 5 && metadata.orientation <= 8) [width, height] = [height, width];
    await sharp(file, { limitInputPixels: false })
      .rotate()
      .resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 79, effort: 5 })
      .toFile(output);
  }

  works.push({
    id: index + 1,
    brand,
    title,
    image: `/selected-works/${outputRelative.split(path.sep).map(encodeURIComponent).join('/')}`,
    type: isPdf ? 'pdf' : 'image',
    width,
    height,
    category: classifyWork(relative, title, width, height, parentIsCarousel),
    collection: classifyWork(relative, title, width, height, parentIsCarousel) === 'Carousels'
      ? cleanCollectionLabel(parts.length > 2 ? parts[1] : title, brand)
      : '',
  });
}

const brands = [...new Set(works.map((work) => work.brand))];
await fs.writeFile(
  manifestPath,
  `// Generated from the brand-organized Selected works folder.\nexport type SelectedWorkCategory = ${categories.map((category) => `'${category}'`).join(' | ')};\nexport interface SelectedWorkItem { id: number; brand: string; title: string; image: string; type: 'image' | 'pdf'; width: number; height: number; category: SelectedWorkCategory; collection: string; }\nexport const selectedWorkBrands = ${JSON.stringify(brands, null, 2)} as const;\nexport const selectedWorks: SelectedWorkItem[] = ${JSON.stringify(works, null, 2)};\n`,
);
console.log(`Imported ${works.length} works across ${brands.length} brands.`);
