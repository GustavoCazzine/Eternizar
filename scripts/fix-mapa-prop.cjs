const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Add fontes prop to MapaAmor
c = c.replace(
  '<MapaAmor locais={pagina.locais} cor={cor} />',
  '<MapaAmor locais={pagina.locais} cor={cor} fontes={fontes} />'
);

// Also add L type reference for TypeScript
// The component uses L.Map and L.Marker but imports dynamically
// No change needed since MapaAmor handles its own types

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('MapaAmor fontes prop: OK');
