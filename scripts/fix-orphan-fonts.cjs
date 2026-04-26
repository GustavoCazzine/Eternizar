const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Remove orphaned font lines
c = c.replace(
  " moderno: { titulo: 'var(--font-space)', corpo: 'var(--font-inter)' },\n romantico: { titulo: 'var(--font-playfair)', corpo: 'var(--font-outfit)' },\n divertido: { titulo: 'var(--font-caveat)', corpo: 'var(--font-inter)' },\n}\n",
  ''
);

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('Orphan lines removed');
