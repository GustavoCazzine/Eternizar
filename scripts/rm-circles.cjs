const fs = require('fs');
let c = fs.readFileSync('src/components/EternizarWrapped.tsx', 'utf8');

// Remove circles with tolerant regex
c = c.replace(/<circle cx="330"[\s\S]*?\/>/g, '');
c = c.replace(/<circle cx="70"[\s\S]*?\/>/g, '');

console.log('Circles cx=330:', c.includes('cx="330"') ? 'STILL' : 'REMOVED');
console.log('Circles cx=70:', c.includes('cx="70"') ? 'STILL' : 'REMOVED');

fs.writeFileSync('src/components/EternizarWrapped.tsx', c, 'utf8');
