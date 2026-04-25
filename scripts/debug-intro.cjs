const fs = require('fs');
const c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes('introVisivel')) console.log((i+1) + ': ' + l.trim().slice(0, 100));
});
// Also find where IntroWrapped is rendered
lines.forEach((l, i) => {
  if (l.includes('IntroWrapped') && !l.includes('import')) console.log('RENDER ' + (i+1) + ': ' + l.trim().slice(0, 100));
});
// Find export default line
lines.forEach((l, i) => {
  if (l.includes('export default function')) console.log('EXPORT ' + (i+1) + ': ' + l.trim().slice(0, 80));
});
