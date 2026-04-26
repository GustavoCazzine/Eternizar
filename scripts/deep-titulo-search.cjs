const fs = require('fs');
const c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');
const lines = c.split('\n');

// Find ALL .map() calls near .titulo
lines.forEach((l, i) => {
  if (l.includes('.map(') || l.includes('.map (')) {
    // Check next 10 lines for .titulo
    for (let j = i; j < Math.min(i + 15, lines.length); j++) {
      if (lines[j].includes('.titulo')) {
        console.log('MAP+TITULO at line', i+1, '→', j+1, ':', lines[j].trim().slice(0, 100));
      }
    }
  }
});

// Also find ALL .titulo accesses
console.log('\n--- ALL .titulo refs ---');
lines.forEach((l, i) => {
  if (l.includes('.titulo') && !l.includes('//')) {
    console.log((i+1) + ': ' + l.trim().slice(0, 120));
  }
});

// Check the fotos.map for any .titulo access
console.log('\n--- fotos arrays ---');
lines.forEach((l, i) => {
  if (l.includes('pagina.fotos') || l.includes('fotos.map') || l.includes('foto.titulo')) {
    console.log((i+1) + ': ' + l.trim().slice(0, 120));
  }
});

// Check linha_do_tempo
console.log('\n--- timeline ---');
lines.forEach((l, i) => {
  if (l.includes('linha_do_tempo') && l.includes('.titulo')) {
    console.log((i+1) + ': ' + l.trim().slice(0, 120));
  }
});
