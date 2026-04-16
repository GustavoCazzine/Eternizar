const fs = require('fs');
const path = require('path');

// Mojibake patterns: UTF-8 bytes misread as Latin-1
const reps = new Map();
// Letters
reps.set('\u00C3\u00A9', '\u00E9'); // é
reps.set('\u00C3\u00A3', '\u00E3'); // ã
reps.set('\u00C3\u00A7', '\u00E7'); // ç
reps.set('\u00C3\u00B5', '\u00F5'); // õ
reps.set('\u00C3\u00B3', '\u00F3'); // ó
reps.set('\u00C3\u00A1', '\u00E1'); // á
reps.set('\u00C3\u00AD', '\u00ED'); // í
reps.set('\u00C3\u00BA', '\u00FA'); // ú
reps.set('\u00C3\u00A2', '\u00E2'); // â
reps.set('\u00C3\u00B4', '\u00F4'); // ô
reps.set('\u00C3\u0080', '\u00C0'); // À
reps.set('\u00C3\u0089', '\u00C9'); // É
reps.set('\u00C3', '\u00E0');       // à (standalone)
reps.set('\u00C2\u00B7', '\u00B7'); // ·

// Symbols via double-encoded UTF-8
// Read file as buffer, find sequences, replace
function fixFile(filepath) {
  const buf = fs.readFileSync(filepath);
  let str = buf.toString('utf8');
  let changed = false;

  for (const [from, to] of reps) {
    if (str.includes(from)) {
      str = str.split(from).join(to);
      changed = true;
    }
  }

  // Fix remaining mojibake by trying byte-level decode
  // Pattern: bytes that form valid UTF-8 when read as latin1
  const remaining = str.match(/[\u00C0-\u00DF][\u0080-\u00BF]|[\u00E0-\u00EF][\u0080-\u00BF]{2}|[\u00F0-\u00F7][\u0080-\u00BF]{3}/g);
  if (remaining) {
    for (const seq of new Set(remaining)) {
      try {
        const bytes = Buffer.from(seq, 'latin1');
        const decoded = bytes.toString('utf8');
        if (decoded && decoded !== seq && !decoded.includes('\uFFFD')) {
          str = str.split(seq).join(decoded);
          changed = true;
        }
      } catch {}
    }
  }

  if (changed) {
    // Strip BOM
    if (str.charCodeAt(0) === 0xFEFF) str = str.slice(1);
    fs.writeFileSync(filepath, str, 'utf8');
    return true;
  }
  return false;
}

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

const root = path.join(process.cwd(), 'src');
let fixed = 0;
for (const f of walk(root)) {
  if (fixFile(f)) {
    fixed++;
    console.log('FIXED:', path.relative(process.cwd(), f));
  }
}

// Also fix root files
for (const rf of ['next.config.ts', 'vercel.json', 'DEPLOY.md']) {
  const fp = path.join(process.cwd(), rf);
  if (fs.existsSync(fp) && fixFile(fp)) {
    fixed++;
    console.log('FIXED:', rf);
  }
}

console.log('\nTotal:', fixed, 'files');
