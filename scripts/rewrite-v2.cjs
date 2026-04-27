const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');
const lines = c.split('\n');

// Find the main return ( line
let returnLine = -1;
for (let i = 680; i < 700; i++) {
  if (lines[i]?.trim() === 'return (' && lines[i+1]?.includes('containerRef')) {
    returnLine = i;
    break;
  }
}

if (returnLine === -1) { console.log('RETURN NOT FOUND'); process.exit(1); }
console.log('Return at line:', returnLine + 1);

// Keep everything before this return line
const logic = lines.slice(0, returnLine).join('\n');

const render = `
 return (
 <div ref={containerRef} className="text-white relative"
   style={{ background: '#000', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

   {showWrapped && pagina.tipo === 'casal' && (
     <EternizarWrapped
       titulo={pagina.titulo}
       dataInicio={pagina.dados_casal?.dataInicio}
       comidaFavorita={pagina.dados_casal?.comeFavorita}
       filmeFavorito={pagina.dados_casal?.filmeFavorito}
       cidadeEncontro={pagina.dados_casal?.cidadePrimeiroEncontro}
       musicaCapa={pagina.musica_dados?.capa}
       musicaNome={pagina.musica_dados?.nome}
       previewUrl={pagina.musica_dados?.previewUrl}
       cor={cor}
       onDesbloquear={() => setShowWrapped(false)}
     />
   )}

   {/* Progress bar */}
   <div className="fixed top-0 left-0 right-0 h-0.5 z-50" style={{ background: 'rgba(255,255,255,0.05)' }}>
     <motion.div style={{ width: progressWidth, backgroundColor: cor }} className="h-full" />
   </div>

   <style>{\`
     @keyframes spin-slow { to { transform: rotate(360deg) } }
     @keyframes pulse-second { 0%,100% { opacity: 1 } 50% { opacity: 0.5 } }
   \`}</style>

   {/* ===== HERO ===== */}
   <section className="min-h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden">
     {fotoCapa && (
       <div className="absolute inset-0 pointer-events-none">
         {/* eslint-disable-next-line @next/next/no-img-element */}
         <img src={fotoCapa} alt="" className="w-full h-full object-cover opacity-50" style={{ objectPosition: 'center 30%' }} />
         <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 50%, #000 100%)' }} />
       </div>
     )}
     <div className="relative z-10 text-center px-6 max-w-2xl">
       <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }} className="mb-8">
         <Heart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" style={{ color: cor, fill: cor }} />
       </motion.div>
       <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
         className="text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-4 sm:mb-6" style={{ color: cor }}>
         Uma surpresa especial para voce
       </motion.p>
       <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8 }}
         className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight nome-capitalize">
         {pagina.titulo}
       </motion.h1>
       {pagina.subtitulo && (
         <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
           className="text-base sm:text-lg mt-4 sm:mt-6 nome-capitalize" style={{ color: 'rgba(255,255,255,0.6)' }}>
           {pagina.subtitulo}
         </motion.p>
       )}
     </div>
     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
       className="absolute bottom-8 left-1/2 -translate-x-1/2">
       <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 1.2, repeat: Infinity }}
         className="w-6 h-9 rounded-full border-2 border-white/20 flex items-start justify-center pt-2">
         <motion.div animate={{ y: [0, 8, 0], opacity: [1, 0, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
           className="w-1 h-2 rounded-full bg-white/50" />
       </motion.div>
     </motion.div>
   </section>

   {/* ===== COUNTER ===== */}
   {pagina.tipo === 'casal' && pagina.dados_casal?.dataInicio && (
     <section className="min-h-[100dvh] flex items-center justify-center px-6 relative">
       <div className="absolute -top-20 -left-20 w-[300px] h-[300px] pointer-events-none opacity-[0.04]">
         <div className="absolute inset-0 animate-[spin-slow_40s_linear_infinite]">
           {[1,2,3,4].map(i => (<div key={i} className="absolute rounded-full border border-white" style={{ inset: i*35 }} />))}
         </div>
       </div>
       <Secao className="text-center max-w-xl w-full">
         <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-8 sm:mb-12" style={{ color: cor }}>Contando cada segundo</p>
         <ContadorTempo dataInicio={pagina.dados_casal.dataInicio} cor={cor} paleta={paleta} />
         {pagina.musica_dados?.previewUrl && (
           <Secao delay={0.3} className="mt-12 sm:mt-16">
             <div className="flex items-center gap-4 max-w-sm mx-auto">
               <button onClick={() => {
                 if (!audioRef.current) { audioRef.current = new Audio(pagina.musica_dados!.previewUrl!); audioRef.current.volume = 0.5; audioRef.current.loop = true }
                 if (audioRef.current.paused) audioRef.current.play().catch(() => {}); else audioRef.current.pause()
               }} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0"
                 style={{ background: \`\${cor}20\`, border: \`1px solid \${cor}40\` }}>
                 <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white ml-0.5" />
               </button>
               {pagina.musica_dados.capa && (
                 <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden shrink-0">
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                   <img src={pagina.musica_dados.capa} alt="" className="w-full h-full object-cover" />
                 </div>
               )}
               <div className="min-w-0">
                 <p className="text-sm text-white truncate">{pagina.musica_dados.nome}</p>
                 <p className="text-xs text-white/40 truncate">{pagina.musica_dados.artista}</p>
               </div>
             </div>
           </Secao>
         )}
       </Secao>
     </section>
   )}

   {/* ===== FOTOS ===== */}
   {fotosNormalizadas.length > 0 && (
     <section className="min-h-[80dvh] flex items-center justify-center px-6 py-20">
       <Secao className="w-full max-w-4xl">
         <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-8 sm:mb-12 text-center" style={{ color: cor }}>Nossos momentos</p>
         <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
           {fotosNormalizadas.slice(0, 6).map((foto, i) => (
             <motion.button key={i} onClick={() => { setStoryInicial(i); setStoriesAberto(true) }}
               initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
               transition={{ delay: i * 0.1, duration: 0.6 }}
               className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden group">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src={foto.url} alt={foto.legenda || ''} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
               {foto.legenda && (
                 <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 bg-gradient-to-t from-black/60 to-transparent">
                   <p className="text-[10px] sm:text-xs text-white/80 truncate">{foto.legenda}</p>
                 </div>
               )}
             </motion.button>
           ))}
         </div>
         {fotosNormalizadas.length > 6 && (
           <button onClick={() => { setStoryInicial(0); setStoriesAberto(true) }}
             className="mt-6 mx-auto flex items-center gap-2 text-sm" style={{ color: cor }}>
             <Images className="w-4 h-4" /> Ver todas as {fotosNormalizadas.length} fotos
           </button>
         )}
       </Secao>
     </section>
   )}

   {storiesAberto && <StoriesViewer fotos={fotosNormalizadas} startIndex={storyInicial} onClose={() => setStoriesAberto(false)} cor={cor} />}

   {/* ===== COMO SE CONHECERAM ===== */}
   {pagina.dados_casal?.comoSeConheceram && (
     <section className="min-h-[80dvh] flex items-center justify-center px-6 py-20">
       <Secao className="text-center max-w-2xl">
         <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-8 sm:mb-12" style={{ color: cor }}>Como tudo comecou</p>
         <p className="text-xl sm:text-2xl md:text-3xl leading-relaxed italic text-white/80 break-words">
           &ldquo;{pagina.dados_casal.comoSeConheceram}&rdquo;
         </p>
         <div className="w-12 h-px mx-auto mt-8 sm:mt-12" style={{ background: cor }} />
       </Secao>
     </section>
   )}

   {/* ===== TAGS ===== */}
   {pagina.dados_casal && (pagina.dados_casal.cidadePrimeiroEncontro || pagina.dados_casal.comeFavorita || pagina.dados_casal.filmeFavorito) && (
     <section className="py-16 sm:py-20 px-6">
       <Secao className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
         {[
           pagina.dados_casal.cidadePrimeiroEncontro && { icon: <MapPinIcon className="w-3.5 h-3.5" style={{ color: cor }} />, text: pagina.dados_casal.cidadePrimeiroEncontro },
           pagina.dados_casal.comeFavorita && { icon: <Utensils className="w-3.5 h-3.5" style={{ color: cor }} />, text: pagina.dados_casal.comeFavorita },
           pagina.dados_casal.filmeFavorito && { icon: <Film className="w-3.5 h-3.5" style={{ color: cor }} />, text: pagina.dados_casal.filmeFavorito },
         ].filter(Boolean).map((item: any, i) => (
           <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
             transition={{ delay: i * 0.1 }} className="flex items-center gap-2.5 px-5 py-2.5 rounded-full"
             style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
             {item.icon}
             <span className="text-sm text-white/80">{item.text}</span>
           </motion.div>
         ))}
       </Secao>
     </section>
   )}

   {/* ===== MAPA ===== */}
   {pagina.locais && pagina.locais.length > 0 && (
     <section className="py-16 sm:py-20 px-6">
       <Secao className="max-w-3xl mx-auto">
         <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-8 sm:mb-12 text-center" style={{ color: cor }}>Mapa do amor</p>
         <div className="rounded-2xl overflow-hidden" style={{ height: 400 }}>
           <MapaAmor locais={pagina.locais} cor={cor} />
         </div>
       </Secao>
     </section>
   )}

   {/* ===== TIMELINE ===== */}
   {pagina.linha_do_tempo && pagina.linha_do_tempo.length > 0 && (
     <section className="py-16 sm:py-24 px-6">
       <Secao className="max-w-2xl mx-auto">
         <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-12 sm:mb-16 text-center" style={{ color: cor }}>Nossa timeline</p>
         <div className="space-y-16 sm:space-y-24">
           {pagina.linha_do_tempo.map((ev, i) => (
             <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.8, delay: 0.1 }} className="text-center">
               <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-4 sm:mb-6" style={{ color: \`\${cor}aa\` }}>
                 {ev.data && new Date(ev.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
               </p>
               {ev.fotoUrl && (
                 <div className="rounded-xl sm:rounded-2xl overflow-hidden mb-6 sm:mb-8 aspect-video">
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                   <img src={ev.fotoUrl} alt={ev.titulo} className="w-full h-full object-cover" />
                 </div>
               )}
               <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight mb-3 break-words">{ev.titulo}</h3>
               {ev.descricao && <p className="text-sm sm:text-base text-white/60 leading-relaxed max-w-lg mx-auto break-words">{ev.descricao}</p>}
               {i < pagina.linha_do_tempo.length - 1 && (
                 <div className="w-px h-12 sm:h-16 mx-auto mt-10 sm:mt-14" style={{ background: \`\${cor}30\` }} />
               )}
             </motion.div>
           ))}
         </div>
       </Secao>
     </section>
   )}

   {/* ===== MENSAGEM ===== */}
   <section className="min-h-[80dvh] flex items-center justify-center px-6 py-20">
     <Secao className="text-center max-w-2xl">
       <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-8 sm:mb-12" style={{ color: cor }}>Uma mensagem do coracao</p>
       <p className="text-lg sm:text-xl md:text-2xl leading-relaxed text-white/85 whitespace-pre-wrap break-words">{pagina.mensagem}</p>
       <div className="w-12 h-px mx-auto mt-8 sm:mt-12" style={{ background: cor }} />
     </Secao>
   </section>

   {/* ===== BUCKET LIST ===== */}
   {pagina.bucket_list && (pagina.bucket_list as any[]).length > 0 && (
     <section className="py-16 sm:py-20 px-6">
       <Secao className="max-w-lg mx-auto">
         <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-8 sm:mb-12 text-center" style={{ color: cor }}>Nossos sonhos juntos</p>
         <div className="space-y-3">
           {(pagina.bucket_list as any[]).map((item: any, i: number) => (
             <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
               transition={{ delay: i * 0.05 }} className="flex items-center gap-3 py-3">
               <div className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0"
                 style={{ borderColor: item.feito ? cor : 'rgba(255,255,255,0.15)', background: item.feito ? cor : 'transparent' }}>
                 {item.feito && <span className="text-xs text-white">&#10003;</span>}
               </div>
               <span className={\`text-sm sm:text-base \${item.feito ? 'line-through text-white/40' : 'text-white/80'}\`}>{item.texto}</span>
             </motion.div>
           ))}
         </div>
       </Secao>
     </section>
   )}

   {/* ===== AUDIO CAPSULE ===== */}
   {pagina.audio_mensagem && (
     <section className="min-h-[60dvh] flex items-center justify-center px-6 py-16">
       <Secao className="max-w-xl mx-auto w-full">
         <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-8 sm:mb-12 text-center" style={{ color: cor }}>Capsula de voz</p>
         <CapsulaAudio audioUrl={pagina.audio_mensagem} mensagem={pagina.mensagem} cor={cor} musicRef={audioRef} />
       </Secao>
     </section>
   )}

   {/* ===== GUESTBOOK ===== */}
   <section className="py-16 sm:py-20 px-6">
     <Secao className="max-w-lg mx-auto">
       <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-8 sm:mb-12 text-center" style={{ color: cor }}>Deixe sua mensagem</p>
       <div className="space-y-3 mb-10">
         <input value={guestNome} onChange={e => setGuestNome(e.target.value)} placeholder="Seu nome"
           className="w-full bg-transparent border-b border-white/10 px-2 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition" />
         <textarea value={guestMsg} onChange={e => setGuestMsg(e.target.value)} placeholder="Sua mensagem..." rows={3}
           className="w-full bg-transparent border-b border-white/10 px-2 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition resize-none" />
         <button onClick={enviarGuestbook} disabled={guestEnviando || !guestNome.trim() || !guestMsg.trim()}
           className="w-full py-3 rounded-full text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-30" style={{ background: cor }}>
           {guestEnviando ? 'Enviando...' : 'Enviar'}
         </button>
         {guestSucesso && <p className="text-xs text-center text-green-400">Mensagem enviada!</p>}
         {guestPendente && <p className="text-xs text-center text-amber-400">Aguardando aprovacao.</p>}
         {guestErro && <p className="text-xs text-center text-red-400">{guestErro}</p>}
       </div>
       {guestMsgs.length > 0 && (
         <div className="space-y-6">
           {guestMsgs.filter(m => m.aprovado !== false || ehDono).map(msg => (
             <motion.div key={msg.id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
               className="py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
               <div className="flex items-center gap-2 mb-2">
                 <p className="text-sm font-bold text-white">{msg.nome}</p>
                 <p className="text-[10px] text-white/25">{new Date(msg.created_at).toLocaleDateString('pt-BR')}</p>
                 {msg.aprovado === false && <span className="text-[9px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">Pendente</span>}
               </div>
               <p className="text-sm text-white/60 leading-relaxed">{msg.mensagem}</p>
               {ehDono && msg.aprovado === false && (
                 <button onClick={() => aprovarMsg(msg.id)} className="text-[10px] mt-2 px-3 py-1 rounded-full" style={{ background: \`\${cor}20\`, color: cor }}>Aprovar</button>
               )}
             </motion.div>
           ))}
         </div>
       )}
     </Secao>
   </section>

   {/* ===== FOOTER ===== */}
   <section className="py-20 sm:py-28 text-center px-6">
     <Secao className="max-w-md mx-auto">
       <div className="w-8 h-px mx-auto mb-8" style={{ background: cor }} />
       <p className="text-xl sm:text-2xl font-black tracking-tight mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>A historia continua...</p>
       <p className="text-[9px] uppercase tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.08)' }}>eternizar</p>
     </Secao>
   </section>
 </div>
 )
}`;

c = logic + render;
fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('OK. Size:', Math.round(c.length / 1024) + 'KB, Lines:', c.split('\n').length);
