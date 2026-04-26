const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// ================================================================
// BOLD MINIMALISM PIVOT — Spotify Wrapped aesthetic
// ================================================================

// ===== 1. BACKGROUND — #121212 → #0A0A0A =====
c = c.split('#121212').join('#0A0A0A');
c = c.split("'#0e0e0e'").join("'#050505'");
console.log('1. Background #0A0A0A: OK');

// ===== 2. CONTADOR — remove boxes, giant numbers =====
// Find ContadorTempo return and replace entirely
const contReturnStart = c.indexOf("return (\n <div ref={contadorRef}", c.indexOf('function ContadorTempo'));
const contReturnEnd = c.indexOf("\n}\n", contReturnStart);
if (contReturnStart !== -1 && contReturnEnd !== -1) {
  const newContReturn = `return (
    <div ref={contadorRef} className="flex flex-wrap justify-center gap-x-8 sm:gap-x-12 gap-y-4 max-w-xl mx-auto">
      {itens.map(item => (
        <div key={item.label} className="text-center">
          <p className={\`font-black tabular-nums leading-none \${item.dest ? 'text-5xl sm:text-6xl' : 'text-5xl sm:text-7xl'}\`}
            style={{ color: item.dest ? cor : 'white', animation: item.dest ? 'pulse-second 1s ease-in-out infinite' : 'none' }}>
            {String(item.valor).padStart(2, '0')}
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] mt-2" style={{ color: \`\${cor}99\` }}>{item.label}</p>
        </div>
      ))}
    </div>
  )`;
  c = c.slice(0, contReturnStart) + newContReturn + c.slice(contReturnEnd);
  console.log('2. Contador boxes removed, giant numbers: OK');
}

// ===== 3. PLAYER — remove border/bg =====
c = c.replace(
  "className=\"flex items-center gap-4 max-w-md mx-auto p-4 rounded-2xl\" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}",
  "className=\"flex items-center gap-4 max-w-md mx-auto p-4\""
);
console.log('3. Player borderless: OK');

// ===== 4. TAGS — editorial typography, no boxes =====
// Replace the entire tags section
const tagsStart = c.indexOf("{/* Cards de dados do casal");
const tagsEnd = c.indexOf("</Secao>\n )}");
if (tagsStart !== -1 && tagsEnd !== -1) {
  const newTags = `{/* Curiosidades — bold typography */}
 {(pagina.dados_casal.cidadePrimeiroEncontro || pagina.dados_casal.comeFavorita || pagina.dados_casal.filmeFavorito) && (
 <Secao delay={0.3} className="mt-20 text-center max-w-lg mx-auto">
   <p className="text-[10px] uppercase tracking-[0.3em] mb-6" style={{ color: cor }}>A linguagem do amor</p>
   <div className="space-y-4">
     {pagina.dados_casal.cidadePrimeiroEncontro && (
       <div>
         <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Onde tudo comecou</p>
         <p className="text-3xl sm:text-4xl font-black" style={{ fontFamily: fontes.titulo }}>{pagina.dados_casal.cidadePrimeiroEncontro}</p>
       </div>
     )}
     {pagina.dados_casal.comeFavorita && pagina.dados_casal.filmeFavorito ? (
       <p className="text-3xl sm:text-5xl font-black leading-tight" style={{ fontFamily: fontes.titulo }}>
         <span>{pagina.dados_casal.comeFavorita}</span>
         <span className="mx-2 text-lg font-normal" style={{ color: 'rgba(255,255,255,0.2)' }}>&</span>
         <span>{pagina.dados_casal.filmeFavorito}</span>
       </p>
     ) : (
       <>
         {pagina.dados_casal.comeFavorita && (
           <p className="text-3xl sm:text-5xl font-black" style={{ fontFamily: fontes.titulo }}>{pagina.dados_casal.comeFavorita}</p>
         )}
         {pagina.dados_casal.filmeFavorito && (
           <p className="text-3xl sm:text-5xl font-black" style={{ fontFamily: fontes.titulo }}>{pagina.dados_casal.filmeFavorito}</p>
         )}
       </>
     )}
   </div>
 </Secao>
 )}`;
  // Find exact end of section
  const sectionClose = c.indexOf('</Secao>', tagsStart);
  const nextNewline = c.indexOf('\n', sectionClose + 8);
  const closeBlock = c.indexOf(')}', nextNewline);
  c = c.slice(0, tagsStart) + newTags + c.slice(closeBlock + 2);
  console.log('4. Tags editorial typography: OK');
}

// ===== 5. SECTION TITLES — bigger =====
// Upgrade all section h2 titles
c = c.replace(/className="text-3xl sm:text-4xl font-black"/g, 'className="text-4xl sm:text-5xl md:text-6xl font-black"');
console.log('5. Section titles upsized: OK');

// ===== 6. TIMELINE — editorial blocks, no line/dots =====
// Remove TimelineLine component usage
c = c.replace(/<div className="lg:left-1\/2 lg:-translate-x-px"><TimelineLine cor=\{cor\} \/><\/div>/g, '');
console.log('6a. Timeline line removed');

// Replace timeline event layout — full width editorial
const timelineEventClass = /className=\{`relative pb-14 sm:pb-20 last:pb-0 flex gap-4 sm:gap-6 pl-16 sm:pl-20 lg:pl-0 \$\{i % 2 === 0.*?`\}/;
if (timelineEventClass.test(c)) {
  c = c.replace(timelineEventClass, 'className="relative pb-16 sm:pb-24 last:pb-0"');
  console.log('6b. Timeline events: editorial blocks');
}

