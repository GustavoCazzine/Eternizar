const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Check first 10 chars
console.log('First 20 chars:', JSON.stringify(c.slice(0, 20)));

// Fix: ensure starts with 'use client'
if (!c.startsWith("'use client'")) {
  // Find where 'use client' should be
  const useClientIdx = c.indexOf("use client");
  if (useClientIdx !== -1) {
    // Remove everything before it and fix
    c = "'use client'\n" + c.slice(c.indexOf('\n', useClientIdx) + 1);
    console.log('Fixed: restored use client header');
  } else {
    c = "'use client'\n\n" + c;
    console.log('Fixed: prepended use client');
  }
}

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('First 30 chars now:', JSON.stringify(c.slice(0, 30)));
