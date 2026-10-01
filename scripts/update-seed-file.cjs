const fs = require('fs');
const path = require('path');

const dbData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../server/data/db.json'), 'utf8'));

const seedFilePath = path.resolve(__dirname, '../server/db/seed.js');

// Read current seed file to keep admin, settings, and about intact
let seedContent = fs.readFileSync(seedFilePath, 'utf8');

// Build the projectsData array with embedded blocks
const projectsWithBlocks = dbData.projects.map(p => {
  const blocks = (dbData.content_blocks || [])
    .filter(b => b.project_id === p.id)
    .sort((a, b) => a.sort_order - b.sort_order);
  return {
    ...p,
    blocks
  };
});

const projectsDataString = JSON.stringify(projectsWithBlocks, null, 2);

// Replace projectsData in seed.js
const regex = /const projectsData = \[[\s\S]*?\];\s*\/\/\s*Upsert or create each project/;
if (regex.test(seedContent)) {
  seedContent = seedContent.replace(
    regex,
    `const projectsData = ${projectsDataString};\n\n  // Upsert or create each project`
  );
  fs.writeFileSync(seedFilePath, seedContent, 'utf8');
  console.log('Successfully updated server/db/seed.js with the 21 curated projects and blocks!');
} else {
  console.error('Could not match regex in server/db/seed.js');
}
