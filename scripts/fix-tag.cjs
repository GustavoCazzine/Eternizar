const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Fix: my regex changed <motion.div to <div but left </motion.div> as closing tag
// Find the broken pattern and fix it
c = c.replace(
  /<div className=\{tocando \? "animate-pulse" : ""\}([\s\S]*?)<\/motion\.div>/g,
  '<div className={tocando ? "animate-pulse" : ""}$1</div>'
);

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('Fixed closing tag');

// Verify no more mismatched tags
const opens = (c.match(/<motion\./g) || []).length;
const closes = (c.match(/<\/motion\./g) || []).length;
console.log('motion opens:', opens, 'closes:', closes, opens === closes ? 'MATCH' : 'MISMATCH!');
