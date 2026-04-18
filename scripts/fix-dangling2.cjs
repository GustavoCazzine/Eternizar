const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Find exact text and show bytes
const idx = c.indexOf('{/* Player moved to counter section */}');
console.log('Found at:', idx);
const area = c.slice(idx, idx + 60);
console.log('EXACT:', JSON.stringify(area));

// Remove the )} after the comment
c = c.replace(/\{\/\* Player moved to counter section \*\/\}\s*\)\}/g, '{/* Player moved to counter section */}');

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('Fixed');

// Verify
const after = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');
const lines = after.split('\n');
const newIdx = after.indexOf('Player moved');
const lineNum = after.slice(0, newIdx).split('\n').length;
for (let i = lineNum - 2; i < lineNum + 4; i++) {
  console.log((i+1) + ': ' + lines[i]);
}
