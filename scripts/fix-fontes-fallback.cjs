const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

const SAFE = "{ titulo: 'system-ui, -apple-system, sans-serif', corpo: 'system-ui, -apple-system, sans-serif' }";

// Replace the fontes derivation with bulletproof fallback
c = c.replace(
  "const fontes = paresFonte[pagina.fonte_par || 'classico'] || paresFonte.classico",
  `const fontes = paresFonte[pagina.fonte_par || 'classico'] || ${SAFE}`
);

console.log('Fallback applied:', c.includes("{ titulo: 'system-ui") ? 'OK' : 'FAIL');

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
