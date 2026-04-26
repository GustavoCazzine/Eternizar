const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Find and update the EternizarWrapped render call to pass new props
c = c.replace(
  `<EternizarWrapped
            titulo={pagina.titulo}
            fotoCapa={fotoCapa}
            dataInicio={pagina.dados_casal?.dataInicio}
            comidaFavorita={pagina.dados_casal?.comeFavorita}
            cor={cor}
            fontes={fontes}
            onDesbloquear={() => setShowWrapped(false)}
          />`,
  `<EternizarWrapped
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
          />`
);

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('Props updated:', c.includes('filmeFavorito=') ? 'OK' : 'FAIL');
