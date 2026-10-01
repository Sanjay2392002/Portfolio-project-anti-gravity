const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outDir = path.resolve(__dirname, '../public/assets/character');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function keyAlpha(buffer, width, height) {
  const out = Buffer.from(buffer);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = out[idx];
      const g = out[idx + 1];
      const b = out[idx + 2];
      
      // Sky blue studio background:
      if ((b > 180 && b > r + 22 && g > r + 12) || (b > 165 && b > r + 35 && g > r + 15)) {
        out[idx + 3] = 0;
      }
      // Top or bottom border lines
      if ((y < 4 || y > height - 4) && (r > 200 && g > 200 && b > 200)) {
        out[idx + 3] = 0;
      }
    }
  }
  return out;
}

async function processAll() {
  const poses = [
    { name: 'front', left: 15, width: 195, top: 45, height: 680 },
    { name: 'front-right', left: 232, width: 185, top: 45, height: 680 },
    { name: 'front-left', left: 990, width: 205, top: 45, height: 680 },
    { name: 'head-front', left: 15, width: 205, top: 790, height: 315 },
    { name: 'head-threequarter', left: 228, width: 205, top: 790, height: 315 },
  ];

  const sourceFile = path.resolve(__dirname, '../3d character.png');

  for (const p of poses) {
    // 1. Studio background version
    await sharp(sourceFile)
      .extract({ left: p.left, top: p.top, width: p.width, height: p.height })
      .toFile(path.join(outDir, p.name + '.png'));

    // 2. Transparent background version
    const { data, info } = await sharp(sourceFile)
      .extract({ left: p.left, top: p.top, width: p.width, height: p.height })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const keyed = keyAlpha(data, info.width, info.height);

    await sharp(keyed, { raw: { width: info.width, height: info.height, channels: 4 } })
      .png()
      .toFile(path.join(outDir, p.name + '-trans.png'));
  }

  // Copy character turnaround sheet into public/assets/character/character-sheet.png
  fs.copyFileSync(sourceFile, path.join(outDir, 'character-sheet.png'));

  console.log('Successfully re-processed character assets!');
}

processAll().catch(console.error);
