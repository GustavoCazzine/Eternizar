const fs = require('fs');
let c = fs.readFileSync('src/components/EternizarWrapped.tsx', 'utf8');
const lines = c.split('\n');
const cleaned = lines.filter(l => {
  const t = l.trim();
  if (t.includes('dropRef') && !t.includes('//')) return false;
  if (t.includes('isMusicVisible') && !t.includes('//')) return false;
  if (t.includes('musicSectionRef') && !t.includes('ref=') && !t.includes('//')) return false;
  if (t.includes('[Wrapped Audio]')) return false;
  if (t === "previewUrl?: string | null") return false;
  return true;
});
c = cleaned.join('\n');

// Remove previewUrl from destructuring
c = c.replace(/,\s*previewUrl\s*,/g, ',');
c = c.replace(/previewUrl\s*,\s*/g, '');

console.log('dropRef:', c.includes('dropRef') ? 'STILL' : 'GONE');
console.log('isMusicVisible:', c.includes('isMusicVisible') ? 'STILL' : 'GONE');
console.log('previewUrl:', c.includes('previewUrl') ? 'STILL' : 'GONE');

fs.writeFileSync('src/components/EternizarWrapped.tsx', c, 'utf8');
