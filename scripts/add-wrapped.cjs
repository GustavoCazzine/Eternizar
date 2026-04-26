const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Insert after the main container div opening
c = c.replace(
  "style={{ background: '#121212', fontFamily: fontes.corpo }}>\n\n {/* Barra de progresso */}",
  `style={{ background: '#121212', fontFamily: fontes.corpo }}>

        {showWrapped && pagina.tipo === 'casal' && (
          <EternizarWrapped
            titulo={pagina.titulo}
            fotoCapa={fotoCapa}
            dataInicio={pagina.dados_casal?.dataInicio}
            comidaFavorita={pagina.dados_casal?.comeFavorita}
            cor={cor}
            fontes={fontes}
            onDesbloquear={() => setShowWrapped(false)}
          />
        )}

 {/* Barra de progresso */}`
);

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('EternizarWrapped render:', c.includes('<EternizarWrapped') ? 'OK' : 'FAIL');
