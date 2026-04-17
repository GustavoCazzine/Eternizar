const fs = require('fs');
const c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');
const idx = c.indexOf('className="relative flex flex-col ite');
console.log(c.slice(idx, idx + 500));
