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

// Detect and fix double-encoded UTF-8 sequences
function fixMojibake(str) {
  // Find sequences of high bytes that look like double-encoded UTF-8
  // Pattern: C3 XX or E2 XX XX or F0 9F XX XX encoded as latin1 chars
  let changed = false;
  const result = [];
  const bytes = Buffer.from(str, 'utf8');
  
  // Try chunk-by-chunk: find sequences of bytes > 0x7F that could be latin1-encoded UTF-8
  let i = 0;
  while (i < str.length) {
    const code = str.charCodeAt(i);
    
    // Check for multi-byte mojibake sequences (chars 0x80-0xFF)
    if (code >= 0xC0 && code <= 0xF7) {
      // Potential start of a mojibake sequence
      let seqLen = 0;
      if (code >= 0xF0) seqLen = 4;
      else if (code >= 0xE0) seqLen = 3;
      else if (code >= 0xC0) seqLen = 2;
      
      // Check if following chars are continuation bytes (0x80-0xBF)
      let valid = true;
      for (let j = 1; j < seqLen && i + j < str.length; j++) {
        const cc = str.charCodeAt(i + j);
        if (cc < 0x80 || cc > 0xBF) { valid = false; break; }
      }
      
      if (valid && i + seqLen <= str.length) {
        const seq = str.slice(i, i + seqLen);
        try {
          const decoded = Buffer.from(seq, 'latin1').toString('utf8');
          if (decoded && !decoded.includes('\uFFFD') && decoded !== seq) {
            result.push(decoded);
            changed = true;
            i += seqLen;
            continue;
          }
        } catch {}
      }
    }
    
    // Also catch Â followed by special char (common mojibake for non-breaking chars)
    if (code === 0xC2 && i + 1 < str.length) {
      const next = str.charCodeAt(i + 1);
      if (next >= 0x80 && next <= 0xBF) {
        try {
          const decoded = Buffer.from(str.slice(i, i + 2), 'latin1').toString('utf8');
          if (decoded && !decoded.includes('\uFFFD')) {
            result.push(decoded);
            changed = true;
            i += 2;
            continue;
          }
        } catch {}
      }
    }
    
    result.push(str[i]);
    i++;
  }
  
  return changed ? result.join('') : str;
}

let totalFixed = 0;
for (const f of walk('src')) {
  let content = fs.readFileSync(f, 'utf8');
  const before = content;
  
  // Remove BOM
  if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
  
  // Apply mojibake fix
  content = fixMojibake(content);
  
  // If still has issues, try again (sometimes double-double encoded)
  if (/[\xC0-\xF7][\x80-\xBF]/.test(content)) {
    content = fixMojibake(content);
  }
  
  if (content !== before) {
    fs.writeFileSync(f, content, 'utf8');
    totalFixed++;
    console.log('FIXED:', path.relative(process.cwd(), f));
  }
}

// Also fix root-level files
for (const rf of ['next.config.ts', 'DEPLOY.md']) {
  const fp = path.join(process.cwd(), rf);
  if (!fs.existsSync(fp)) continue;
  let c = fs.readFileSync(fp, 'utf8');
  const b = c;
  if (c.charCodeAt(0) === 0xFEFF) c = c.slice(1);
  c = fixMojibake(c);
  if (c !== b) {
    fs.writeFileSync(fp, c, 'utf8');
    totalFixed++;
    console.log('FIXED:', rf);
  }
}

console.log('\nTotal fixed:', totalFixed);
