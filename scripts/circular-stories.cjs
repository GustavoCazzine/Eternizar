const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// ===== 1. STORIES → CIRCULAR com borda gradiente =====
const storiesSection = c.indexOf('{/* ===== FOTOS STORIES =====');
const storiesEnd = c.indexOf('</section>\n   )}', storiesSection);

if (storiesSection !== -1 && storiesEnd !== -1) {
  const before = c.slice(0, storiesSection);
  const after = c.slice(storiesEnd + 16); // skip </section>\n   )}

  const newStories = `{/* ===== MOMENTOS ===== */}
   {fotosNormalizadas.length > 0 && (
     <section className="py-16 sm:py-20 overflow-hidden">
       <style>{\`
         .story-ring {
           background: conic-gradient(from 0deg, \${cor}, \${cor}80, \${cor});
           padding: 3px;
           border-radius: 9999px;
         }
         .stories-row::-webkit-scrollbar { display: none }
       \`}</style>

       <Secao className="px-6">
         <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-2 text-center" style={{ color: cor }}>
           Momentos que o tempo nao apaga
         </p>
         <p className="text-sm text-center mb-8 sm:mb-10" style={{ color: 'rgba(255,255,255,0.4)' }}>
           Toque para reviver
         </p>
       </Secao>

       <div className="flex gap-5 sm:gap-6 overflow-x-auto px-6 pb-4 stories-row snap-x snap-mandatory justify-start sm:justify-center"
         style={{ scrollbarWidth: 'none' }}>
         {fotosNormalizadas.map((foto, i) => (
           <motion.button key={i}
             onClick={() => { setStoryInicial(i); setStoriesAberto(true) }}
             initial={{ opacity: 0, scale: 0.8 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
             className="flex flex-col items-center gap-2 shrink-0 snap-center">
             {/* Ring + circle photo */}
             <div className="rounded-full p-[3px]"
               style={{ background: \`conic-gradient(from \${i * 60}deg, \${cor}, \${cor}60, \${cor})\` }}>
               <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-black">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img src={foto.url} alt={foto.legenda || \`Foto \${i + 1}\`}
                   className="w-full h-full object-cover" />
               </div>
             </div>
             {foto.legenda && (
               <p className="text-[9px] sm:text-[10px] text-white/40 max-w-[80px] truncate text-center">{foto.legenda}</p>
             )}
           </motion.button>
         ))}
       </div>
     </section>
   )}`;

  c = before + newStories + after;
  console.log('1. Stories circular: OK');
}

// ===== 2. COPY EMOCIONAL — substituir títulos genéricos =====

// Hero: "Uma surpresa especial para voce" → emocional
c = c.replace(
  'Uma surpresa especial para voce',
  'Alguem pensou em cada detalhe por voce'
);

// Counter: "Contando cada segundo"
c = c.replace(
  '>Contando cada segundo<',
  '>O tempo que construimos juntos<'
);

// Como se conheceram: "Como tudo comecou"
c = c.replace(
  '>Como tudo comecou<',
  '>E assim, tudo fez sentido<'
);

// Mapa: "Mapa do amor"
c = c.replace(
  '>Mapa do amor<',
  '>Os lugares que guardam a gente<'
);

// Timeline: "Nossa timeline"
c = c.replace(
  '>Nossa timeline<',
  '>Cada capitulo dessa historia<'
);

// Mensagem: "Uma mensagem do coracao"
c = c.replace(
  '>Uma mensagem do coracao<',
  '>O que eu nunca soube dizer em voz alta<'
);

// Bucket list: "Nossos sonhos juntos"
c = c.replace(
  '>Nossos sonhos juntos<',
  '>O que ainda vamos viver<'
);

// Audio: "Capsula de voz"
c = c.replace(
  '>Capsula de voz<',
  '>Fecha os olhos e escuta<'
);

// Guestbook: "Deixe sua mensagem"
c = c.replace(
  '>Deixe sua mensagem<',
  '>Quem passou por aqui deixou um pedaco de si<'
);

// Footer: "A historia continua..."
c = c.replace(
  '>A historia continua...<',
  '>Enquanto existir nos, existira essa historia.<'
);

console.log('2. Copy emocional: OK');

// ===== 3. TRANSIÇÕES ENTRE SEÇÕES =====
// Add a reusable separator component inline

// Between Counter and Stories
c = c.replace(
  '{/* ===== MOMENTOS ===== */}',
  `{/* Transition: counter → stories */}
   <div className="flex flex-col items-center py-8">
     <motion.div initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }}
       transition={{ duration: 0.8 }} className="w-px h-16 origin-top" style={{ background: \`\${cor}25\` }} />
     <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
       transition={{ delay: 0.4, type: 'spring' }}
       className="w-2 h-2 rounded-full my-2" style={{ background: \`\${cor}50\` }} />
   </div>

   {/* ===== MOMENTOS ===== */}`
);

// Between Stories and Como se conheceram
c = c.replace(
  '{/* ===== COMO SE CONHECERAM ===== */}',
  `{/* Transition */}
   <div className="flex flex-col items-center py-6">
     <motion.div initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }}
       className="w-px h-12 origin-top" style={{ background: \`\${cor}20\` }} />
   </div>

   {/* ===== COMO SE CONHECERAM ===== */}`
);

// Between Tags and Map
c = c.replace(
  '{/* ===== MAPA ===== */}',
  `{/* Transition */}
   <div className="flex items-center justify-center gap-3 py-6 opacity-[0.08]">
     <div className="w-12 h-px bg-white" />
     <svg className="w-4 h-4" viewBox="0 0 16 16" fill="white"><circle cx="8" cy="8" r="2" /></svg>
     <div className="w-12 h-px bg-white" />
   </div>

   {/* ===== MAPA ===== */}`
);

// Between Timeline and Message
c = c.replace(
  '{/* Decorative wave separator */}',
  `{/* Transition: timeline → message */}
   <div className="flex flex-col items-center py-10">
     <motion.div initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }}
       transition={{ duration: 1 }} className="w-px h-20 origin-top" style={{ background: \`\${cor}20\` }} />
     <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
       transition={{ delay: 0.6 }}>
       <Heart className="w-4 h-4 mt-3" style={{ color: \`\${cor}40\` }} />
     </motion.div>
   </div>

   {/* Decorative wave separator */}`
);

// Between Bucket List and Audio / Guestbook
c = c.replace(
  '{/* ===== AUDIO CAPSULE ===== */}',
  `{/* Transition */}
   <div className="flex flex-col items-center py-6">
     <motion.div initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }}
       className="w-px h-10 origin-top" style={{ background: \`\${cor}15\` }} />
   </div>

   {/* ===== AUDIO CAPSULE ===== */}`
);

console.log('3. Transitions: OK');

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('Done');
