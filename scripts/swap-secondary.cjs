const fs = require('fs');
const path = require('path');

// #ec4899 is the secondary pink used in palettes, tipos, etc
// Change to a slightly lighter wine: #B91C3C (rose-wine)
const OLD = '#ec4899';
const NEW = '#B91C3C';

function walk(dir) {
  const out = [];
  for (const item of fs.readdirSync(dir)) {
    if (item === 'node_modules' || item === '.next' || item.startsWith('.') || item === 'scripts') continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(tsx?|css)$/.test(item)) out.push(full);
  }
  return out;
}

let count = 0;
for (const f of walk('src')) {
  let c = fs.readFileSync(f, 'utf8');
  if (c.includes(OLD)) {
    c = c.split(OLD).join(NEW);
    fs.writeFileSync(f, c, 'utf8');
    count++;
    console.log('UPDATED:', path.relative('.', f));
  }
}
console.log('Total:', count, 'files with #ec4899 -> #B91C3C');
