const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Use regex with \s* for CRLF tolerance
const oldProps = /<EternizarWrapped\s+titulo=\{pagina\.titulo\}\s+fotoCapa=\{fotoCapa\}\s+dataInicio=\{pagina\.dados_casal\?\.dataInicio\}\s+comidaFavorita=\{pagina\.dados_casal\?\.comeFavorita\}\s+cor=\{cor\}\s+fontes=\{fontes\}\s+onDesbloquear=\{[^}]+\}\s*\/>/;

if (oldProps.test(c)) {
  c = c.replace(oldProps, `<EternizarWrapped
            titulo={pagina.titulo}
            dataInicio={pagina.dados_casal?.dataInicio}
            comidaFavorita={pagina.dados_casal?.comeFavorita}
            filmeFavorito={pagina.dados_casal?.filmeFavorito}
            cidadeEncontro={pagina.dados_casal?.cidadePrimeiroEncontro}
            musicaCapa={pagina.musica_dados?.capa}
            musicaNome={pagina.musica_dados?.nome}
            cor={cor}
            fontes={fontes}
            onDesbloquear={() => setShowWrapped(false)}
          />`);
  console.log('Props: OK');
} else {
  // Try without fotoCapa
  const altProps = /<EternizarWrapped\s+titulo=\{pagina\.titulo\}\s+dataInicio/;
  if (altProps.test(c)) {
    console.log('Props: already updated or partial match');
  } else {
    // Find what's actually there
    const idx = c.indexOf('<EternizarWrapped');
    if (idx !== -1) {
      console.log('Found at:', idx);
      console.log('Content:', c.slice(idx, idx + 400));
    }
  }
}

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('Has filmeFavorito prop:', c.includes('filmeFavorito={'));
