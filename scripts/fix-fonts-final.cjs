const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');
const lines = c.split('\n');

// Find and remove orphan font lines: any line containing var(--font- that's inside paresFonte
let inPares = false;
let paresEnd = -1;
const toRemove = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const paresFonte:')) inPares = true;
  if (inPares && lines[i].trim() === '},') {
    // This closes the new block, mark end
    paresEnd = i;
    // Fix: change }, to }
    lines[i] = lines[i].replace('},', '}');
    console.log('Fixed closing at line', i+1);
  }
  if (paresEnd !== -1 && i > paresEnd) {
    if (lines[i].includes("var(--font-") || (lines[i].trim() === '}' && !inPares)) {
      toRemove.push(i);
    }
    if (lines[i].trim() === '' || lines[i].includes('function') || lines[i].includes('const ')) {
      break; // stop looking
    }
  }
}

// Remove orphan lines (reverse order)
toRemove.reverse().forEach(i => {
  console.log('Removing line', i+1, ':', lines[i].trim().slice(0, 60));
  lines.splice(i, 1);
});

c = lines.join('\n');
fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('Done');
