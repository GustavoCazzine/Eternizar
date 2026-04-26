const fs = require('fs');
const c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes('fontes.') || l.includes('fontes[')) {
    console.log((i+1) + ': ' + l.trim().slice(0, 110));
  }
});
// Also check paresFonte usage
lines.forEach((l, i) => {
  if (l.includes('paresFonte')) {
    console.log('PF ' + (i+1) + ': ' + l.trim().slice(0, 110));
  }
});
