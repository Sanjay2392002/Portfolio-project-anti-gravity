import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import sharp from 'sharp';

const execFileAsync = promisify(execFile);
const ROOT = process.cwd();
const TARGET_DIR = path.join(ROOT, 'public', 'selected-works');
const BACKUP_DIR = path.join(ROOT, 'image-backups');
const MAX_DIMENSION = 2400;
const IMAGE_EXTENSIONS = new Set(['.webp', '.jpg', '.jpeg', '.png', '.avif']);

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else if (IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) files.push(full);
  }
  return files;
}

async function zipWithPowerShell(sourceDir, zipPath) {
  if (process.platform !== 'win32') {
    throw new Error('This backup step currently expects Windows PowerShell. Run this script from the Windows project machine.');
  }
  await execFileAsync('powershell.exe', [
    '-NoProfile',
    '-NonInteractive',
    '-Command',
    'Compress-Archive',
    '-LiteralPath', sourceDir,
    '-DestinationPath', zipPath,
    '-CompressionLevel', 'Optimal',
    '-Force'
  ]);
}

async function verifyZip(zipPath) {
  const verifyDir = await fs.mkdtemp(path.join(os.tmpdir(), 'portfolio-backup-verify-'));
  try {
    await execFileAsync('powershell.exe', [
      '-NoProfile',
      '-NonInteractive',
      '-Command',
      'Expand-Archive',
      '-LiteralPath', zipPath,
      '-DestinationPath', verifyDir,
      '-Force'
    ]);
    const files = await walk(verifyDir);
    return files.length;
  } finally {
    await fs.rm(verifyDir, { recursive: true, force: true });
  }
}

async function main() {
  const sourceFiles = await walk(TARGET_DIR);
  if (!sourceFiles.length) throw new Error('No portfolio image files found.');

  await fs.mkdir(BACKUP_DIR, { recursive: true });
  const backupName = `portfolio-original-images-${timestamp()}.zip`;
  const backupZip = path.join(BACKUP_DIR, backupName);

  // 1) Backup originals into a temporary folder that preserves the selected-works tree.
  const tempBackup = await fs.mkdtemp(path.join(os.tmpdir(), 'portfolio-originals-'));
  try {
    for (const source of sourceFiles) {
      const relative = path.relative(TARGET_DIR, source);
      const destination = path.join(tempBackup, 'selected-works', relative);
      await fs.mkdir(path.dirname(destination), { recursive: true });
      await fs.copyFile(source, destination);
    }

    // Backup must exist before any source file is touched.
    await zipWithPowerShell(path.join(tempBackup, 'selected-works'), backupZip);
  } finally {
    await fs.rm(tempBackup, { recursive: true, force: true });
  }

  const backupFileCount = await verifyZip(backupZip);
  if (backupFileCount !== sourceFiles.length) {
    throw new Error(`Backup verification failed: expected ${sourceFiles.length} files, found ${backupFileCount} in the ZIP. No originals were modified.`);
  }

  // 2) Generate optimized temporary files first. Nothing is replaced until every file succeeds.
  const results = [];
  const tempOutputs = [];

  try {
    for (const source of sourceFiles) {
      const ext = path.extname(source).toLowerCase();
      const tempOutput = `${source}.__optimized${ext}`;
      tempOutputs.push(tempOutput);

      const inputMeta = await sharp(source, { animated: false }).metadata();
      const pipeline = sharp(source)
        .resize({
          width: MAX_DIMENSION,
          height: MAX_DIMENSION,
          fit: 'inside',
          withoutEnlargement: true,
          fastShrinkOnLoad: true
        });

      if (ext === '.webp') {
        await pipeline.webp({
          quality: 90,
          effort: 6,
          smartSubsample: true
        }).toFile(tempOutput);
      } else if (ext === '.png') {
        await pipeline.png({
          compressionLevel: 9,
          adaptiveFiltering: true
        }).toFile(tempOutput);
      } else if (ext === '.avif') {
        await pipeline.avif({
          quality: 82,
          effort: 8,
          chromaSubsampling: '4:4:4'
        }).toFile(tempOutput);
      } else {
        await pipeline.jpeg({
          quality: 92,
          chromaSubsampling: '4:4:4',
          progressive: true,
          mozjpeg: true
        }).toFile(tempOutput);
      }

      const outputMeta = await sharp(tempOutput, { animated: false }).metadata();
      const originalSize = (await fs.stat(source)).size;
      const optimizedSize = (await fs.stat(tempOutput)).size;

      if (!outputMeta.width || !outputMeta.height) {
        throw new Error(`Could not verify optimized dimensions for ${source}`);
      }

      // Never replace a file if the "optimization" made it larger.
      if (optimizedSize >= originalSize && outputMeta.width >= (inputMeta.width ?? 0) && outputMeta.height >= (inputMeta.height ?? 0)) {
        await fs.rm(tempOutput, { force: true });
        results.push({ file: path.relative(ROOT, source), action: 'unchanged', before: originalSize, after: originalSize });
        continue;
      }

      results.push({
        file: path.relative(ROOT, source),
        action: 'optimized',
        before: originalSize,
        after: optimizedSize,
        beforeDimensions: `${inputMeta.width}x${inputMeta.height}`,
        afterDimensions: `${outputMeta.width}x${outputMeta.height}`
      });
    }

    // 3) Only after every optimized candidate was generated and verified, replace originals.
    for (const result of results) {
      if (result.action !== 'optimized') continue;
      const source = path.join(ROOT, result.file);
      const tempOutput = `${source}.__optimized${path.extname(source)}`;
      await fs.rename(tempOutput, source);
    }
  } catch (error) {
    // Roll back any temporary output; originals remain untouched.
    for (const file of tempOutputs) await fs.rm(file, { force: true }).catch(() => {});
    throw error;
  }

  const totalBefore = results.reduce((sum, item) => sum + item.before, 0);
  const totalAfter = results.reduce((sum, item) => sum + item.after, 0);
  const optimizedCount = results.filter((item) => item.action === 'optimized').length;
  const saved = totalBefore - totalAfter;

  console.log(JSON.stringify({
    backupZip,
    backupFileCount,
    imageCount: sourceFiles.length,
    optimizedCount,
    unchangedCount: sourceFiles.length - optimizedCount,
    totalBefore,
    totalAfter,
    bytesSaved: saved,
    percentReduction: totalBefore ? Number(((saved / totalBefore) * 100).toFixed(2)) : 0,
    results
  }, null, 2));
}

main().catch((error) => {
  console.error(error?.stack || error);
  process.exit(1);
});
