const fs = require('fs');
const c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Find exact ContadorTempo boundaries
const funcStart = c.indexOf('function ContadorTempo');
console.log('Starts at char:', funcStart);
console.log('Line:', c.slice(0, funcStart).split('\n').length);

// Count braces to find end
let braceStart = c.indexOf('{', funcStart);
let depth = 1;
let i = braceStart + 1;
while (i < c.length && depth > 0) {
  if (c[i] === '{') depth++;
  else if (c[i] === '}') depth--;
  i++;
}
console.log('Ends at char:', i);
console.log('Length:', i - funcStart, 'chars');

// Show first and last 3 lines
const funcBody = c.slice(funcStart, i);
const lines = funcBody.split('\n');
console.log('\nFirst 3 lines:');
lines.slice(0, 3).forEach(l => console.log('  ' + l));
console.log('\nLast 3 lines:');
lines.slice(-3).forEach(l => console.log('  ' + l));
console.log('\nTotal lines:', lines.length);

// What comes right after?
console.log('\nAfter ContadorTempo:');
console.log(c.slice(i, i + 100));
