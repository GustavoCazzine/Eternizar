const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');
const lines = c.split('\n');

// Find the photo section
let photoStart = -1, photoEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Nossos momentos')) photoStart = i - 3;
  if (photoStart !== -1 && photoEnd === -1 && lines[i].includes('storiesAberto &&')) {
    photoEnd = i;
    break;
  }
}

if (photoStart !== -1 && photoEnd !== -1) {
  console.log('Photo section:', photoStart+1, '-', photoEnd+1);
  
  const newSection = [
    '   {/* ===== FOTOS STORIES ===== */}',
    '   {fotosNormalizadas.length > 0 && (',
    '     <section className="py-16 sm:py-20 overflow-hidden">',
    '       <Secao className="max-w-4xl mx-auto px-6">',
    '         <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-8 sm:mb-10 text-center" style={{ color: cor }}>',
    '           Nossos momentos',
    '         </p>',
    '       </Secao>',
    '',
    '       <div className="flex gap-3 sm:gap-4 overflow-x-auto px-6 pb-4 snap-x snap-mandatory" style={{ scrollbarWidth: \'none\' }}>',
    '         {fotosNormalizadas.map((foto, i) => (',
    '           <motion.button key={i}',
    '             onClick={() => { setStoryInicial(i); setStoriesAberto(true) }}',
    '             initial={{ opacity: 0, scale: 0.9 }}',
    '             whileInView={{ opacity: 1, scale: 1 }}',
    '             viewport={{ once: true }}',
    '             transition={{ delay: i * 0.08 }}',
    '             className="relative shrink-0 snap-center group"',
    '             style={{ width: \'min(180px, 38vw)\', aspectRatio: \'9/16\' }}>',
    '             <div className="w-full h-full rounded-xl sm:rounded-2xl overflow-hidden"',
    '               style={{ border: `2px solid ${cor}40`, padding: 2 }}>',
    '               <div className="w-full h-full rounded-[10px] sm:rounded-xl overflow-hidden relative">',
    '                 {/* eslint-disable-next-line @next/next/no-img-element */}',
    '                 <img src={foto.url} alt={foto.legenda || `Foto ${i + 1}`}',
    '                   className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />',
    '                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />',
    '                 {foto.legenda && (',
    '                   <p className="absolute bottom-2 left-2 right-2 text-[9px] sm:text-[10px] text-white/80 truncate">',
    '                     {foto.legenda}',
    '                   </p>',
    '                 )}',
    '               </div>',
    '             </div>',
    '           </motion.button>',
    '         ))}',
    '       </div>',
    '     </section>',
    '   )}',
    '',
  ];
  
  lines.splice(photoStart, photoEnd - photoStart, ...newSection);
  console.log('Stories scroll: REPLACED');
} else {
  console.log('Photo section NOT FOUND:', photoStart, photoEnd);
}

c = lines.join('\n');
fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
