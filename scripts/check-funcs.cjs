const fs = require('fs');
const c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

const funcs = ['ContadorTempo', 'ParallaxLayer', 'PlayerMusica', 'SlideMemoria', 'CartaSelada', 'PaginaCliente', 'Secao', 'EmojiAnimado'];
funcs.forEach(f => {
  const has = c.includes(`function ${f}`);
  const used = (c.match(new RegExp(`<${f}[\\s/>]`, 'g')) || []).length;
  console.log(`${has ? 'DEF' : 'MISSING'} | used:${used} | ${f}`);
});
