const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// ===== 1. HERO — stronger vignette + fullscreen =====
// Already min-h-screen, add vignette effect
c = c.replace(
  "className=\"absolute inset-0 z-10\"\n            style={{ background: `linear-gradient(to bottom,",
  "className=\"absolute inset-0 z-10\"\n            style={{ background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%), linear-gradient(to bottom,"
);
console.log('1. Hero vignette: enhanced');

// ===== 2. TIMELINE ZIGZAG on desktop =====
// Find timeline items and add alternating left/right
const timelineItem = 'className="flex gap-4 sm:gap-6 pl-16 sm:pl-20 relative pb-14 sm:pb-20 last:pb-0"';
if (c.includes(timelineItem)) {
  // Replace with zigzag layout
  c = c.replace(
    timelineItem,
    'className={`relative pb-14 sm:pb-20 last:pb-0 flex gap-4 sm:gap-6 pl-16 sm:pl-20 lg:pl-0 ${i % 2 === 0 ? "lg:flex-row lg:pr-[calc(50%+2rem)] lg:pl-8 lg:text-right" : "lg:flex-row-reverse lg:pl-[calc(50%+2rem)] lg:pr-8"}`}'
  );
  console.log('2. Timeline zigzag: OK');
}

// Move the timeline line to center on desktop
const timelineLine = '<TimelineLine cor={cor} />';
if (c.includes(timelineLine)) {
  c = c.replace(
    timelineLine,
    '<div className="lg:left-1/2 lg:-translate-x-px"><TimelineLine cor={cor} /></div>'
  );
  console.log('2b. Timeline line centered on desktop: OK');
}

// Move the dot to center on desktop too
const dotAbsolute = 'className="absolute left-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0"';
if (c.includes(dotAbsolute)) {
  c = c.replace(
    dotAbsolute,
    'className={`absolute w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 left-0 ${i % 2 === 0 ? "lg:left-auto lg:right-[-1.5rem] lg:translate-x-1/2" : "lg:left-[-1.5rem] lg:-translate-x-1/2"}`}'
  );
  console.log('2c. Timeline dots zigzag: OK');
}

// ===== 3. PLAYER — immersive dark section =====
// Find player section and make it darker/more immersive
c = c.replace(
  "style={{ background: `linear-gradient(180deg, #08080c 0%, ${paleta.fundo} 50%, #08080c 100%)` }}>\n        <Secao className=\"text-center mb-12\">\n",
  "style={{ background: '#000000' }}>\n        {/* Immersive dark section */}\n        <div className=\"max-w-2xl mx-auto px-4\">\n        <Secao className=\"text-center mb-12\">\n"
);
console.log('3. Player immersive black bg: OK');

// ===== 4. STORIES — move closer, tighter spacing =====
c = c.replace(
  '{/* ===== SLIDE 3',
  '{/* ===== STORIES — NOSSOS MOMENTOS ====='
);
// Reduce story section padding
c = c.replace(
  /(<section className="py-24 px-4">\s*<Secao className="text-center mb-10">\s*<p[^>]*>Mem..rias que ficam)/,
  '<section className="py-12 sm:py-16 px-4">\n          <Secao className="text-center mb-8">\n            <p'
);
console.log('4. Stories spacing: tighter');

// ===== 5. FOOTER — "A história continua..." =====
const oldFooter = c.indexOf('{/* Rodap');
if (oldFooter !== -1) {
  const footerEnd = c.indexOf('</div>', c.indexOf('py-8 text-center', oldFooter));
  const footerClose = c.indexOf('\n', footerEnd + 6);
  const oldFooterBlock = c.slice(oldFooter, footerClose);
  
  const newFooter = `{/* Rodap\u00e9 */}
        <footer className="py-20 text-center border-t border-white/5">
          <p className="text-2xl sm:text-3xl font-light text-white/30 italic" style={{ fontFamily: fontes.titulo }}>
            A hist\u00f3ria continua...
          </p>
          <a href="/criar" className="inline-block mt-6 px-6 py-3 rounded-xl text-sm font-medium transition border border-white/10 hover:border-white/25 text-zinc-500 hover:text-white">
            Criar sua homenagem
          </a>
          <p className="text-xs text-zinc-700 mt-8">eternizar</p>
        </footer>`;
  
  c = c.replace(oldFooterBlock, newFooter);
  console.log('5. Footer "A hist\u00f3ria continua": OK');
}

// ===== 6. REMOVE "ENCERRAMENTO" section (redundant with footer) =====
const encerrStart = c.indexOf('{/* ===== ENCERRAMENTO =====');
if (encerrStart !== -1) {
  const encerrSectionEnd = c.indexOf('</section>', encerrStart);
  const encerrEnd = c.indexOf('\n', encerrSectionEnd + 10);
  c = c.slice(0, encerrStart) + c.slice(encerrEnd);
  console.log('6. Encerramento section: removed (merged into footer)');
}

// ===== 7. MENSAGEM section — remove floating particles (perf) =====
const partStart = c.indexOf('{/* Part\u00edculas de fundo */}', c.indexOf('SLIDE 5'));
if (partStart !== -1) {
  const partEnd = c.indexOf('})}', partStart);
  if (partEnd !== -1 && partEnd - partStart < 800) {
    c = c.slice(0, partStart) + c.slice(partEnd + 3);
    console.log('7. Mensagem particles: removed');
  }
}

// ===== 8. IMAGE HOVER EFFECT on timeline photos =====
// Add hover zoom effect to timeline images
c = c.replace(
  'className="aspect-video object-cover rounded-2xl',
  'className="aspect-video object-cover rounded-2xl transition-transform duration-500 hover:scale-105'
);
console.log('8. Timeline image hover zoom: OK');

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('\nLayout redesign applied.');
