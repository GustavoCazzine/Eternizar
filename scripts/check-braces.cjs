const fs = require('fs');
const c = fs.readFileSync('src/components/EternizarWrapped.tsx', 'utf8');
// Count braces
let opens = 0, closes = 0;
for (const ch of c) {
  if (ch === '{') opens++;
  if (ch === '}') closes++;
}
console.log('Braces: {', opens, '} :', closes, opens === closes ? 'BALANCED' : 'IMBALANCED by ' + (opens - closes));

// Check for previewUrl references
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes('previewUrl')) console.log((i+1) + ': ' + l.trim().slice(0, 80));
});
