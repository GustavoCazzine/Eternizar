const fs = require('fs');
const path = require('path');

function walk(dir) {
  const out = [];
  for (const item of fs.readdirSync(dir)) {
    if (item === 'node_modules' || item === '.next' || item.startsWith('.')) continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(tsx?|jsx?)$/.test(item)) out.push(full);
  }
  return out;
}

let fixed = 0;
for (const f of walk('src')) {
  let c = fs.readFileSync(f, 'utf8');
  const before = c;

  // Fix corrupted box-drawing comment lines
  // Pattern: sequences of corrupted chars used as separators
  c = c.replace(/[â\u2500-\u257F]{3,}/g, '---');
  c = c.replace(/â\u0094\u0080/g, '-');
  c = c.replace(/â\u0095\u0090/g, '=');

  if (c !== before) {
    fs.writeFileSync(f, c, 'utf8');
    fixed++;
  }
}
console.log('Comment encoding fix:', fixed, 'files');
