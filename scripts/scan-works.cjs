const fs = require('fs');
const path = require('path');

const baseDir = 'F:\\AA Portfoliio works';
const dirs = fs.readdirSync(baseDir).filter(f => fs.statSync(path.join(baseDir, f)).isDirectory());

console.log(`Found ${dirs.length} client/brand folders in "${baseDir}".\n`);

function scan(dir) {
  let list = [];
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      list = list.concat(scan(full));
    } else if (/\.(png|jpe?g|webp|gif|svg|mp4)$/i.test(entry)) {
      list.push({
        path: full,
        rel: path.relative(baseDir, full),
        name: entry,
        sizeMb: (stat.size / (1024 * 1024)).toFixed(2)
      });
    }
  }
  return list;
}

const report = {};
dirs.forEach(d => {
  const folderPath = path.join(baseDir, d);
  const media = scan(folderPath);
  report[d] = media;
  console.log(`=== ${d} [Total Media: ${media.length}] ===`);
  media.slice(0, 20).forEach(m => {
    console.log(`  - ${m.rel} (${m.sizeMb} MB)`);
  });
  if (media.length > 20) {
    console.log(`  ... and ${media.length - 20} more files`);
  }
  console.log('');
});

fs.writeFileSync(path.join(__dirname, 'works-inventory.json'), JSON.stringify(report, null, 2));
console.log('Saved works inventory to scripts/works-inventory.json');
