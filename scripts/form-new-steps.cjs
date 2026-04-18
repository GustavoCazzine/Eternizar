const fs = require('fs');
let c = fs.readFileSync('src/app/criar/page.tsx', 'utf8');

// ===== 1. UPDATE FormData INTERFACE =====
c = c.replace(
  "dadosCasal: DadosCasal; dadosFormatura: DadosFormatura\n  bucketList: Array<{texto: string; feito: boolean}>\n}",
  "dadosCasal: DadosCasal; dadosFormatura: DadosFormatura\n  bucketList: Array<{texto: string; feito: boolean}>\n  locais: Array<{titulo: string; descricao: string; endereco: string}>\n  audioMensagem: File | null\n}"
);
console.log('1. FormData interface: OK');

// ===== 2. UPDATE INITIAL STATE =====
c = c.replace(
  "bucketList: [],\n      dadosCasal:",
  "bucketList: [],\n      locais: [],\n      audioMensagem: null,\n      dadosCasal:"
);
console.log('2. Initial state: OK');

// ===== 3. ADD NEW PASSOS =====
c = c.replace(
  "{ id: 'detalhes', titulo: 'Detalhes', visivel: () => true },\n  { id: 'mensagem', titulo: 'Mensagem', visivel: () => true },",
  "{ id: 'detalhes', titulo: 'Detalhes', visivel: () => true },\n  { id: 'bucketlist', titulo: 'Sonhos', visivel: (f: FormData) => f.tipo === 'casal', opcional: true },\n  { id: 'locais', titulo: 'Locais', visivel: (f: FormData) => f.tipo === 'casal', opcional: true },\n  { id: 'mensagem', titulo: 'Mensagem', visivel: () => true },"
);
console.log('3. PASSOS: OK');

// ===== 4. ADD STEP COMPONENTS =====
// Find PassoMensagem and add before it
const passoMensagemIdx = c.indexOf('function PassoMensagem');
if (passoMensagemIdx !== -1) {
  const newSteps = `// Passo: Bucket List (sonhos do casal)
function PassoBucketList({ form, upd }: PassoProps) {
  function addItem() {
    if (form.bucketList.length >= 20) return
    upd('bucketList', [...form.bucketList, { texto: '', feito: false }])
  }
  function removeItem(i: number) {
    upd('bucketList', form.bucketList.filter((_: unknown, idx: number) => idx !== i))
  }
  function updateItem(i: number, texto: string) {
    const nova = [...form.bucketList]
    nova[i] = { ...nova[i], texto }
    upd('bucketList', nova)
  }
  function toggleFeito(i: number) {
    const nova = [...form.bucketList]
    nova[i] = { ...nova[i], feito: !nova[i].feito }
    upd('bucketList', nova)
  }

  const sugestoes = [
    'Morar juntos', 'Viajar para a Europa', 'Ter um pet',
    'Assistir ao nascer do sol na praia', 'Cozinhar juntos um jantar especial',
    'Fazer uma trilha', 'Acampar sob as estrelas', 'Aprender algo novo juntos',
  ]

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">O que vamos viver juntos</h2>
      <p className="text-sm text-zinc-500 mb-6">Crie uma lista de sonhos e planos do casal</p>

      {form.bucketList.length === 0 && (
        <div className="mb-6">
          <p className="text-xs text-zinc-600 mb-3">Sugestoes para comecar:</p>
          <div className="flex flex-wrap gap-2">
            {sugestoes.map(s => (
              <button key={s} type="button" onClick={() => upd('bucketList', [...form.bucketList, { texto: s, feito: false }])}
                className="px-3 py-1.5 rounded-lg text-xs border border-white/10 hover:border-white/25 text-zinc-400 hover:text-white transition">
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {form.bucketList.map((item: {texto: string; feito: boolean}, i: number) => (
          <div key={i} className="flex items-center gap-3">
            <button type="button" onClick={() => toggleFeito(i)}
              className={\`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition \${item.feito ? 'border-green-500 bg-green-500' : 'border-white/20'}\`}>
              {item.feito && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>}
            </button>
            <input value={item.texto} onChange={e => updateItem(i, e.target.value)}
              placeholder="Ex: Conhecer o Japao" className={\`flex-1 \${inputClass} \${item.feito ? 'line-through text-zinc-500' : ''}\`} />
            <button type="button" onClick={() => removeItem(i)} className="text-zinc-600 hover:text-red-400 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {form.bucketList.length < 20 && (
        <button type="button" onClick={addItem}
          className="mt-4 flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition">
          <Plus className="w-4 h-4" /> Adicionar item
        </button>
      )}
      <p className="text-xs text-zinc-600 mt-3">{form.bucketList.length}/20 itens</p>
    </div>
  )
}

// Passo: Locais especiais (preparado para mapa)
function PassoLocais({ form, upd }: PassoProps) {
  function addLocal() {
    if (form.locais.length >= 10) return
    upd('locais', [...form.locais, { titulo: '', descricao: '', endereco: '' }])
  }
  function removeLocal(i: number) {
    upd('locais', form.locais.filter((_: unknown, idx: number) => idx !== i))
  }
  function updateLocal(i: number, campo: string, valor: string) {
    const nova = [...form.locais]
    nova[i] = { ...nova[i], [campo]: valor }
    upd('locais', nova)
  }

  const sugestoes = [
    'Onde nos conhecemos', 'Primeiro encontro', 'Primeiro beijo',
    'Onde pediu em namoro', 'Viagem favorita', 'Restaurante especial',
  ]

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Mapa do Amor</h2>
      <p className="text-sm text-zinc-500 mb-6">Marque os lugares que fazem parte da historia de voces</p>

      {form.locais.length === 0 && (
        <div className="mb-6">
          <p className="text-xs text-zinc-600 mb-3">Sugestoes:</p>
          <div className="flex flex-wrap gap-2">
            {sugestoes.map(s => (
              <button key={s} type="button" onClick={() => upd('locais', [...form.locais, { titulo: s, descricao: '', endereco: '' }])}
                className="px-3 py-1.5 rounded-lg text-xs border border-white/10 hover:border-white/25 text-zinc-400 hover:text-white transition">
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {form.locais.map((local: {titulo: string; descricao: string; endereco: string}, i: number) => (
          <div key={i} className="p-4 rounded-2xl border border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-zinc-500 font-medium">Local {i + 1}</span>
              <button type="button" onClick={() => removeLocal(i)} className="text-zinc-600 hover:text-red-400 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input value={local.titulo} onChange={e => updateLocal(i, 'titulo', e.target.value)}
              placeholder="Nome do lugar" className={\`\${inputClass} mb-2\`} />
            <input value={local.endereco} onChange={e => updateLocal(i, 'endereco', e.target.value)}
              placeholder="Endereco (cidade, estado)" className={\`\${inputClass} mb-2\`} list="cidades" autoComplete="off" />
            <textarea value={local.descricao} onChange={e => updateLocal(i, 'descricao', e.target.value.slice(0, 200))}
              placeholder="O que aconteceu aqui? (opcional)" rows={2} className={inputClass} />
            <p className="text-xs text-zinc-600 mt-1 text-right">{local.descricao.length}/200</p>
          </div>
        ))}
      </div>

      {form.locais.length < 10 && (
        <button type="button" onClick={addLocal}
          className="mt-4 flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition">
          <Plus className="w-4 h-4" /> Adicionar local
        </button>
      )}
    </div>
  )
}

`;
  c = c.slice(0, passoMensagemIdx) + newSteps + c.slice(passoMensagemIdx);
  console.log('4. Step components: OK');
}

