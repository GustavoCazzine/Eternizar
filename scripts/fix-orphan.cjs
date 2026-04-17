const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Remove the orphan 'u line
c = c.replace("'use client'\n\n'u\n", "'use client'\n\n");
// Also try other variants
c = c.replace("'u\n// Linha", "// Linha");

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('First 80 chars:', JSON.stringify(c.slice(0, 80)));
