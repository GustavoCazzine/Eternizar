const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Update the pink palette to wine
c = c.replace(
  "pink:    { primaria: '#B91C3C', secundaria: '#f43f5e'",
  "pink:    { primaria: '#9B1B30', secundaria: '#B91C3C'"
);

c = c.replace(
  "brilho: '#fda4af', fundo: '#1a0010', fundoAlt: '#2d0018', texto: '#fce7f3'",
  "brilho: '#e8a0b0', fundo: '#12000a', fundoAlt: '#1e0012', texto: '#f5e0e8'"
);

// rose palette too
c = c.replace(
  "rose:    { primaria: '#f43f5e', secundaria: '#B91C3C'",
  "rose:    { primaria: '#C2185B', secundaria: '#9B1B30'"
);

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('PaginaCliente palettes updated to wine');
