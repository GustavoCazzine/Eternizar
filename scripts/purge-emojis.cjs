const fs = require('fs');
const path = require('path');

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

let totalFixed = 0;

for (const f of walk('src')) {
  let c = fs.readFileSync(f, 'utf8');
  const before = c;

  // ===== EMOJI REPLACEMENTS =====
  
  // Decorative emojis in text — remove entirely
  c = c.replace(/ ?✨/g, '');
  c = c.replace(/ ?🥂/g, '');
  c = c.replace(/ ?💕/g, '');
  c = c.replace(/ ?💖/g, '');
  c = c.replace(/ ?💑/g, '');
  c = c.replace(/ ?💌/g, '');
  c = c.replace(/ ?🌹/g, '');
  c = c.replace(/ ?🎉/g, '');
  c = c.replace(/ ?🎊/g, '');
  c = c.replace(/ ?🎈/g, '');
  c = c.replace(/ ?🫶/g, '');
  c = c.replace(/ ?🤍/g, '');
  c = c.replace(/ ?🩷/g, '');
  c = c.replace(/ ?🔥/g, '');
  c = c.replace(/ ?💎/g, '');
  c = c.replace(/ ?🌟/g, '');
  c = c.replace(/ ?⚡/g, '');
  c = c.replace(/ ?🦋/g, '');
  c = c.replace(/ ?🌺/g, '');
  c = c.replace(/ ?🏆/g, '');
  c = c.replace(/ ?🎂/g, '');
  c = c.replace(/ ?👑/g, '');

  // Icon emojis in objects/maps — replace with symbols
  c = c.replace(/icon: '❤️'/g, "icon: '\u2665'");
  c = c.replace(/icon: '🎓'/g, "icon: '\u2605'");
  c = c.replace(/icon: '⭐'/g, "icon: '\u2605'");
  
  // Emoji in emoji field defaults
  c = c.replace(/emoji: '❤️'/g, "emoji: '\u2665'");
  c = c.replace(/emoji: '⭐'/g, "emoji: '\u2605'");
  c = c.replace(/emoji: '🎓'/g, "emoji: '\u2605'");

  // Timeline suggestion emojis -> clean symbols
  c = c.replace(/emoji: '🌹'/g, "emoji: '\u2665'");
  c = c.replace(/emoji: '📍'/g, "emoji: '\u25CF'");
  c = c.replace(/emoji: '✈️'/g, "emoji: '\u2192'");
  c = c.replace(/emoji: '🏠'/g, "emoji: '\u25CB'");
  c = c.replace(/emoji: '💍'/g, "emoji: '\u25C6'");
  c = c.replace(/emoji: '📚'/g, "emoji: '\u25A0'");
  c = c.replace(/emoji: '🍻'/g, "emoji: '\u25CF'");
  c = c.replace(/emoji: '🎮'/g, "emoji: '\u25CF'");

  // Emoji in UI text -> remove or replace with text
  c = c.replace(/🔒 Modo privado/g, 'Modo privado');
  c = c.replace(/🌍 Modo p/g, 'Modo p');
  c = c.replace(/📅 /g, '');
  c = c.replace(/💡 /g, '');
  c = c.replace(/💑 /g, '');
  c = c.replace(/🖼️/g, '');
  c = c.replace(/🔐/g, '\u2022');
  c = c.replace(/🤔 /g, '');
  c = c.replace(/📍/g, '\u2022');
  c = c.replace(/🍕/g, '\u2022');
  c = c.replace(/🎬/g, '\u2022');
  c = c.replace(/🎵 /g, '');
  c = c.replace(/💌/g, '\u2022');

  // Emoji in subtitulo generators
  c = c.replace(/ ❤️'/g, "'");
  c = c.replace(/ ❤️`/g, '`');
  
  // emojisRapidos in editar — replace with clean symbols
  c = c.replace(
    "const emojisRapidos = ['❤️', '🌹', '✈️', '🎉', '💍', '🏠', '🐾', '🎓', '⭐', '🌙', '🌊', '🎵']",
    "const emojisRapidos = ['\u2665', '\u2605', '\u2192', '\u25CF', '\u25C6', '\u25CB', '\u2022', '\u25A0', '\u2605', '\u25CF', '\u25CB', '\u266B']"
  );

  // Placeholder emojis
  c = c.replace(/ ⭐"/g, '"');
  c = c.replace(/ ⭐'/g, "'");

  // Warning emoji in comments
  c = c.replace(/⚠️/g, 'NOTA:');
  c = c.replace(/âš ️/g, 'NOTA:');

  // ♥ in global-error (standalone decorative)
  // Keep ♥ and ★ as they are clean symbols, not emojis

  // Conditional emoji display
  c = c.replace(/tipo === 'casal' \? '❤️'/g, "tipo === 'casal' ? '\u2665'");
  c = c.replace(/tipo === 'formatura' \? '🎓'/g, "tipo === 'formatura' ? '\u2605'");
  c = c.replace(/tipo === 'homenagem' \? '⭐'/g, "tipo === 'homenagem' ? '\u2605'");
  c = c.replace(/: '💌'/g, ": '\u2022'");

  // Music link text
  c = c.replace(/🎵 Ouvir/g, 'Ouvir');
  
  // Abrir surpresa
  c = c.replace(/Abrir surpresa ✨/g, 'Abrir surpresa');

  // Badge/branding
  c = c.replace(/Criado com Eternizar ✨/g, 'eternizar');
  c = c.replace(/Eternizar ✨/g, 'Eternizar');

  // StoriesViewer decorative
  c = c.replace(/"✨"/g, '""');

  // Wand buttons — replace ✨ with clean dash
  c = c.replace(/✨ \{opt\.label\}/g, '{opt.label}');

  // Success page Online
  c = c.replace(/Online ✨/g, 'Online');
  c = c.replace(/Est.. Online/g, 'Online');

  // Check mark
  c = c.replace(/✓ Preview/g, 'Preview');
  c = c.replace(/✓ Aprovar/g, 'Aprovar');

  // Remaining ✨ anywhere
  c = c.replace(/✨/g, '');

  // Remaining standalone emojis
  c = c.replace(/❤️/g, '\u2665');
  c = c.replace(/🎓/g, '\u2605');
  c = c.replace(/⭐/g, '\u2605');
  c = c.replace(/🥂/g, '');
  c = c.replace(/💕/g, '');
  c = c.replace(/💌/g, '\u2022');
  c = c.replace(/💑/g, '');
  c = c.replace(/🌹/g, '\u2665');
  c = c.replace(/🎉/g, '\u25CF');
  c = c.replace(/💍/g, '\u25C6');
  c = c.replace(/🏠/g, '\u25CB');
  c = c.replace(/🐾/g, '\u2022');
  c = c.replace(/🌙/g, '\u25CF');
  c = c.replace(/🌊/g, '\u25CB');
  c = c.replace(/🎵/g, '\u266B');
  c = c.replace(/✈️/g, '\u2192');
  c = c.replace(/📍/g, '\u25CF');
  c = c.replace(/🍕/g, '\u2022');
  c = c.replace(/🎬/g, '\u2022');
  c = c.replace(/📚/g, '\u25A0');
  c = c.replace(/🍻/g, '\u25CF');
  c = c.replace(/🎮/g, '\u25CF');
  c = c.replace(/🔒/g, '');
  c = c.replace(/🌍/g, '');
  c = c.replace(/📅/g, '');
  c = c.replace(/💡/g, '');
  c = c.replace(/🖼️/g, '');
  c = c.replace(/🔐/g, '\u2022');
  c = c.replace(/🤔/g, '');
  c = c.replace(/💖/g, '');
  c = c.replace(/🎂/g, '');

  // Clean up double spaces left behind
  c = c.replace(/  +/g, ' ');
  // Clean up empty emoji strings ''
  c = c.replace(/''\s*\+\s*' '/g, "' '");

  if (c !== before) {
    fs.writeFileSync(f, c, 'utf8');
    totalFixed++;
    console.log('CLEANED:', path.relative('.', f));
  }
}

// ===== REMOVE DEMO PAGE =====
// First update references
for (const f of walk('src')) {
  let c = fs.readFileSync(f, 'utf8');
  const before = c;
  // Remove demo from sitemap
  c = c.replace(/\{ url: `\$\{baseUrl\}\/demo`[^}]*\},?\n?/g, '');
  // Remove demo from robots
  c = c.replace(/, '\/demo'/g, '');
  c = c.replace(/'\/demo',? ?/g, '');
  if (c !== before) {
    fs.writeFileSync(f, c, 'utf8');
    console.log('DEMO REF REMOVED:', path.relative('.', f));
  }
}

// Delete demo directory
const demoDir = 'src/app/demo';
if (fs.existsSync(demoDir)) {
  fs.rmSync(demoDir, { recursive: true });
  console.log('DELETED: src/app/demo/');
}

console.log('\nTotal files cleaned:', totalFixed);

// ===== VERIFY =====
console.log('\n=== VERIFY ===');
const emojiRe = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}]/gu;
let remaining = 0;
for (const f of walk('src')) {
  const c = fs.readFileSync(f, 'utf8');
  const m = c.match(emojiRe);
  if (m) {
    const unique = [...new Set(m)];
    // Filter out clean symbols we intentionally keep (♥★♫●○◆◇■)
    const bad = unique.filter(e => !'\u2665\u2605\u266B\u25CF\u25CB\u25C6\u25A0\u2022\u2192\u2736\u2740\u2600\u263A\u2302'.includes(e));
    if (bad.length) {
      console.log('REMAINING:', path.relative('.', f), bad.join(' '));
      remaining += bad.length;
    }
  }
}
console.log(remaining ? remaining + ' emoji remain' : 'ALL CLEAN');