// ===== 5. ADD STEP RENDERING =====
c = c.replace(
  "{passoAtual?.id === \"detalhes\" && <PassoDetalhes {...passosProps} />}",
  "{passoAtual?.id === \"detalhes\" && <PassoDetalhes {...passosProps} />}\n                {passoAtual?.id === \"bucketlist\" && <PassoBucketList {...passosProps} />}\n                {passoAtual?.id === \"locais\" && <PassoLocais {...passosProps} />}"
);
console.log('5. Step rendering: OK');

// ===== 6. ADD TO SUBMIT =====
if (!c.includes("fd.append('locais'")) {
  c = c.replace(
    "fd.append('bucketList', JSON.stringify(form.bucketList))",
    "fd.append('bucketList', JSON.stringify(form.bucketList))\n      fd.append('locais', JSON.stringify(form.locais))"
  );
  console.log('6. Submit locais: OK');
}

// ===== 7. UPDATE API TO HANDLE LOCAIS =====
fs.writeFileSync('src/app/criar/page.tsx', c, 'utf8');

let api = fs.readFileSync('src/app/api/criar/route.ts', 'utf8');
if (!api.includes('locais')) {
  api = api.replace(
    "const bucketList = parseJsonSeguro",
    "const locais = parseJsonSeguro<Array<{titulo: string; descricao: string; endereco: string}>>(fd.get('locais') as string, [])\n    const bucketList = parseJsonSeguro"
  );
  api = api.replace(
    "bucket_list: bucketList",
    "locais: locais.slice(0, 10).map(l => ({ titulo: sanitize(String(l.titulo||'')).slice(0,100), descricao: sanitizeTexto(String(l.descricao||''),200), endereco: sanitize(String(l.endereco||'')).slice(0,100) })),\n      bucket_list: bucketList"
  );
  fs.writeFileSync('src/app/api/criar/route.ts', api, 'utf8');
  console.log('7. API locais: OK');
}

console.log('\nAll form steps done.');
