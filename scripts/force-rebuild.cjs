const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');
// Remove any broken timestamp
c = c.replace(/\/\* v\d* \*\/\n?/g, '');
c = c.replace(/\/\/ Build: \d+\n?/g, '');
// Fix: 'use client' must be first token
if (!c.startsWith("'use client'")) {
  c = c.replace(/^\s*/, '');
  if (!c.startsWith("'use client'")) {
    c = "'use client'\n" + c;
  }
}
// Add version after 'use client' line  
c = c.replace("'use client'\n", "'use client'\n/* v" + Date.now() + " */\n");
fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('First 3 lines:');
c.split('\n').slice(0,3).forEach((l,i) => console.log(i+1 + ': ' + l));
