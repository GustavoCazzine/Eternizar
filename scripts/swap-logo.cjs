const fs = require('fs');
const path = require('path');

function walk(dir) {
  const out = [];
  for (const item of fs.readdirSync(dir)) {
    if (item === 'node_modules' || item === '.next' || item.startsWith('.')) continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.tsx?$/.test(item)) out.push(full);
  }
  return out;
}

let count = 0;
for (const f of walk('src')) {
  let c = fs.readFileSync(f, 'utf8');
  if (c.includes('logo.png')) {
    c = c.split('logo.png').join('logo.svg');
    fs.writeFileSync(f, c, 'utf8');
    count++;
    console.log('UPDATED:', path.relative('.', f));
  }
}
console.log('Total:', count, 'files');
