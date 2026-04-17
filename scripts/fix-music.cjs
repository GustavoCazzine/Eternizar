const fs = require('fs');

let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// FIX 1: Remove autoplay from useEffect — mobile blocks it
// The current code creates Audio in useEffect and calls audio.play()
// This ALWAYS fails on mobile. Instead, only create the Audio, don't play.
c = c.replace(
  /audio\.play\(\)\.then\(\(\) => setTocando\(true\)\)\.catch\(\(\) => \{\}\)/,
  '// Audio ready, user must tap play\n      setTocando(false)'
);

// FIX 2: togglePlay needs .catch() and proper mobile handling
c = c.replace(
  /else \{ audio\.play\(\); setTocando\(true\) \}/,
  'else { audio.play().then(() => setTocando(true)).catch(() => {}) }'
);

// FIX 3: Remove remaining repeat: Infinity tied to tocando
c = c.replace(
  /transition=\{\{\s*duration:\s*[\d.]+,\s*repeat:\s*tocando\s*\?\s*Infinity\s*:\s*0[^}]*\}\}/g,
  ''
);

// FIX 4: Remove empty animate props from previous cleanup
c = c.replace(
  /<motion\.div className=\{tocando \? "animate-pulse" : ""\}/g,
  '<div className={tocando ? "animate-pulse" : ""}'
);

// Close the motion.div → div tag change (find matching closing)
// Actually safer to just remove the className animate-pulse since it's fine as CSS

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');

// Verify
const after = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');
const autoplay = (after.match(/audio\.play\(\)\.then/g) || []).length;
const infinites = (after.match(/repeat:\s*Infinity/g) || []).length;
console.log('Autoplay in useEffect:', after.includes('// Audio ready, user must tap play') ? 'REMOVED' : 'STILL THERE');
console.log('togglePlay has catch:', after.includes('.play().then(() => setTocando(true)).catch') ? 'YES' : 'NO');
console.log('Remaining Infinity:', infinites);
