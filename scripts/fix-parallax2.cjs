const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Find all remaining ParallaxLayer references
const matches = [];
let pos = 0;
while ((pos = c.indexOf('ParallaxLayer', pos)) !== -1) {
  const line = c.slice(c.lastIndexOf('\n', pos) + 1, c.indexOf('\n', pos)).trim();
  matches.push({ pos, line: line.slice(0, 100) });
  pos++;
}
console.log('ParallaxLayer occurrences:', matches.length);
matches.forEach(m => console.log('  ', m.line));

// Replace ALL remaining <ParallaxLayer ...> with <div ...>
c = c.replace(/<ParallaxLayer[^>]*>/g, (match) => {
  return match.replace('ParallaxLayer', 'div').replace(/speed=\{[^}]*\}\s*/g, '');
});
// Replace </ParallaxLayer> with </div> — but it was already done, check for </div> issues
// The problem: opening was ParallaxLayer, closing became </div> — mismatch at line 303

// Actually check if function ParallaxLayer is still needed
console.log('\nHas function ParallaxLayer:', c.includes('function ParallaxLayer'));

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('\nAll ParallaxLayer refs cleaned');

// Verify
const final = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');
console.log('Remaining ParallaxLayer:', (final.match(/ParallaxLayer/g) || []).length);
