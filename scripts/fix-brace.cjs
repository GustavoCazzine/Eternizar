const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');
const lines = c.split('\n');

// Find the double } after paresFonte
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === '}' && lines[i+1]?.trim() === '}' && lines[i-1]?.includes('divertido')) {
    lines.splice(i+1, 1); // remove the second }
    console.log('Removed extra } at line', i+2);
    break;
  }
}

c = lines.join('\n');
fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
