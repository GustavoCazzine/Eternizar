const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Use regex that handles CRLF
const target = /style=\{\{ background: '#121212', fontFamily: fontes\.corpo \}\}>\s*\{\/\* Barra de progresso \*\/\}/;

if (target.test(c)) {
  c = c.replace(target, `style={{ background: '#121212', fontFamily: fontes.corpo }}>

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

 {/* Barra de progresso */}`);
  console.log('OK: EternizarWrapped inserted');
} else {
  console.log('FAIL: pattern not found');
}

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('Has render:', c.includes('<EternizarWrapped'));
