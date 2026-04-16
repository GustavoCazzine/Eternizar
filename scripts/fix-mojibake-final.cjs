const fs = require('fs');

// Fix sucesso
let s = fs.readFileSync('src/app/sucesso/page.tsx', 'utf8');

// Remove ALL remaining mojibake by scanning char by char
function removeMojibake(str) {
  // ð = U+00F0, next char often Ÿ (U+0178) or other high chars
  // These are double-encoded emoji starts
  return str
    .replace(/\u00F0[\u0100-\u024F][\u0080-\u024F]{0,2}/g, '')
    .replace(/ðŸ[\s\S]{0,4}/g, '')
    .replace(/â™[\s\S]{0,1}/g, '')
    .replace(/â€[\s\S]{0,1}/g, '')
    .replace(/â\u0094[\s\S]{0,1}/g, '')
    .replace(/â\u0095[\s\S]{0,1}/g, '')
    .replace(/vocàª/g, 'voc\u00ea');
}

s = removeMojibake(s);

// Fix the floating emoji array - just remove it entirely
s = s.replace(/\{?\['\u2665'[^}]*motion\.div>\s*\)\)\}?/gs, '');

// Fix share text
s = s.replace(/text:\s*'[^']*surpresa[^']*'/g, "text: 'Tenho uma surpresa especial para voce!'");

fs.writeFileSync('src/app/sucesso/page.tsx', s, 'utf8');
console.log('OK: sucesso');

// Fix painel
let p = fs.readFileSync('src/app/painel/PainelCliente.tsx', 'utf8');
p = removeMojibake(p);
// Fix fallback icon that got emptied
p = p.replace(/\|\| ''/g, "|| '*'");
p = p.replace(/\|\| 'Œ'/g, "|| '*'");
fs.writeFileSync('src/app/painel/PainelCliente.tsx', p, 'utf8');
console.log('OK: painel');

// Verify ALL tsx files
const path = require('path');
function walk(dir) {
  const out = [];
  for (const item of fs.readdirSync(dir)) {
    if (item === 'node_modules' || item === '.next' || item.startsWith('.')) continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.tsx$/.test(item)) out.push(full);
  }
  return out;
}

let total = 0;
for (const f of walk('src')) {
  const c = fs.readFileSync(f, 'utf8');
  const bad = [...c.matchAll(/ðŸ|\u00F0[\u0100-\u024F]/g)];
  if (bad.length) {
    console.log('BAD:', path.relative('.', f), bad.length);
    total += bad.length;
  }
}
console.log(total ? '\n' + total + ' remain' : '\nALL CLEAN');
