const fs = require('fs');
let c = fs.readFileSync('src/components/EternizarWrapped.tsx', 'utf8');
const lines = c.split('\n');

// Find and remove the broken useEffect blocks (lines ~65-91)
// Remove from "useEffect(() => {" (empty one) through "function iniciar"
let blockStart = -1, blockEnd = -1;
for (let i = 60; i < 100; i++) {
  if (lines[i]?.trim() === 'useEffect(() => {' && lines[i+1]?.trim() === '') {
    blockStart = i;
  }
  if (blockStart !== -1 && lines[i]?.trim().startsWith('function iniciar')) {
    blockEnd = i;
    break;
  }
}

if (blockStart !== -1 && blockEnd !== -1) {
  lines.splice(blockStart, blockEnd - blockStart);
  console.log('Removed broken block lines', blockStart+1, '-', blockEnd);
}

c = lines.join('\n');

// Remove any remaining previewUrl
c = c.replace(/previewUrl\s*,?\s*/g, '');

// Re-check braces
let o = 0, cl = 0;
for (const ch of c) { if (ch === '{') o++; if (ch === '}') cl++; }
console.log('Braces: {', o, '}', cl, o === cl ? 'BALANCED' : 'OFF by ' + (o-cl));

fs.writeFileSync('src/components/EternizarWrapped.tsx', c, 'utf8');
