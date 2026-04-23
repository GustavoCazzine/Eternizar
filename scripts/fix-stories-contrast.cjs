const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// ===== 1. FIX CONTRAST — "surpresa" text =====
c = c.replace(
  /className="text-xs uppercase tracking-\[0\.25em\] mb-6 font-medium" style=\{\{ color: cor \}\}>\s*Uma surpresa/,
  'className="text-xs uppercase tracking-[0.25em] mb-6 font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>\n                Uma surpresa'
);
console.log('1. Surpresa contrast:', c.includes('rgba(255,255,255,0.6)') ? 'OK' : 'FAIL');

// ===== 2. FIX SUBTITLE — merge duplicate style =====
c = c.replace(
  /className="text-lg md:text-xl mt-6 nome-capitalize" style=\{\{ color: "rgba\(255,255,255,0\.7\)" \}\}\s*style=\{\{ textShadow:/,
  'className="text-lg md:text-xl mt-6 nome-capitalize"\n                style={{ color: "rgba(255,255,255,0.65)", textShadow:'
);
console.log('2. Subtitle merge:', !c.includes('0.7)" }}\n                style={{ text') ? 'OK' : 'FAIL');

// ===== 3. STORIES — horizontal scroll, no wrap =====
c = c.replace(
  'className="flex gap-4 justify-center flex-wrap max-w-2xl mx-auto"',
  'className="flex gap-5 overflow-x-auto scrollbar-hide px-6 pb-4 -mx-4 snap-x snap-mandatory"'
);
console.log('3. Stories horizontal scroll: OK');

// Make story items snap
c = c.replace(
  'className="relative flex flex-col items-center gap-2 group"',
  'className="relative flex flex-col items-center gap-2 group snap-center shrink-0"'
);
console.log('3b. Story snap: OK');

// Reduce stories section padding
c = c.replace(
  /\{\/\* ===== STORIES.*?===== \*\/\}\s*\{fotosNormalizadas\.length > 0 && \(\s*<section className="py-24 px-4">/,
  '{/* ===== STORIES ===== */}\n        {fotosNormalizadas.length > 0 && (\n          <section className="py-14 sm:py-20 px-4">'
);
console.log('3c. Stories padding: reduced');

// ===== 4. STORIES — "Memórias que ficam" also white =====
c = c.replace(
  /Mem..rias que ficam<\/p>/,
  'Memórias que ficam</p>'
);
// The "Memórias que ficam" subtitle uses cor — change to white
const memorias = c.indexOf('Memórias que ficam');
if (memorias !== -1) {
  const lineStart = c.lastIndexOf('\n', memorias);
  const line = c.slice(lineStart, c.indexOf('\n', memorias));
  if (line.includes('color: cor')) {
    c = c.replace(
      /style=\{\{ color: cor \}\}>Memórias que ficam/,
      'style={{ color: "rgba(255,255,255,0.5)" }}>Memórias que ficam'
    );
    console.log('4. "Memórias que ficam" contrast: OK');
  }
}

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('\nAll fixes applied.');
