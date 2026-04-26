const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');
// Remove ALL 'use client' and version comments, then add one clean copy
c = c.replace(/^\s*'use client'\s*/g, '');
c = c.replace(/\/\* v\d+ \*\/\s*/g, '');
c = "'use client'\n\n" + c.trim() + '\n';
fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
const first = c.split('\n').slice(0,4);
first.forEach((l,i) => console.log(i+1 + ': ' + l.slice(0,60)));
console.log('use client count:', (c.match(/'use client'/g)||[]).length);
