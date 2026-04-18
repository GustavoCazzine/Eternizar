const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Remove the dangling )}
c = c.replace(
  "        {/* Player moved to counter section */}\n        )}\n",
  "        {/* Player moved to counter section */}\n"
);

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('Fixed dangling )}');
