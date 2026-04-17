const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');
c = c.replace(
  'fontCorpo={fontCorpo}',
  'fontCorpo={fontes.corpo}'
);
fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('Fixed: fontCorpo -> fontes.corpo');
