const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

const FONT = "'system-ui, -apple-system, sans-serif'";

// Nuclear: replace ALL fontes.titulo and fontes.corpo with hardcoded string
c = c.replace(/fontes\.titulo/g, FONT);
c = c.replace(/fontes\.corpo/g, FONT);
c = c.replace(/fontCorpo=\{fontes\.corpo\}/g, `fontCorpo={${FONT}}`);

// Also replace the fontes derivation line
c = c.replace(
  /const fontes = paresFonte\[.*?\].*$/m,
  `const fontes = { titulo: ${FONT}, corpo: ${FONT} }`
);

// Fix the fontFamily references that now look like style={{ fontFamily: 'system-ui...' }}
// which is correct syntax

console.log('fontes.titulo refs remaining:', (c.match(/fontes\.titulo/g) || []).length);
console.log('fontes.corpo refs remaining:', (c.match(/fontes\.corpo/g) || []).length);

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('Nuclear font fix applied');
