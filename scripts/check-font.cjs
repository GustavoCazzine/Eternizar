const fs = require('fs');
const c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');
// Find how fonts are referenced in the main component
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (/font.*corpo|fontCorpo|fontes|paresFonte/i.test(l)) console.log((i+1) + ': ' + l.trim().slice(0, 120));
});
// Also find where CartaSelada is used
lines.forEach((l, i) => {
  if (l.includes('CartaSelada')) console.log('USAGE ' + (i+1) + ': ' + l.trim().slice(0, 120));
});
