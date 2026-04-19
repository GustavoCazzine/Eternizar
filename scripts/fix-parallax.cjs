const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Fix: </ParallaxLayer> still in code — replace with </div>
c = c.replace('</ParallaxLayer>', '</div>');

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('Fixed: ParallaxLayer -> div');
console.log('Has ParallaxLayer:', c.includes('ParallaxLayer') ? 'STILL' : 'CLEAN');
