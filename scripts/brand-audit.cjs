const fs = require('fs');
const path = require('path');

// Scan all files for brand-specific strings
function walk(dir) {
  const out = [];
  for (const item of fs.readdirSync(dir)) {
    if (item === 'node_modules' || item === '.next' || item.startsWith('.') || item === 'scripts') continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(tsx?|css|json|ts|md)$/.test(item)) out.push(full);
  }
  return out;
}

const brandTerms = ['eternizar', 'Eternizar', 'ETERNIZAR', 'eternizar.io', 'memoria-app', '#ff2d78', '#ec4899', 'logo.png'];
const files = walk('src').concat(['next.config.ts', 'package.json', 'DEPLOY.md', 'vercel.json']);

console.log('=== BRAND AUDIT ===\n');
for (const term of brandTerms) {
  const matches = [];
  for (const f of files) {
    try {
      const c = fs.readFileSync(f, 'utf8');
      const count = c.split(term).length - 1;
      if (count > 0) matches.push(`${path.relative('.', f)} (${count}x)`);
    } catch {}
  }
  if (matches.length) {
    console.log(`"${term}": ${matches.length} files`);
    matches.forEach(m => console.log(`  ${m}`));
  }
}

console.log('\n=== FILES TO UPDATE FOR REBRAND ===');
console.log('1. /public/logo.png — substituir com novo logo');
console.log('2. src/app/layout.tsx — title, description, OG tags');
console.log('3. src/app/page.tsx — landing page copy');
console.log('4. next.config.ts — metadataBase URL');
console.log('5. package.json — name');
console.log('6. vercel.json — domain config');
console.log('7. .env — NEXT_PUBLIC_APP_URL');
console.log('8. Vercel Dashboard — custom domain');
