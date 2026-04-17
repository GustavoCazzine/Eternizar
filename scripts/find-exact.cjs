const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Find exact bytes around the player div
const idx = c.indexOf('rounded-3xl overflow-hidden shadow-2xl max-w-sm');
if (idx === -1) { console.log('NOT FOUND'); process.exit(1); }

// Get the full line
const lineStart = c.lastIndexOf('\n', idx) + 1;
const lineEnd = c.indexOf('\n', idx);
const fullLine = c.slice(lineStart, lineEnd);
console.log('EXACT LINE:', JSON.stringify(fullLine));

// Try replacing with exact match using the escaped string
const target = "background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)'";
console.log('Has target:', c.includes(target));
