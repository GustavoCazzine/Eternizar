const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');
const lines = c.split('\n');
const out = [];
for (let i = 680; i < 700; i++) {
  out.push((i+1) + ': ' + JSON.stringify(lines[i]?.slice(0, 80)));
}
fs.writeFileSync('scripts/debug-out.txt', out.join('\n'), 'utf8');
console.log('wrote debug-out.txt');
