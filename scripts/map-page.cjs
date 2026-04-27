const fs = require('fs');
const c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');
const lines = c.split('\n');

console.log('Total lines:', lines.length);
console.log('Size:', Math.round(c.length / 1024) + 'KB');
console.log('\n=== SECTIONS ===');
lines.forEach((l, i) => {
  if (l.includes('{/*') && (l.includes('===') || l.includes('Seção') || l.includes('SLIDE') || l.includes('Barra') || l.includes('Capa') || l.includes('Contador') || l.includes('Timeline') || l.includes('Guestbook') || l.includes('Player') || l.includes('Stories') || l.includes('Carta') || l.includes('Bucket') || l.includes('Mapa') || l.includes('Footer'))) {
    console.log((i+1) + ': ' + l.trim().slice(0, 90));
  }
});

console.log('\n=== COMPONENTS USED ===');
lines.forEach((l, i) => {
  if (l.includes('import ') && l.includes('from')) {
    console.log((i+1) + ': ' + l.trim().slice(0, 100));
  }
});

console.log('\n=== DATA ACCESSED ===');
const dataRefs = new Set();
lines.forEach(l => {
  const matches = l.match(/pagina\.\w+/g);
  if (matches) matches.forEach(m => dataRefs.add(m));
});
console.log([...dataRefs].sort().join('\n'));
