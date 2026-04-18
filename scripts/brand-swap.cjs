const fs = require('fs');
const path = require('path');

// ========================================
// BRAND SWAP — Eternizar Premium
// ========================================

const OLD_PINK = '#ff2d78';
const NEW_WINE = '#9B1B30';
const OLD_TAGLINE = 'Homenagens digitais que emocionam';
const NEW_TAGLINE = 'Onde o seu amor vive para sempre.';
const OLD_DESC = 'Transforme mem\u00f3rias em p\u00e1ginas inesquec\u00edveis. Crie homenagens digitais com m\u00fasica, fotos e sua hist\u00f3ria. Para casais, formaturas e todas as celebra\u00e7\u00f5es.';
const NEW_DESC = 'Transforme seus melhores momentos em uma experi\u00eancia inesquec\u00edvel. Com m\u00fasica, fotos e a hist\u00f3ria de voc\u00eas.';
const OLD_OG_DESC = 'Transforme mem\u00f3rias em p\u00e1ginas inesquec\u00edveis com m\u00fasica, fotos e sua hist\u00f3ria.';
const NEW_OG_DESC = 'Transforme seus melhores momentos em uma experi\u00eancia inesquec\u00edvel.';

function walk(dir) {
  const out = [];
  for (const item of fs.readdirSync(dir)) {
    if (item === 'node_modules' || item === '.next' || item.startsWith('.') || item === 'scripts') continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(tsx?|css|md)$/.test(item)) out.push(full);
  }
  return out;
}

let totalChanged = 0;
const files = [...walk('src'), 'next.config.ts', 'DEPLOY.md'];

for (const f of files) {
  try {
    let c = fs.readFileSync(f, 'utf8');
    const before = c;

    // 1. COLOR: #ff2d78 -> #9B1B30
    c = c.split(OLD_PINK).join(NEW_WINE);

    // 2. Also fix rgba references
    c = c.split('rgba(255, 45, 120').join('rgba(155, 27, 48');
    c = c.split('rgba(255,45,120').join('rgba(155,27,48');

    // 3. TAGLINE
    c = c.split(OLD_TAGLINE).join(NEW_TAGLINE);

    // 4. DESCRIPTION
    c = c.split(OLD_DESC).join(NEW_DESC);
    c = c.split(OLD_OG_DESC).join(NEW_OG_DESC);

    // 5. Title format: add period feel
    c = c.split('Eternizar \u2014 ' + OLD_TAGLINE).join('Eternizar \u2014 ' + NEW_TAGLINE);

    if (c !== before) {
      fs.writeFileSync(f, c, 'utf8');
      totalChanged++;
      const changes = [];
      if (before.includes(OLD_PINK)) changes.push('color');
      if (before.includes(OLD_TAGLINE)) changes.push('tagline');
      if (before.includes(OLD_DESC)) changes.push('desc');
      console.log('UPDATED:', path.relative('.', f), '-', changes.join(', '));
    }
  } catch {}
}

// 6. package.json name
let pkg = fs.readFileSync('package.json', 'utf8');
pkg = pkg.replace('"memoria-app"', '"eternizar"');
fs.writeFileSync('package.json', pkg, 'utf8');
console.log('UPDATED: package.json - name');

// 7. Layout title template
let layout = fs.readFileSync('src/app/layout.tsx', 'utf8');
if (layout.includes(OLD_TAGLINE)) {
  layout = layout.split(OLD_TAGLINE).join(NEW_TAGLINE);
  fs.writeFileSync('src/app/layout.tsx', layout, 'utf8');
}

// 8. Update globals.css pink references in custom properties
let css = fs.readFileSync('src/app/globals.css', 'utf8');
css = css.split(OLD_PINK).join(NEW_WINE);
fs.writeFileSync('src/app/globals.css', css, 'utf8');
console.log('UPDATED: globals.css');

console.log('\nTotal files updated:', totalChanged);
console.log('\n=== MANUAL STEPS REMAINING ===');
console.log('1. Replace /public/logo.png with new serif logo');
console.log('2. Buy domain (eternizar.me or eternizar.app)');
console.log('3. Update .env NEXT_PUBLIC_APP_URL');
console.log('4. Vercel Dashboard -> Domains -> add custom domain');
