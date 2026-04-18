const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Show context around line 952
const lines = c.split('\n');
for (let i = 946; i < 960 && i < lines.length; i++) {
  console.log((i+1) + ': ' + lines[i]);
}
