const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Find the LAST return ( before <div ref={containerRef} — this is the main render
const containerDiv = c.indexOf('<div ref={containerRef}');
const returnBefore = c.lastIndexOf('return (', containerDiv);
const afterReturn = c.indexOf('\n', returnBefore);

// Insert fragment + IntroWrapped
const introJSX = `
      <>
      {introVisivel && pagina.tipo === 'casal' && (
        <IntroWrapped fotoCapa={fotoCapa} titulo={pagina.titulo} cor={cor} fontes={fontes}
          onEntrar={() => setIntroVisivel(false)} />
      )}`;

c = c.slice(0, afterReturn) + introJSX + c.slice(afterReturn);

// Close the fragment before the last ) of the component
// Find the final closing: \n )\n}
const lastCloseParen = c.lastIndexOf('\n )');
c = c.slice(0, lastCloseParen) + '\n      </>' + c.slice(lastCloseParen);

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');

// Verify
const final = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');
const lines = final.split('\n');
lines.forEach((l, i) => {
  if (l.includes('IntroWrapped') && !l.includes('import') && !l.includes('dynamic'))
    console.log('RENDER L' + (i+1) + ': ' + l.trim().slice(0, 90));
});
console.log('Has </>:', final.includes('</>'));
const exportLine = final.split('\n').findIndex(l => l.includes('export default'));
const introLine = final.split('\n').findIndex(l => l.includes('<IntroWrapped'));
console.log('Export at line:', exportLine + 1, 'Intro at line:', introLine + 1, '(intro must be > export)');
