const fs = require('fs');

let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');
const before = c.length;

// Remove ALL infinite Framer Motion animations (they kill mobile GPU)
// Pattern: animate={{ ... }} + transition={{ ... repeat: Infinity ... }}
// Replace motion.div with infinite anims to static div

// 1. Remove floating particle animations (y: [-20, 20, -20] patterns)
c = c.replace(
  /animate=\{\{\s*y:\s*\[-?\d+,\s*-?\d+,\s*-?\d+\],\s*opacity:\s*\[[^\]]+\]\s*\}\}/g,
  ''
);

// 2. Remove scale pulse infinite animations
c = c.replace(
  /animate=\{\{\s*scale:\s*\[1,\s*[\d.]+,\s*1\],?\s*(?:opacity:\s*\[[^\]]+\])?\s*\}\}/g,
  ''
);
c = c.replace(
  /animate=\{\{\s*scale:\s*\[1,\s*[\d.]+,\s*1\]\s*\}\}/g,
  ''
);

// 3. Remove opacity pulse infinite
c = c.replace(
  /animate=\{\{\s*opacity:\s*\[[^\]]+\],\s*scale:\s*\[[^\]]+\]\s*\}\}/g,
  ''
);

// 4. Remove bounce y infinite
c = c.replace(
  /animate=\{\{\s*y:\s*\[0,\s*-?\d+,\s*0\]\s*\}\}/g,
  ''
);

// 5. Remove all transition with repeat: Infinity
c = c.replace(
  /transition=\{\{[^}]*repeat:\s*Infinity[^}]*\}\}/g,
  ''
);

// 6. Replace tocando-dependent scale animation with CSS class
c = c.replace(
  /animate=\{\{\s*scale:\s*tocando\s*\?\s*\[[^\]]+\]\s*:\s*\d+\s*\}\}/g,
  'className={tocando ? "animate-pulse" : ""}'
);
c = c.replace(
  /animate=\{\{\s*scale:\s*tocando\s*\?\s*[\d.]+\s*:\s*\d+\s*\}\}/g,
  ''
);

// 7. Clean up empty motion.div props (motion.div with no animate/transition)
// Leave initial + whileInView (entrance anims are fine)

// 8. Remove remaining mojibake if any
c = c.replace(/\u00F0[\u0100-\u024F][\s\S]{0,2}/g, '');
c = c.replace(/ðŸ[\s\S]{0,4}/g, '');

const after = c.length;
fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('PaginaCliente: ' + before + ' -> ' + after + ' bytes');
console.log('Removed', before - after, 'bytes of animations');

// Verify infinite animations remaining
const remaining = [...c.matchAll(/repeat:\s*Infinity/g)];
console.log('Infinite anims remaining:', remaining.length);
