const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Remove ALL duplicate import lines — keep only unique
const lines = c.split('\n');
const seen = new Set();
const cleaned = [];
for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed.startsWith('import ') && trimmed.includes(' from ')) {
    if (seen.has(trimmed)) continue; // skip duplicate
    seen.add(trimmed);
  }
  cleaned.push(line);
}
c = cleaned.join('\n');

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');

// Verify
const final = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');
const importLines = final.split('\n').filter(l => l.trim().startsWith('import '));
console.log('Unique imports:', importLines.length);
importLines.forEach(l => console.log('  ' + l.trim().slice(0, 80)));
