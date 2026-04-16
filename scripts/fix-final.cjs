const fs = require('fs');

// === 1. FIX SUCESSO PAGE ===
let suc = fs.readFileSync('src/app/sucesso/page.tsx', 'utf8');

// Remove floating emoji animation (lines with emoji map)
suc = suc.replace(
  /\{?\[?'[\u00F0\u0178\u0080-\u00FF\u2728\u{1F300}-\u{1F9FF}]+',?\s*'[\u00F0\u0178\u0080-\u00FF\u2728\u{1F300}-\u{1F9FF}]+',?\s*'[\u00F0\u0178\u0080-\u00FF\u2728\u{1F300}-\u{1F9FF}]+'?\]\.map\(\(e,\s*i\)\s*=>\s*\(\s*<motion\.div[\s\S]*?<\/motion\.div>\s*\)\)\}?/gu,
  '{/* decorations removed for performance */}'
);

// Fix PhoneMockup emoji - replace ðŸ'' with simple heart div
suc = suc.replace(
  /\u00F0\u0178\u201C\u2019|\u00F0\u0178\u2019\u2019/g,
  '\u2665'
);

// Fix remaining mojibake emojis in sucesso
suc = suc.replace(/\u00F0\u0178\u2019\u2013/g, '\u2665'); // 💖 -> heart
suc = suc.replace(/\u00F0\u0178\u0178\u2019/g, '\u2665'); // variant
suc = suc.replace(/\u00F0\u0178\u0178\u0096/g, '\u2665');
suc = suc.replace(/\u00F0\u0178\u0152\u00B6/g, '\u266B'); // 🎶 -> ♫
suc = suc.replace(/\u00F0\u0178\u0152\u00B5/g, '\u266B'); // 🎵 -> ♫
suc = suc.replace(/\u00F0\u0178\u0152/g, '');  // remaining 🎁 etc
suc = suc.replace(/\u00E2\u201E\u00A8/g, '*');  // ✨ mojibake
suc = suc.replace(/\u00E2\u201C\u201C/g, '-');  // box drawing
suc = suc.replace(/\u00E2\u201C\u0080/g, '-');
suc = suc.replace(/\u00E2\u2022\u0090/g, '=');  // double line
suc = suc.replace(/\u00E2\u2022\u2022/g, '=');
suc = suc.replace(/\u00E2\u0084\u00A2/g, '');   // ™ etc
suc = suc.replace(/\u00E2\u20AC\u201C/g, '-');   // em dash mojibake
suc = suc.replace(/\u00E2\u0153\u201C/g, '*');   // check mark

// Fix mobile layout: capas grid stack on mobile
suc = suc.replace(
  'className="grid grid-cols-1 sm:grid-cols-2 gap-6"',
  'className="flex flex-col items-center gap-8 sm:grid sm:grid-cols-2"'
);

// Fix PhoneMockup - remove heavy animations, simplify
// Replace music note emojis
suc = suc.replace(/\u00E2\u2122\u00AA/g, '');  // ♪ mojibake
suc = suc.replace(/\u00E2\u2122\u00AB/g, '');  // ♫ mojibake  
suc = suc.replace(/\u00E2\u2122\u00AC/g, '');  // ♬ mojibake

// Remove remaining raw mojibake sequences (ð + any high byte combos)
suc = suc.replace(/\u00F0\u0178[\u0080-\u00FF]{1,2}/g, '');

fs.writeFileSync('src/app/sucesso/page.tsx', suc, 'utf8');
console.log('OK: sucesso');

// === 2. FIX PAINEL ===
let pan = fs.readFileSync('src/app/painel/PainelCliente.tsx', 'utf8');

// Replace emoji map with text symbols
pan = pan.replace(
  /casal:\s*'[^']*',\s*formatura:\s*'[^']*',\s*homenagem:\s*'[^']*'/,
  "casal: '\u2665', formatura: '\u2605', homenagem: '\u2605'"
);

// Fix ðŸ'Œ
pan = pan.replace(/\u00F0\u0178[\u0080-\u00FF]{1,2}/g, '\u2665');
pan = pan.replace(/\u00E2\u20AC\u201C/g, '-');
pan = pan.replace(/\u00E2\u20AC\u00A2/g, '*');

fs.writeFileSync('src/app/painel/PainelCliente.tsx', pan, 'utf8');
console.log('OK: painel');

// === 3. FIX CAPA INSTAGRAM ===
let capa = fs.readFileSync('src/components/CapaInstagram.tsx', 'utf8');

// Replace emoji map
capa = capa.replace(
  /casal:\s*'[^']*',\s*formatura:\s*'[^']*',\s*homenagem:\s*'[^']*'/,
  "casal: '\u2665', formatura: '\u2605', homenagem: '\u2605'"
);

fs.writeFileSync('src/components/CapaInstagram.tsx', capa, 'utf8');
console.log('OK: capa instagram');

// === 4. FIX LANDING PAGE - remove heavy framer motion animations ===
let land = fs.readFileSync('src/app/page.tsx', 'utf8');

// Replace any remaining mojibake
land = land.replace(/\u00F0\u0178[\u0080-\u00FF]{1,2}/g, '');
land = land.replace(/\u00E2\u20AC[\u0080-\u00FF]/g, '');

fs.writeFileSync('src/app/page.tsx', land, 'utf8');
console.log('OK: landing');

// === 5. VERIFY ===
let remaining = 0;
for (const f of ['src/app/sucesso/page.tsx','src/app/painel/PainelCliente.tsx','src/components/CapaInstagram.tsx','src/app/page.tsx']) {
  const c = fs.readFileSync(f, 'utf8');
  const bad = [...c.matchAll(/\u00F0\u0178|ðŸ/g)];
  if (bad.length) {
    console.log('REMAINING:', f, bad.length);
    remaining += bad.length;
  }
}
console.log(remaining ? '\n' + remaining + ' mojibake remain' : '\nALL CLEAN');
