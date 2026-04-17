const fs = require('fs');
const c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Find stories/momentos thumbnail rendering
const momIdx = c.indexOf('Nossos momentos');
if (momIdx !== -1) {
  console.log(c.slice(momIdx - 200, momIdx + 800).replace(/\n/g, '\n'));
}
