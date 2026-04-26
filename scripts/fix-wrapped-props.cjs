const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// 1. Remove fontes prop from EternizarWrapped render
c = c.replace(/\s*fontes=\{fontes\}\s*/g, (match) => {
  // Only remove from EternizarWrapped, not from other components
  return '\n            ';
});
// More targeted
c = c.replace(
  /(<EternizarWrapped[\s\S]*?)fontes=\{fontes\}\s*/,
  '$1'
);
console.log('1. fontes prop removed from Wrapped');

// 2. Remove fotoCapa prop if still there
c = c.replace(
  /(<EternizarWrapped[\s\S]*?)fotoCapa=\{fotoCapa\}\s*/,
  '$1'
);
console.log('2. fotoCapa prop cleaned');

// 3. Fix any double newlines in the Wrapped props
c = c.replace(/<EternizarWrapped\s+/g, '<EternizarWrapped\n            ');

// 4. Also update PaginaCliente palette fonts to use sans-serif system
// Replace paresFonte references in PaginaCliente
c = c.replace(
  /const paresFonte: Record<string, \{ titulo: string; corpo: string \}> = \{[\s\S]*?\}/,
  `const paresFonte: Record<string, { titulo: string; corpo: string }> = {
  classico:  { titulo: 'system-ui, -apple-system, sans-serif', corpo: 'system-ui, -apple-system, sans-serif' },
  moderno:   { titulo: 'system-ui, -apple-system, sans-serif', corpo: 'system-ui, -apple-system, sans-serif' },
  romantico: { titulo: 'system-ui, -apple-system, sans-serif', corpo: 'system-ui, -apple-system, sans-serif' },
  divertido: { titulo: 'system-ui, -apple-system, sans-serif', corpo: 'system-ui, -apple-system, sans-serif' },
}`
);
console.log('3. All fonts → sans-serif system');

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('Done');
