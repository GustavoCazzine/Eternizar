const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Add previewUrl prop
const addAfter = /musicaNome=\{pagina\.musica_dados\?\.nome\}/;
if (addAfter.test(c) && !c.includes('previewUrl={')) {
  c = c.replace(addAfter, `musicaNome={pagina.musica_dados?.nome}
            previewUrl={pagina.musica_dados?.previewUrl}`);
  console.log('previewUrl prop: ADDED');
} else {
  console.log('previewUrl prop:', c.includes('previewUrl={') ? 'EXISTS' : 'NOT FOUND');
}

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
