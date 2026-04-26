const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// The gradient overlay div is self-closing (/>), but there's an orphaned </div> after it
// This </div> was from the removed glow orbs wrapper
c = c.replace(
  /\}\} \/>\s*<\/div>\s*\{\/\* Legenda curta/,
  '}} />\n {/* Legenda curta'
);

// Also check for orphaned </div> after the hero gradient
c = c.replace(
  /: '#000'\s*\}\} \/>\s*<\/div>\s*\{\/\* Conteúdo principal/,
  ": '#000'\n }} />\n\n {/* Conteúdo principal"
);

// Also remove the orphaned particles block that's still there
c = c.replace(/\s*\{\/\* Part..culas decorativas globais \*\/\}[\s\S]*?<\/div>\s*\{\/\* ===== SLIDE 1/,
  '\n {/* ===== SLIDE 1');

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('Fixed orphaned </div>');
