const fs = require('fs');
let c = fs.readFileSync('src/components/EternizarWrapped.tsx', 'utf8');

// Remove Aura function — line by line
const lines = c.split('\n');
let aStart = -1, aEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('function Aura(')) aStart = i;
  if (aStart !== -1 && aEnd === -1 && i > aStart + 2 && lines[i].trim() === '}') { aEnd = i; break; }
}
if (aStart !== -1 && aEnd !== -1) {
  lines.splice(aStart, aEnd - aStart + 1);
  console.log('Aura removed:', aStart+1, '-', aEnd+1);
}
c = lines.join('\n');

// Remove aura keyframes
c = c.replace(/\s*@keyframes aura-drift-1\{[^}]+\}/g, '');
c = c.replace(/\s*@keyframes aura-drift-2\{[^}]+\}/g, '');

console.log('Aura fn:', c.includes('function Aura') ? 'STILL' : 'GONE');
console.log('aura-drift:', c.includes('aura-drift') ? 'STILL' : 'GONE');

fs.writeFileSync('src/components/EternizarWrapped.tsx', c, 'utf8');
