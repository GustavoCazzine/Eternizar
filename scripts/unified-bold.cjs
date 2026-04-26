const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');
const before = c.length;

// ================================================================
// UNIFIED BOLD MINIMALISM — Final pass
// ================================================================

// ===== 1. PASSWORD SCREEN — Wrapped aesthetic =====
// Replace the entire password screen
const senhaScreenRegex = /(<div className="min-h-screen text-white flex items-center justify-center px-4"[\s\S]*?Abrir surpresa[\s\S]*?<\/button>\s*<\/motion\.div>\s*<\/div>)/;
if (senhaScreenRegex.test(c)) {
  c = c.replace(senhaScreenRegex, `<div className="min-h-screen text-white flex items-center justify-center px-4 relative overflow-hidden"
 style={{ background: '#000000' }}>
 {/* Background photo */}
 {fotoCapa && (
   <div className="absolute inset-0">
     {/* eslint-disable-next-line @next/next/no-img-element */}
     <img src={fotoCapa} alt="" className="w-full h-full object-cover" style={{ filter: 'brightness(0.2) blur(8px)', transform: 'scale(1.1)' }} />
   </div>
 )}
 <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm w-full relative z-10">
   <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }}
     className="w-16 h-16 rounded-full mx-auto mb-8 flex items-center justify-center"
     style={{ border: \`2px solid \${cor}40\` }}>
     <svg className="w-6 h-6" style={{ color: cor }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
       <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
     </svg>
   </motion.div>
   <h1 className="text-3xl sm:text-4xl font-black mb-3" style={{ fontFamily: fontes.titulo }}>Uma surpresa te espera</h1>
   <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.35)' }}>Responda para desbloquear</p>
   {pagina.senha_dica && (
     <div className="mb-8">
       <p className="text-[10px] uppercase tracking-[0.3em] mb-2" style={{ color: cor }}>Dica</p>
       <p className="text-white/60 italic text-sm">"{pagina.senha_dica}"</p>
     </div>
   )}
   <input type="text" value={senhaInput}
     onChange={e => setSenhaInput(e.target.value)}
     onKeyDown={e => e.key === 'Enter' && verificarSenha()}
     placeholder="Sua resposta..."
     className="w-full bg-transparent border-b border-white/15 px-2 py-3 text-white text-center placeholder-white/20 focus:outline-none focus:border-white/40 transition mb-4"
     style={{ borderColor: erroSenha ? '#f43f5e' : undefined }}
   />
   {erroSenha && (
     <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs mb-4">
       Hmm, nao foi dessa vez.
     </motion.p>
   )}
   <button onClick={verificarSenha}
     className="w-full py-4 rounded-full font-bold text-white transition hover:opacity-90 mt-4"
     style={{ background: cor }}>
     Desbloquear
   </button>
   <p className="text-[10px] uppercase tracking-[0.3em] mt-12" style={{ color: 'rgba(255,255,255,0.1)' }}>eternizar</p>
 </motion.div>
</div>`);
  console.log('1. Password screen: REWRITTEN');
} else {
  console.log('1. Password screen: NOT FOUND');
}

// ===== 2. HERO — remove particles, glow orbs, fix gradient =====
// Remove particles block
c = c.replace(/\s*\{\/\* Part..culas decorativas globais \*\/\}\s*<div[^>]*fixed[^>]*overflow-hidden[^>]*>[\s\S]*?<\/div>\s*/g, '\n');
console.log('2a. Particles removed');

