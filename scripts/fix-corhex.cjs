const fs = require('fs');
let c = fs.readFileSync('src/app/criar/page.tsx', 'utf8');

// Replace corHex reference with inline color from form
c = c.replace(
  "style={{ color: corHex || '#ec4899' }}",
  "style={{ color: '#ec4899' }}"
);

fs.writeFileSync('src/app/criar/page.tsx', c, 'utf8');
console.log('Fixed: corHex -> hardcoded pink');
