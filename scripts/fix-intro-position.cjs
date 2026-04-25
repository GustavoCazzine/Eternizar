const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Remove the misplaced IntroWrapped at the top (lines 3-12 area, before any function)
// It's between imports and interfaces
const introBlock = c.match(/\{\/\* Cortina de abertura \*\/\}\s*\{introVisivel && pagina\.tipo === 'casal' && \(\s*<IntroWrapped[\s\S]*?\/>\s*\)\}/);
if (introBlock) {
  // Check if it's before export default (module level = wrong)
  const introPos = c.indexOf(introBlock[0]);
  const exportPos = c.indexOf('export default function PaginaCliente');
  if (introPos < exportPos) {
    c = c.replace(introBlock[0], '');
    console.log('1. Removed misplaced IntroWrapped from module level');
  }
}

// Now add it INSIDE the return, right after return (
const mainReturn = c.indexOf("return (\n", c.indexOf('export default function PaginaCliente'));
if (mainReturn !== -1 && !c.includes('<IntroWrapped')) {
  const afterReturnParen = c.indexOf('\n', mainReturn);
  c = c.slice(0, afterReturnParen) + `
      <>
      {/* Cortina de abertura */}
      {introVisivel && pagina.tipo === 'casal' && (
        <IntroWrapped
          fotoCapa={fotoCapa}
          titulo={pagina.titulo}
          cor={cor}
          fontes={fontes}
          onEntrar={() => setIntroVisivel(false)}
        />
      )}` + c.slice(afterReturnParen);
  
  // Need to close the fragment — find the very last </div> before the final )
  // The component ends with </div>\n )\n}
  const lastReturn = c.lastIndexOf('\n )');
  c = c.slice(0, lastReturn) + '\n      </>' + c.slice(lastReturn);
  
  console.log('2. IntroWrapped added inside return with Fragment');
} else if (c.includes('<IntroWrapped')) {
  console.log('2. IntroWrapped already in return');
}

// Verify positions
const finalC = c;
const introPos = finalC.indexOf('IntroWrapped');
const exportPos = finalC.indexOf('export default function');
const importLine = finalC.indexOf("import IntroWrapped");
console.log('Import at char:', importLine);
console.log('Export at char:', exportPos);

// Find render usage
const lines = finalC.split('\n');
lines.forEach((l, i) => {
  if (l.includes('IntroWrapped') && !l.includes('import') && !l.includes('dynamic')) {
    console.log('Render at line', i+1, ':', l.trim().slice(0, 80));
  }
});

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
