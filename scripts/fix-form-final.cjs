const fs = require('fs');
let c = fs.readFileSync('src/app/criar/page.tsx', 'utf8');

// ===== 1. FIX PASSOS — add bucketlist + locais =====
c = c.replace(
  "{ id: 'detalhes', titulo: 'Detalhes', visivel: () => true },\n  { id: 'mensagem', titulo: 'Mensagem', visivel: () => true },",
  "{ id: 'detalhes', titulo: 'Detalhes', visivel: () => true },\n  { id: 'bucketlist', titulo: 'Sonhos', visivel: (f) => f.tipo === 'casal', opcional: true },\n  { id: 'locais', titulo: 'Locais', visivel: (f) => f.tipo === 'casal', opcional: true },\n  { id: 'mensagem', titulo: 'Mensagem', visivel: () => true },"
);
// Verify
const passosCheck = c.includes("id: 'bucketlist'");
console.log('1. PASSOS bucketlist:', passosCheck ? 'OK' : 'FAIL');

// If still not matched, try alternate spacing
if (!passosCheck) {
  // Find exact text
  const idx = c.indexOf("id: 'detalhes'");
  const area = c.slice(idx, idx + 200);
  console.log('   PASSOS area:', JSON.stringify(area.slice(0, 180)));
}

// ===== 2. FIX FormData interface — add audioMensagem + locais =====
if (!c.includes('audioMensagem')) {
  c = c.replace(
    'dadosCasal: DadosCasal; dadosFormatura: DadosFormatura\n  bucketList: Array<{texto: string; feito: boolean}>\n  locais: Array<{titulo: string; descricao: string; endereco: string}>\n  audioMensagem: File | null\n}',
    'dadosCasal: DadosCasal; dadosFormatura: DadosFormatura\n  bucketList: Array<{texto: string; feito: boolean}>\n  locais: Array<{titulo: string; descricao: string; endereco: string}>\n  audioMensagem: File | null\n}'
  );
  // If above didn't work (already has the right content), try adding to existing
  if (!c.includes('audioMensagem')) {
    // Find end of FormData interface
    const fdEnd = c.indexOf('\n}', c.indexOf('interface FormData'));
    if (fdEnd !== -1) {
      const beforeEnd = c.slice(0, fdEnd);
      if (!beforeEnd.includes('audioMensagem')) {
        c = beforeEnd + '\n  audioMensagem: File | null\n  locais: Array<{titulo: string; descricao: string; endereco: string}>' + c.slice(fdEnd);
        console.log('2a. FormData audioMensagem + locais: ADDED');
      }
    }
  }
}
console.log('2. FormData audioMensagem:', c.includes('audioMensagem: File') ? 'OK' : 'FAIL');

// ===== 3. FIX initial state — add locais + audioMensagem =====
if (!c.includes("locais: [],")) {
  c = c.replace(
    "bucketList: [],\n      dadosCasal:",
    "bucketList: [],\n      locais: [],\n      audioMensagem: null,\n      dadosCasal:"
  );
}
// Check alternate pattern
if (!c.includes("locais: [],")) {
  c = c.replace(
    "bucketList: [],",
    "bucketList: [],\n      locais: [],\n      audioMensagem: null,"
  );
}
console.log('3. Initial state locais:', c.includes('locais: [],') ? 'OK' : 'FAIL');
console.log('3. Initial state audio:', c.includes('audioMensagem: null') ? 'OK' : 'FAIL');

// ===== 4. ADD AUDIO UI in PassoMensagem =====
if (!c.includes('Mensagem de voz')) {
  // Find the character counter in PassoMensagem
  const counterIdx = c.indexOf('/600 caracteres');
  if (counterIdx !== -1) {
    const lineEnd = c.indexOf('\n', c.indexOf('</p>', counterIdx));
    const audioUI = `

          {/* Upload de audio */}
          <div className="mt-6 p-4 rounded-2xl border border-white/[0.15]" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-sm font-medium text-white mb-1">Mensagem de voz</p>
            <p className="text-xs text-zinc-500 mb-4">Envie um audio com sua voz. Ele sera revelado com efeito especial.</p>
            {form.audioMensagem ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.15]">
                  <span className="text-sm text-zinc-300 truncate">{form.audioMensagem.name}</span>
                  <span className="text-xs text-zinc-600">{(form.audioMensagem.size / 1024 / 1024).toFixed(1)}MB</span>
                </div>
                <button type="button" onClick={() => upd('audioMensagem', null)} className="text-zinc-500 hover:text-red-400 transition p-2">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed border-white/10 hover:border-white/25 cursor-pointer transition text-zinc-500 hover:text-white">
                <Upload className="w-4 h-4" />
                <span className="text-sm">Enviar arquivo de audio</span>
                <input type="file" accept="audio/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f && f.size <= 10*1024*1024) upd('audioMensagem', f); }} />
              </label>
            )}
            <p className="text-xs text-zinc-600 mt-2">MP3, M4A, WAV (max 10MB)</p>
          </div>`;
    c = c.slice(0, lineEnd) + audioUI + c.slice(lineEnd);
    console.log('4. Audio UI: OK');
  } else {
    console.log('4. Audio UI: counter not found');
  }
}

// ===== 5. ADD audio + locais to submit =====
if (!c.includes("fd.append('audioMensagem'")) {
  c = c.replace(
    "fd.append('locais', JSON.stringify(form.locais))",
    "fd.append('locais', JSON.stringify(form.locais))\n      if (form.audioMensagem) fd.append('audioMensagem', form.audioMensagem)"
  );
  // If locais append doesn't exist either
  if (!c.includes("fd.append('locais'")) {
    c = c.replace(
      "fd.append('bucketList', JSON.stringify(form.bucketList))",
      "fd.append('bucketList', JSON.stringify(form.bucketList))\n      fd.append('locais', JSON.stringify(form.locais))\n      if (form.audioMensagem) fd.append('audioMensagem', form.audioMensagem)"
    );
  }
  console.log('5. Submit audio+locais:', c.includes("fd.append('audioMensagem'") ? 'OK' : 'FAIL');
}

fs.writeFileSync('src/app/criar/page.tsx', c, 'utf8');

// ===== FINAL VERIFY =====
const final = fs.readFileSync('src/app/criar/page.tsx', 'utf8');
console.log('\n--- FINAL CHECK ---');
console.log('PASSOS has bucketlist:', final.includes("id: 'bucketlist'"));
console.log('PASSOS has locais:', final.includes("id: 'locais'"));
console.log('FormData has audioMensagem:', final.includes('audioMensagem: File'));
console.log('FormData has locais:', final.includes('locais: Array'));
console.log('Initial state locais:', final.includes('locais: [],'));
console.log('Initial state audio:', final.includes('audioMensagem: null'));
console.log('Audio UI:', final.includes('Mensagem de voz'));
console.log('Submit audio:', final.includes("fd.append('audioMensagem'"));
console.log('Render bucketlist:', final.includes('passoAtual?.id === "bucketlist"'));
console.log('Render locais:', final.includes('passoAtual?.id === "locais"'));
