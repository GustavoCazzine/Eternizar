const fs = require('fs');
const path = require('path');

const replacements = [
  ['Ã©', 'é'], ['Ã£', 'ã'], ['Ã§', 'ç'], ['Ãµ', 'õ'], ['Ã³', 'ó'],
  ['Ã¡', 'á'], ['Ã­', 'í'], ['Ãº', 'ú'], ['Ã¢', 'â'], ['Ã´', 'ô'],
  ['Ã¼', 'ü'], ['Ã±', 'ñ'], ['Ã‰', 'É'], ['Ã€', 'À'], ['Ãˆ', 'È'],
  ['Ãœ', 'Ü'], ['Ã', 'à'],
  ['Ã\u0083Â©', 'é'], ['Ã\u0083Â£', 'ã'], ['Ã\u0083Â§', 'ç'],
  ['â\u0080\u0093', '–'], ['â\u0080\u0094', '—'], ['â\u0080¢', '•'],
  ['â\u0080\u009C', '"'], ['â\u0080\u009D', '"'],
  ['â\u0080\u0098', '\u2018'], ['â\u0080\u0099', '\u2019'],
  ['â\u009C¨', '✨'], ['âœ¨', '✨'],
  ['â­', '⭐'], ['â¤ï¸\u008F', '❤️'], ['â¤', '❤'],
  ['â\u0096¶', '▶'], ['â\u0096¶', '▶'],
  ['â\u0099ª', '♪'], ['â\u0099«', '♫'], ['â\u0099¬', '♬'],
  ['â\u0086\u0092', '→'],
  ['Â·', '·'], ['Â»', '»'], ['Â«', '«'],
  ['ðŸ\u0091\u0091', '💑'], ['ðŸ\u0092\u0096', '💖'],
  ['ðŸ\u008E¶', '🎶'], ['ðŸ\u008E"', '🎓'], ['ðŸ\u008Eµ', '🎵'],
  ['ðŸ\u0099Œ', '🙌'], ['ðŸ¥‚', '🥂'],
  ['ðŸ\u008E‰', '🎉'], ['ðŸ\u0092\u0095', '💕'],
];

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

// Also try raw byte-level fix: read as latin1, check if valid utf8
function fixDoubleEncoding(buf) {
  // Try decoding as latin1 to get original UTF-8 bytes
  const latin1 = buf.toString('latin1');
  try {
    const fixed = Buffer.from(latin1, 'latin1').toString('utf8');
    // Check if this produces valid text with Portuguese chars
    if (/[áéíóúãõçâêô]/.test(fixed) && !/Ã[©£§µ³¡­ºâ´]/.test(fixed)) {
      return fixed;
    }
  } catch {}
  return null;
}

const root = path.join(process.cwd(), 'src');
const files = walk(root);
let fixed = 0;

for (const f of files) {
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;

  // Simple replacements first
  for (const [from, to] of replacements) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      changed = true;
    }
  }

  // Catch remaining Ã patterns (double-encoded UTF-8)
  if (/Ã[^\s]/.test(content)) {
    // Try to fix remaining via byte-level approach
    const buf = Buffer.from(content, 'utf8');
    const attempt = fixDoubleEncoding(buf);
    if (attempt && attempt !== content) {
      content = attempt;
      changed = true;
    }
  }

  if (changed) {
    // Remove BOM if present
    if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
    fs.writeFileSync(f, content, 'utf8');
    fixed++;
    console.log('FIXED:', path.relative(process.cwd(), f));
  }
}
console.log(`\nTotal: ${fixed} files fixed`);
