const fs = require('fs');
const c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');
console.log('Has ParallaxLayer def:', c.includes('function ParallaxLayer'));
console.log('Has ParallaxLayer usage:', (c.match(/ParallaxLayer/g) || []).length, 'occurrences');

// Find all usages
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes('ParallaxLayer')) console.log(`  Line ${i+1}: ${l.trim().slice(0, 100)}`);
});
