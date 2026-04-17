const fs = require('fs');
const c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Get timeline section - 800 chars
const idx = c.indexOf('linha_do_tempo?.length > 0');
const section = c.slice(idx, idx + 1500);
console.log(section);