// Remove the horizontal connector line
c = c.replace(/\s*<motion\.div\s*initial=\{\{ scaleX: 0 \}\}\s*whileInView=\{\{ scaleX: 1 \}\}\s*viewport=\{\{ once: true \}\}\s*transition=\{\{ duration: 0\.4, delay: 0\.2 \}\}\s*className="absolute left-6 sm:left-7 top-6 h-px w-8 sm:w-12 origin-left"\s*style=\{\{ background: `linear-gradient\(to right, \$\{cor\}80, transparent\)` \}\}\s*\/>/g, '');
console.log('6c. Connector lines removed');

// Replace the dot node with just a subtle date marker
const dotNode = /\s*<motion\.div\s*initial=\{\{ scale: 0, rotate: -180 \}\}[\s\S]*?<div className="w-3 h-3 rounded-full bg-white" \/>\s*<\/motion\.div>/;
if (dotNode.test(c)) {
  c = c.replace(dotNode, '');
  console.log('6d. Dot nodes removed');
}

// Make timeline images full width
c = c.replace(
  'className="rounded-2xl overflow-hidden shadow-2xl"',
  'className="rounded-xl overflow-hidden"'
);
c = c.replace(
  "style={{ boxShadow: `0 20px 60px ${cor}20` }}",
  ''
);
// Timeline image: full width
c = c.replace(
  'className="w-full aspect-video object-cover"',
  'className="w-full aspect-video object-cover rounded-xl"'
);
console.log('6e. Timeline images clean');

// Timeline title bigger
c = c.replace(
  'className="text-xl sm:text-2xl font-black mb-3 leading-tight break-words"',
  'className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 leading-tight break-words" style={{ fontFamily: fontes.titulo }}'
);
console.log('6f. Timeline titles upsized');

// ===== 7. COMO SE CONHECERAM — remove quote boxes =====
c = c.replace(
  "className=\"text-base sm:text-xl text-gray-300 leading-relaxed italic break-words px-2\"",
  "className=\"text-xl sm:text-2xl md:text-3xl text-white/70 leading-relaxed italic break-words\" style={{ fontFamily: fontes.titulo }}"
);
console.log('7. Como se conheceram: bigger text');

// ===== 8. MENSAGEM — clean up =====
// Remove the decorative quote marks (they're emoji-ish)
c = c.replace(/\s*<div className="text-5xl sm:text-7xl md:text-8xl font-serif leading-none mb-4 sm:mb-6 select-none"[^>]*>"<\/div>/g, '');
c = c.replace(/\s*<div className="text-5xl sm:text-7xl md:text-8xl font-serif leading-none mb-6 sm:mb-8 select-none text-right"[^>]*>"<\/div>/g, '');
console.log('8. Decorative quotes removed');

// ===== 9. GUESTBOOK — remove card backgrounds =====
c = c.replace(
  /className="rounded-2xl p-6 mb-8" style=\{\{ background: 'rgba\(255,255,255,0\.04\)', backdropFilter: 'blur\(12px\)', border: '1px solid rgba\(255,255,255,0\.08\)' \}\}/,
  'className="rounded-2xl p-6 mb-8" style={{ borderBottom: \'1px solid rgba(255,255,255,0.06)\' }}'
);
c = c.replace(
  /className="rounded-2xl p-5 backdrop-blur-sm relative"\s*style=\{\{\s*background: msg\.aprovado === false \? 'rgba\(245,158,11,0\.06\)' : 'rgba\(255,255,255,0\.04\)',\s*border: msg\.aprovado === false \? '1px solid rgba\(245,158,11,0\.25\)' : '1px solid rgba\(255,255,255,0\.08\)',\s*\}\}/,
  'className="rounded-2xl p-5 relative" style={{ borderBottom: \'1px solid rgba(255,255,255,0.05)\' }}'
);
console.log('9. Guestbook cards: borderless');

// ===== 10. REMOVE PARTICLES =====
const particlesGlobal = /\{\/\* Part..culas decorativas globais \*\/\}[\s\S]*?<\/div>\n/;
c = c.replace(particlesGlobal, '');
// Also remove particles in mensagem section
const msgParticles = /\{\/\* Part..culas de fundo \*\/\}[\s\S]*?\)\)\}\s*<\/div>/;
c = c.replace(msgParticles, '');
console.log('10. Particles removed');

// ===== 11. PALETTE BACKGROUNDS — darken =====
c = c.replace(/fundo: '#12000a'/g, "fundo: '#050003'");
c = c.replace(/fundo: '#0d0020'/g, "fundo: '#050010'");
c = c.replace(/fundo: '#1a1000'/g, "fundo: '#0a0800'");
c = c.replace(/fundo: '#000d1a'/g, "fundo: '#00050a'");
c = c.replace(/fundo: '#001a0d'/g, "fundo: '#000a05'");
c = c.replace(/fundo: '#1a0008'/g, "fundo: '#0a0003'");
console.log('11. Palette backgrounds darkened');

// ===== 12. GLOW ORBS — remove entirely =====
const glowSection = /\{\/\* Glow orbs animados \*\/\}[\s\S]*?<\/div>\n/;
c = c.replace(glowSection, '');
console.log('12. Glow orbs removed');

// ===== 13. BUCKET LIST — remove card borders =====
c = c.replace(
  /className="flex items-center gap-3 px-5 py-4 rounded-2xl text-left transition-all"/,
  'className="flex items-center gap-3 px-4 py-3 text-left transition-all"'
);
c = c.replace(
  /background: item\.feito \? `\$\{cor\}15` : 'rgba\(255,255,255,0\.03\)',\s*border: `1px solid \$\{item\.feito \? cor \+ '40' : 'rgba\(255,255,255,0\.08\)'\}`,/,
  "background: 'transparent',"
);
console.log('13. Bucket list: clean');

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('\n=== BOLD MINIMALISM PIVOT COMPLETE ===');
console.log('File size:', Math.round(c.length / 1024) + 'KB');
