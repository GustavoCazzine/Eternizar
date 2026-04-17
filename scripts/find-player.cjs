const fs = require('fs');
const c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Find PlayerMusica's return statement exactly
const playerFunc = c.indexOf('function PlayerMusica');
const playerReturn = c.indexOf('return (', playerFunc);
const firstDiv = c.indexOf('<div', playerReturn);
const firstDivEnd = c.indexOf('>', firstDiv);
const line = c.slice(firstDiv, firstDivEnd + 1);
console.log('Player first div:', line.slice(0, 200));

// Also find where timeline events are rendered
const timelineIdx = c.indexOf('linha_do_tempo');
if (timelineIdx !== -1) {
  // Find usage in JSX
  const usages = [];
  let pos = 0;
  while ((pos = c.indexOf('linha_do_tempo', pos + 1)) !== -1) {
    const ctx = c.slice(Math.max(0, pos - 30), pos + 50);
    usages.push(pos + ': ' + ctx.replace(/\n/g, '\\n').slice(0, 80));
  }
  console.log('\nTimeline usages:');
  usages.forEach(u => console.log('  ' + u));
}

// Find graduation/formatura specific rendering
const formIdx = c.indexOf("tipo === 'formatura'");
if (formIdx !== -1) {
  console.log('\nFormatura section found at:', formIdx);
  console.log(c.slice(formIdx, formIdx + 200).replace(/\n/g, '\\n'));
}