// Remove glow orbs
c = c.replace(/\s*\{\/\* Glow orbs animados \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*/g, '\n');
console.log('2b. Glow orbs removed');

// Fix hero gradient — clean linear only
c = c.replace(
  /background: fotoCapa\s*\? `linear-gradient\(to bottom, transparent 0%, \$\{paleta\.fundo\}40 30%, \$\{paleta\.fundo\}bb 60%, #0A0A0A 100%\)`\s*: `radial-gradient\(ellipse at 50% 30%, \$\{paleta\.fundoAlt\}, #0A0A0A\)`/,
  "background: fotoCapa\n ? 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.85) 70%, #000 100%)'\n : '#000'"
);
console.log('2c. Hero gradient: clean linear');

// Background to pure black
c = c.replace(/style=\{\{ background: '#0A0A0A', fontFamily: fontes\.corpo \}\}/g, "style={{ background: '#000', fontFamily: fontes.corpo }}");
console.log('2d. Main background: #000');

// ===== 3. COUNTER TITLE — bigger =====
c = c.replace(
  /className="text-3xl sm:text-4xl font-black mb-2">Contando cada segundo/,
  'className="text-4xl sm:text-5xl md:text-6xl font-black mb-2" style={{ fontFamily: fontes.titulo }}>Contando cada segundo'
);
console.log('3. Counter title: upsized');

// ===== 4. TAGS — replace boxes with editorial pills =====
const tagsGridRegex = /<div className="grid grid-cols-2 gap-3">\s*\{[\s\S]*?icon: 'MapPin'[\s\S]*?<\/div>\s*<\/Secao>\s*\)\}/;
if (tagsGridRegex.test(c)) {
  c = c.replace(tagsGridRegex, `<div className="flex flex-wrap justify-center gap-3">
 {[
   pagina.dados_casal.cidadePrimeiroEncontro && { icon: <MapPinIcon className="w-3.5 h-3.5" style={{ color: cor }} />, text: pagina.dados_casal.cidadePrimeiroEncontro },
   pagina.dados_casal.comeFavorita && { icon: <Utensils className="w-3.5 h-3.5" style={{ color: cor }} />, text: pagina.dados_casal.comeFavorita },
   pagina.dados_casal.filmeFavorito && { icon: <Film className="w-3.5 h-3.5" style={{ color: cor }} />, text: pagina.dados_casal.filmeFavorito },
 ].filter(Boolean).map((item, i) => (
   <motion.div key={i}
     initial={{ opacity: 0, y: 10 }}
     whileInView={{ opacity: 1, y: 0 }}
     viewport={{ once: true }}
     transition={{ delay: i * 0.1 }}
     className="flex items-center gap-2.5 px-5 py-2.5 rounded-full"
     style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.06)' }}>
     {item.icon}
     <span className="text-sm text-white/80 font-medium">{item.text}</span>
   </motion.div>
 ))}
 </div>
 </Secao>
 )}`);
  console.log('4. Tags: editorial pills');
} else {
  console.log('4. Tags: regex not matched');
}

// ===== 5. SECTION BACKGROUNDS — remove palette gradients =====
c = c.replace(
  /style=\{\{ background: `linear-gradient\(180deg, #0A0A0A, \$\{paleta\.fundo\}, #0A0A0A\)` \}\}/g,
  "style={{ background: '#000' }}"
);
c = c.replace(
  /style=\{\{ background: `linear-gradient\(180deg, #0A0A0A, \$\{paleta\.fundo\} 50%, #0A0A0A\)` \}\}/g,
  "style={{ background: '#000' }}"
);
console.log('5. Section backgrounds: pure black');

// ===== 6. CARTA SELADA — minimalist icon =====
c = c.replace(
  /<div className="w-16 h-12 relative">\s*<div className="absolute inset-0 rounded-lg"[^/]*\/>\s*<div className="absolute top-0[^/]*\/>\s*<\/div>/,
  `<svg className="w-12 h-12" style={{ color: cor }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
       <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/>
     </svg>`
);
console.log('6. Carta icon: minimalist SVG');

// ===== 7. MENSAGEM SECTION — clean background =====
c = c.replace(
  /style=\{\{ background: `radial-gradient\(ellipse at center bottom, \$\{paleta\.fundoAlt\}, #0A0A0A\)` \}\}/,
  "style={{ background: '#000' }}"
);
console.log('7. Mensagem background: pure black');

// ===== 8. FOOTER — clean =====
c = c.replace(
  /style=\{\{ background: `linear-gradient\(180deg, #0A0A0A, \$\{paleta\.fundo\}, #0A0A0A\)` \}\}/g,
  "style={{ background: '#000' }}"
);
console.log('8. All remaining gradients: removed');

// ===== 9. COMO SE CONHECERAM QUOTES — remove box styling =====
c = c.replace(
  /className="text-6xl font-serif mb-4 select-none" style=\{\{ color: `\$\{cor\}40` \}\}>"<\/div>/g,
  ''
);
c = c.replace(
  /className="text-6xl font-serif mt-2 text-right select-none" style=\{\{ color: `\$\{cor\}40` \}\}>"<\/div>/g,
  ''
);
console.log('9. Quote marks: cleaned');

// ===== 10. REMAINING CLEANUP =====
// Remove any leftover #0A0A0A, use #000
c = c.split('#0A0A0A').join('#000');
// Fix palette fundoAlts to near-black
c = c.replace(/fundoAlt: '#[0-9a-f]{6}'/g, "fundoAlt: '#050505'");
console.log('10. All backgrounds unified to #000');

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('\n=== UNIFIED BOLD MINIMALISM COMPLETE ===');
console.log('Size:', Math.round(c.length / 1024) + 'KB (was ' + Math.round(before / 1024) + 'KB)');
