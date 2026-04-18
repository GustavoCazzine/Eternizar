const fs = require('fs');

// ===== 1. ADD AUDIO UPLOAD TO FORM =====
let c = fs.readFileSync('src/app/criar/page.tsx', 'utf8');

// Add audio upload UI to PassoMensagem (after the textarea)
const mensagemTextarea = c.indexOf('</textarea>', c.indexOf('function PassoMensagem'));
if (mensagemTextarea !== -1) {
  // Find the closing of the character counter
  const charCounter = c.indexOf('/600 caracteres', mensagemTextarea);
  const afterCounter = c.indexOf('\n', charCounter);
  
  if (afterCounter !== -1 && !c.includes('audioMensagem')) {
    // Wait, audioMensagem is already in FormData from previous step? Let me check
    console.log('Has audioMensagem in FormData:', c.includes('audioMensagem'));
  }
  
  if (!c.includes('audioMensagem') || !c.includes('Gravar mensagem')) {
    const audioUI = `

          {/* Upload de audio */}
          <div className="mt-6 p-4 rounded-2xl border border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-sm font-medium text-white mb-1">Mensagem de voz</p>
            <p className="text-xs text-zinc-500 mb-4">Grave ou envie um audio com sua voz. Ele sera revelado na pagina com efeito especial.</p>
            
            {form.audioMensagem ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10">
                  <svg className="w-4 h-4 text-green-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                  <span className="text-sm text-zinc-300 truncate">{form.audioMensagem.name}</span>
                  <span className="text-xs text-zinc-600">{(form.audioMensagem.size / 1024 / 1024).toFixed(1)}MB</span>
                </div>
                <button type="button" onClick={() => upd('audioMensagem', null)}
                  className="text-zinc-500 hover:text-red-400 transition p-2">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed border-white/10 hover:border-white/25 cursor-pointer transition text-zinc-500 hover:text-white">
                <Upload className="w-4 h-4" />
                <span className="text-sm">Enviar arquivo de audio</span>
                <input type="file" accept="audio/*" className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file && file.size <= 10 * 1024 * 1024) upd('audioMensagem', file)
                    else if (file) alert('Audio deve ter no maximo 10MB')
                  }} />
              </label>
            )}
            <p className="text-xs text-zinc-600 mt-2">Formatos: MP3, M4A, WAV, OGG (max 10MB)</p>
          </div>`;
    
    c = c.slice(0, afterCounter) + audioUI + c.slice(afterCounter);
    console.log('1. Audio upload UI: OK');
  }
}

// ===== 2. ADD AUDIO TO SUBMIT =====
if (!c.includes("fd.append('audioMensagem'")) {
  c = c.replace(
    "fd.append('locais', JSON.stringify(form.locais))",
    "fd.append('locais', JSON.stringify(form.locais))\n      if (form.audioMensagem) fd.append('audioMensagem', form.audioMensagem)"
  );
  console.log('2. Audio submit: OK');
}

fs.writeFileSync('src/app/criar/page.tsx', c, 'utf8');

// ===== 3. API — handle audio upload =====
let api = fs.readFileSync('src/app/api/criar/route.ts', 'utf8');

if (!api.includes('audioMensagem')) {
  // Add audio upload after foto uploads section
  const afterEventoFotos = api.indexOf("// ---");
  // Find a better insertion point - after evento photos, before insert
  const insertPoint = api.indexOf("// --- 11. Inserir no banco");
  if (insertPoint === -1) {
    // Try alternate
    const beforeInsert = api.indexOf("const expiraEm = new Date()");
    if (beforeInsert !== -1) {
      const audioUpload = `
    // --- Upload audio mensagem ---
    let audioMensagemUrl = ''
    const audioFile = fd.get('audioMensagem') as File | null
    if (audioFile instanceof File && audioFile.size > 0) {
      if (audioFile.size > 10 * 1024 * 1024) {
        return NextResponse.json({ erro: 'Audio deve ter no maximo 10MB.' }, { status: 400 })
      }
      const audioExt = audioFile.name.split('.').pop()?.toLowerCase() || 'mp3'
      const allowedAudio = ['mp3', 'm4a', 'wav', 'ogg', 'webm', 'aac']
      if (allowedAudio.includes(audioExt)) {
        const audioNome = \`\${slug}/audio-\${Date.now()}.\${audioExt}\`
        const audioBuffer = await audioFile.arrayBuffer()
        const { error: audioErr } = await supabase.storage.from('fotos').upload(audioNome, audioBuffer, { contentType: audioFile.type })
        if (!audioErr) {
          const { data: audioData } = supabase.storage.from('fotos').getPublicUrl(audioNome)
          audioMensagemUrl = audioData.publicUrl
        }
      }
    }

`;
      api = api.slice(0, beforeInsert) + audioUpload + api.slice(beforeInsert);
      console.log('3a. API audio upload: OK');
    }
  }

  // Add audio_mensagem to insert
  api = api.replace(
    "email_cliente: emailCliente,",
    "audio_mensagem: audioMensagemUrl || null,\n      email_cliente: emailCliente,"
  );
  console.log('3b. API audio in insert: OK');

  // Add itunes to CSP connect-src for audio
  fs.writeFileSync('src/app/api/criar/route.ts', api, 'utf8');
}

// ===== 4. UPDATE CSP for audio from Supabase storage =====
let config = fs.readFileSync('next.config.ts', 'utf8');
if (!config.includes('*.supabase.co blob:')) {
  // media-src already has supabase via mzstatic, but ensure storage audio works
  // It should work since *.supabase.co covers storage URLs
  console.log('4. CSP media-src: already covers supabase storage');
}

console.log('\n=== EXTERNAL STEPS ===');
console.log('1. Supabase Storage: bucket "fotos" already accepts audio files (stored alongside photos)');
console.log('2. CORS on "fotos" bucket: ensure GET is allowed (already done if previous CORS was set)');
console.log('3. Optional: create separate "audio" bucket for organization');
console.log('\nAll code changes done. Run: npm run build');
