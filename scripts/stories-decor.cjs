const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// ===== 1. FIX STORIES VIEWER PROPS =====
c = c.replace(
  '<StoriesViewer fotos={fotosNormalizadas} startIndex={storyInicial} onClose={() => setStoriesAberto(false)} cor={cor} />',
  '<StoriesViewer fotos={fotosNormalizadas} indiceInicial={storyInicial} aberto={storiesAberto} onFechar={() => setStoriesAberto(false)} cor={cor} />'
);
console.log('1. StoriesViewer props:', c.includes('aberto={storiesAberto}') ? 'OK' : 'FAIL');

// ===== 2. REPLACE PHOTO GRID WITH STORIES SCROLL =====
const oldPhotos = /<section className="min-h-\[80dvh\] flex items-center justify-center px-6 py-20">\s*<Secao className="w-full max-w-4xl">[\s\S]*?<\/Secao>\s*<\/section>\s*\n\s*\{storiesAberto/;

if (oldPhotos.test(c)) {
  c = c.replace(oldPhotos, `<section className="py-16 sm:py-20 overflow-hidden">
       <Secao className="max-w-4xl mx-auto px-6">
         <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-8 sm:mb-10 text-center" style={{ color: cor }}>
           Nossos momentos
         </p>
       </Secao>

       {/* Stories horizontal scroll */}
       <div className="flex gap-3 sm:gap-4 overflow-x-auto px-6 pb-4 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
         <style>{\`.stories-scroll::-webkit-scrollbar{display:none}\`}</style>
         {fotosNormalizadas.map((foto, i) => (
           <motion.button key={i}
             onClick={() => { setStoryInicial(i); setStoriesAberto(true) }}
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ delay: i * 0.08 }}
             className="relative shrink-0 snap-center group"
             style={{ width: 'min(200px, 40vw)', aspectRatio: '9/16' }}>
             <div className="w-full h-full rounded-xl sm:rounded-2xl overflow-hidden"
               style={{ border: \`2px solid \${cor}40\`, padding: 2 }}>
               <div className="w-full h-full rounded-[10px] sm:rounded-xl overflow-hidden relative">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img src={foto.url} alt={foto.legenda || \`Foto \${i + 1}\`}
                   className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                 {foto.legenda && (
                   <p className="absolute bottom-2 left-2 right-2 text-[9px] sm:text-[10px] text-white/80 truncate">
                     {foto.legenda}
                   </p>
                 )}
               </div>
             </div>
           </motion.button>
         ))}
       </div>
     </section>

   {storiesAberto`);
  console.log('2. Stories scroll: OK');
} else {
  console.log('2. Stories: regex not matched');
}

// ===== 3. ADD DECORATIVE ELEMENTS =====
// Add decorative SVGs to Hero, Counter, Message, and Footer sections

// Hero: add floating circles
c = c.replace(
  '{/* ===== HERO ===== */}',
  `{/* Decorative floating elements */}
   <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
     <svg className="absolute top-[15%] right-[5%] w-32 h-32 sm:w-48 sm:h-48 opacity-[0.03]" viewBox="0 0 100 100">
       <circle cx="50" cy="50" r="45" stroke="white" strokeWidth="0.5" fill="none" />
       <circle cx="50" cy="50" r="30" stroke="white" strokeWidth="0.3" fill="none" />
     </svg>
     <svg className="absolute bottom-[20%] left-[3%] w-24 h-24 sm:w-40 sm:h-40 opacity-[0.025]" viewBox="0 0 100 100">
       <circle cx="50" cy="50" r="48" stroke="white" strokeWidth="0.5" fill="none" />
     </svg>
   </div>

   {/* ===== HERO ===== */}`
);

// Counter section: add subtle line decoration
c = c.replace(
  '{/* ===== COUNTER ===== */}',
  `{/* ===== COUNTER ===== */}`
);

// Before Message section: add SVG wave separator
c = c.replace(
  '{/* ===== MENSAGEM ===== */}',
  `{/* Decorative wave separator */}
   <div className="max-w-xs mx-auto opacity-[0.06] my-4">
     <svg viewBox="0 0 200 20" fill="none" className="w-full">
       <path d="M0,10 Q25,0 50,10 T100,10 T150,10 T200,10" stroke="white" strokeWidth="0.5" />
     </svg>
   </div>

   {/* ===== MENSAGEM ===== */}`
);

// Timeline: add dot connector decoration
c = c.replace(
  "className=\"text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-12 sm:mb-16 text-center\" style={{ color: cor }}>Nossa timeline</p>",
  `className="text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-6 text-center" style={{ color: cor }}>Nossa timeline</p>
         <div className="flex items-center justify-center gap-2 mb-12 sm:mb-16">
           <div className="w-1.5 h-1.5 rounded-full" style={{ background: cor, opacity: 0.4 }} />
           <div className="w-8 h-px" style={{ background: \`\${cor}30\` }} />
           <div className="w-2 h-2 rounded-full" style={{ background: cor, opacity: 0.6 }} />
           <div className="w-8 h-px" style={{ background: \`\${cor}30\` }} />
           <div className="w-1.5 h-1.5 rounded-full" style={{ background: cor, opacity: 0.4 }} />
         </div>`
);

// Footer: add decorative constellation
c = c.replace(
  "A historia continua...</p>",
  `A historia continua...</p>
       <svg className="w-20 h-20 mx-auto mt-6 mb-4 opacity-[0.06]" viewBox="0 0 80 80" fill="none">
         <circle cx="20" cy="20" r="1.5" fill="white" />
         <circle cx="55" cy="15" r="1" fill="white" />
         <circle cx="40" cy="45" r="1.5" fill="white" />
         <circle cx="65" cy="55" r="1" fill="white" />
         <circle cx="25" cy="60" r="1.5" fill="white" />
         <line x1="20" y1="20" x2="55" y2="15" stroke="white" strokeWidth="0.3" />
         <line x1="55" y1="15" x2="40" y2="45" stroke="white" strokeWidth="0.3" />
         <line x1="40" y1="45" x2="65" y2="55" stroke="white" strokeWidth="0.3" />
         <line x1="40" y1="45" x2="25" y2="60" stroke="white" strokeWidth="0.3" />
         <line x1="20" y1="20" x2="40" y2="45" stroke="white" strokeWidth="0.3" />
       </svg>`
);

console.log('3. Decorative elements: OK');

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('Done');
