const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// ========== 1. TIMELINE VIVA — scroll-driven line ==========
// Replace the static scaleY animation with a scroll-progress driven one
// Add a TimelineViva wrapper component
if (!c.includes('function TimelineLine')) {
  const secaoIdx = c.indexOf('function Secao');
  const secaoEnd = c.indexOf('\n}\n', secaoIdx) + 3;
  
  const timelineLine = `
// Linha da timeline que preenche com scroll
function TimelineLine({ cor }: { cor: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start center', 'end center'] })
  const scaleY = useSpring(scrollYProgress, { stiffness: 60, damping: 20 })
  return (
    <div ref={ref} className="absolute left-7 top-0 bottom-0 w-0.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <motion.div className="w-full origin-top" style={{ scaleY, height: '100%', background: \`linear-gradient(to bottom, \${cor}, \${cor}80)\` }} />
    </div>
  )
}
`;
  c = c.slice(0, secaoEnd) + timelineLine + c.slice(secaoEnd);
  console.log('OK: TimelineLine component added');
}

// Replace old timeline line with new component
const oldTimeline = `<motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="absolute left-7 top-0 bottom-0 w-0.5 origin-top"
              style={{ background: \`linear-gradient(to bottom, transparent, \${cor}80 10%, \${cor}80 90%, transparent)\` }}
            />`;

if (c.includes(oldTimeline)) {
  c = c.replace(oldTimeline, '<TimelineLine cor={cor} />');
  console.log('OK: Timeline line replaced with scroll-driven');
} else {
  // Try simpler match
  const simpleMatch = 'className="absolute left-7 top-0 bottom-0 w-0.5 origin-top"';
  if (c.includes(simpleMatch)) {
    // Find the full motion.div block
    const mIdx = c.lastIndexOf('<motion.div', c.indexOf(simpleMatch));
    const mEnd = c.indexOf('/>', mIdx) + 2;
    c = c.slice(0, mIdx) + '<TimelineLine cor={cor} />' + c.slice(mEnd);
    console.log('OK: Timeline line replaced (simple match)');
  } else {
    console.log('SKIP: Timeline line not found');
  }
}

// ========== 2. GLINT FORMATURA ==========
// Add glint-effect to the formatura course title
const cursoTitle = '<h2 className="text-3xl sm:text-4xl font-black">{pagina.dados_formatura.curso}</h2>';
if (c.includes(cursoTitle)) {
  c = c.replace(cursoTitle, '<h2 className="text-3xl sm:text-4xl font-black glint-effect">{pagina.dados_formatura.curso}</h2>');
  console.log('OK: Glint applied to formatura curso');
}

// Also add to nomeTurma if exists
const turmaLine = '{pagina.dados_formatura.nomeTurma}';
if (c.includes(turmaLine)) {
  // Find parent p tag and add glint
  const tIdx = c.indexOf(turmaLine);
  const pTag = c.lastIndexOf('<p ', tIdx);
  if (pTag !== -1 && tIdx - pTag < 200) {
    const classAttr = c.indexOf('className="', pTag);
    if (classAttr !== -1 && classAttr < tIdx) {
      c = c.slice(0, classAttr + 11) + 'glint-effect ' + c.slice(classAttr + 11);
      console.log('OK: Glint applied to turma name');
    }
  }
}

// ========== 3. MASONRY GUESTBOOK ==========
// Change guestbook messages layout from list to masonry with stagger
const guestListOld = '<div className="max-w-lg mx-auto">';
const guestSection = c.indexOf('Livro de Visitas');
if (guestSection !== -1) {
  // Find the messages rendering area - look for the map of messages
  const msgMap = c.indexOf('.map((msg', guestSection);
  if (msgMap !== -1) {
    // Find the container div before the map
    const containerDiv = c.lastIndexOf('<div className="', msgMap);
    const containerEnd = c.indexOf('>', containerDiv);
    const oldContainer = c.slice(containerDiv, containerEnd + 1);
    console.log('Guestbook container:', oldContainer.slice(0, 100));
    
    // Find if it's a simple div wrapper - add masonry styles
    if (oldContainer.includes('space-y-') || oldContainer.includes('flex-col')) {
      c = c.replace(oldContainer, oldContainer.replace('space-y-', 'columns-1 sm:columns-2 gap-').replace('flex-col', 'columns-1 sm:columns-2'));
      console.log('OK: Masonry layout applied to guestbook');
    } else {
      // Add masonry to the messages wrapper
      // Find the div that contains the message cards
      const afterMap = c.slice(msgMap, msgMap + 500);
      console.log('Messages area:', afterMap.slice(0, 200));
    }
  }
}

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');

// Verify
console.log('\n--- Verify ---');
console.log('TimelineLine:', c.includes('function TimelineLine') ? 'OK' : 'MISS');
console.log('TimelineLine used:', c.includes('<TimelineLine') ? 'OK' : 'MISS');
console.log('Glint curso:', c.includes('glint-effect">{pagina.dados_formatura.curso}') ? 'OK' : 'MISS');
