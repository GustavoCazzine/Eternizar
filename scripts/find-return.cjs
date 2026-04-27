const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Find return with regex
const match = c.match(/\n\s*return\s*\(\s*\n\s*<div ref=\{containerRef\}/);
if (!match) { 
  // Try finding it by line
  const lines = c.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('return (') && lines[i+1]?.includes('containerRef')) {
      console.log('Found at line', i+1);
      console.log(JSON.stringify(lines[i]));
      console.log(JSON.stringify(lines[i+1]));
      break;
    }
  }
  // Also try
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('return (') && i > 600) {
      console.log('Return at line', i+1, ':', lines[i].trim().slice(0, 60));
    }
  }
}
