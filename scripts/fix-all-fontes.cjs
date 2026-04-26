const fs = require('fs');
const FONT = "'system-ui, -apple-system, sans-serif'";

const files = [
  'src/components/CuriosidadesMagicas.tsx',
  'src/components/IntroWrapped.tsx',
  'src/components/MapaAmor.tsx',
  'src/components/PreviaPagina.tsx',
];

files.forEach(f => {
  try {
    let c = fs.readFileSync(f, 'utf8');
    const before = (c.match(/fontes\.titulo|fontes\.corpo/g) || []).length;
    if (before === 0) { console.log(f + ': CLEAN'); return; }
    
    c = c.replace(/fontes\.titulo/g, FONT);
    c = c.replace(/fontes\.corpo/g, FONT);
    
    fs.writeFileSync(f, c, 'utf8');
    console.log(f + ': ' + before + ' refs → FIXED');
  } catch (e) {
    console.log(f + ': ERROR ' + e.message);
  }
});

// Also check PaginaCliente for any remaining fontes prop passing
const pc = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');
const fontesProps = (pc.match(/fontes=\{fontes\}/g) || []).length;
console.log('\nPaginaCliente fontes={fontes} props:', fontesProps);
