const fs = require('fs');
const c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Timeline continued
const idx = c.indexOf("className=\"flex gap-4 sm:gap-6 pl-16 sm:pl-20 relative pb-14");
console.log('=== TIMELINE EVENT ===');
console.log(c.slice(idx, idx + 1200));

// Find guestbook/mensagens section
const gbIdx = c.indexOf('MessageCircle') > -1 ? c.indexOf('guestbook') : c.indexOf('mensagens_visita');
const gbIdx2 = c.indexOf('Livro de');
const gbIdx3 = c.indexOf('livro de');
console.log('\n=== GUESTBOOK ===');
console.log('guestbook:', gbIdx, 'Livro de:', gbIdx2, 'livro:', gbIdx3);
if (gbIdx2 !== -1) console.log(c.slice(gbIdx2, gbIdx2 + 800));
else if (gbIdx3 !== -1) console.log(c.slice(gbIdx3, gbIdx3 + 800));

// Find formatura-specific rendering
const formJSX = c.indexOf("formatura");
let pos = 0;
console.log('\n=== FORMATURA refs ===');
while ((pos = c.indexOf('formatura', pos + 1)) !== -1) {
  if (pos > 20000) { // only JSX area
    const line = c.slice(c.lastIndexOf('\n', pos) + 1, c.indexOf('\n', pos)).trim();
    if (line.length < 150) console.log(pos + ': ' + line);
  }
}
