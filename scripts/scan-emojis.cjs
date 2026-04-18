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

// Unicode emoji ranges
const emojiRe = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1FFFF}]/gu;
// Also common text emojis
const textEmojis = /[❤️🎓⭐✨🥂💕💌💑🎉🌹✈️💍🏠🐾🎵🌙🌊🎶💖🙌😊🎁👑🔥💎🌟⚡🦋🌺🏆🍕🎂🎊🎈🫶🤍🩷]/g;

console.log('=== EMOJI SCAN ===\n');

const files = walk('src');
for (const f of files) {
  const c = fs.readFileSync(f, 'utf8');
  const lines = c.split('\n');
  const hits = [];
  lines.forEach((l, i) => {
    const m1 = l.match(emojiRe);
    const m2 = l.match(textEmojis);
    const all = [...(m1 || []), ...(m2 || [])];
    if (all.length > 0) {
      hits.push({ line: i + 1, emojis: [...new Set(all)].join(''), text: l.trim().slice(0, 100) });
    }
  });
  if (hits.length > 0) {
    console.log(`\n${path.relative('.', f)} (${hits.length} lines):`);
    hits.forEach(h => console.log(`  L${h.line}: ${h.emojis} => ${h.text}`));
  }
}

// === CHECK UNUSED PAGES ===
console.log('\n\n=== UNUSED PAGES CHECK ===\n');
const pages = [
  'src/app/demo',
  'src/app/pagamento',
];
pages.forEach(p => {
  if (fs.existsSync(p)) {
    console.log(`EXISTS: ${p}`);
    // List files
    const items = fs.readdirSync(p, { recursive: true });
    items.forEach((i) => console.log(`  ${i}`));
  }
});

// Check if demo is referenced anywhere
let demoRefs = 0;
for (const f of files) {
  const c = fs.readFileSync(f, 'utf8');
  if (c.includes('/demo') && !f.includes('demo')) demoRefs++;
}
console.log(`\n/demo referenced in ${demoRefs} other files`);
