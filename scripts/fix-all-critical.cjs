const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// ========================================
// FIX 1: SCROLL LOCK — clean single effect
// ========================================

// Remove ALL existing scroll lock effects
c = c.replace(/\s*useEffect\(\(\) => \{\s*if \(introVisivel\) document\.body\.style\.overflow = 'hidden'\s*else document\.body\.style\.overflow = ''\s*return \(\) => \{ document\.body\.style\.overflow = '' \}\s*\}, \[introVisivel\]\)\s*/g, '\n\n  ');

// Also try the multi-line variant
c = c.replace(/\s*useEffect\(\(\) => \{\s*if \(introVisivel\) \{\s*document\.body\.style\.overflow = 'hidden'\s*\} else \{\s*document\.body\.style\.overflow = ''\s*\}\s*return \(\) => \{ document\.body\.style\.overflow = '' \}\s*\}, \[introVisivel\]\)\s*/g, '\n\n  ');

// Count remaining
let remaining = (c.match(/introVisivel.*overflow/g) || []).length;
console.log('1a. After cleanup, remaining scroll refs:', remaining);

// Insert ONE clean scroll lock before the guestbook effect
const gbFetch = c.indexOf("fetch(`/api/guestbook");
const gbEffect = c.lastIndexOf('useEffect(', gbFetch);
c = c.slice(0, gbEffect) + `useEffect(() => {
    document.body.style.overflow = introVisivel ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [introVisivel])

  ` + c.slice(gbEffect);
console.log('1b. Clean scroll lock: ADDED');

// ========================================
// FIX 2: INTRO WRAPPED RENDER — ensure it's in JSX
// ========================================
if (!c.includes('<IntroWrapped')) {
  // Add before <div ref={containerRef}
  const mainReturn = c.indexOf('return (\n', c.indexOf('export default function'));
  const afterReturn = c.indexOf('\n', mainReturn);
  c = c.slice(0, afterReturn) + `
      {/* Cortina de abertura */}
      {introVisivel && pagina.tipo === 'casal' && (
        <IntroWrapped
          fotoCapa={fotoCapa}
          titulo={pagina.titulo}
          cor={cor}
          fontes={fontes}
          onEntrar={() => setIntroVisivel(false)}
        />
      )}
` + c.slice(afterReturn);
  console.log('2. IntroWrapped render: ADDED');
} else {
  console.log('2. IntroWrapped render: EXISTS');
}

// ========================================
// FIX 3: MAPA — dynamic import with ssr:false
// ========================================
// Replace static import with dynamic
c = c.replace(
  "import MapaAmor from '@/components/MapaAmor'",
  "import dynamic from 'next/dynamic'\nconst MapaAmor = dynamic(() => import('@/components/MapaAmor'), { ssr: false, loading: () => <div className=\"h-[400px] rounded-2xl\" style={{ background: 'radial-gradient(circle, rgba(155,27,48,0.05), #1a1a2e)' }} /> })"
);
console.log('3. MapaAmor dynamic import ssr:false: OK');

// ========================================
// FIX 4: TAGS — pill format
// ========================================
// Replace the tag card design with pills
c = c.replace(
  'className="flex items-center gap-4 p-4 rounded-2xl backdrop-blur-sm"',
  'className="flex items-center gap-3 px-5 py-3 rounded-full backdrop-blur-sm"'
);
c = c.replace(
  "background: `linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))`,\n                  border: `1px solid rgba(255,255,255,0.1)`,",
  "background: 'rgba(255,255,255,0.03)',\n                  backdropFilter: 'blur(5px)',\n                  border: '1px solid rgba(255,255,255,0.08)',"
);
// Smaller icon box for pills
c = c.replace(
  'className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"',
  'className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"'
);
console.log('4. Tags pills: OK');

// ========================================
// FIX 5: TIMELINE — ensure proper zigzag + images 16:9
// ========================================
// Fix timeline images to be 16:9
c = c.replace(
  'className="w-full object-cover max-h-72"',
  'className="w-full aspect-video object-cover"'
);
console.log('5. Timeline images 16:9: OK');

// ========================================
// FIX 6: REMOVE overflow-x-hidden from main container that might trap scroll
// ========================================
// The main div should NOT have overflow hidden
// Actually overflow-x-hidden is fine, just not overflow-hidden
console.log('6. Main container: overflow-x-hidden (correct, no y lock)');

// ========================================
// FIX 7: Add CuriosidadesMagicas section with weekend math
// ========================================
if (!c.includes('CuriosidadesMagicas')) {
  // Find after stories section end
  const storiesEnd = c.indexOf('</section>', c.indexOf('STORIES'));
  if (storiesEnd !== -1) {
    const afterStories = c.indexOf('\n', storiesEnd + 10);
    c = c.slice(0, afterStories) + `

        {/* ===== DATA STORYTELLING ===== */}
        {pagina.tipo === 'casal' && pagina.dados_casal?.dataInicio && (
          <section className="py-4 border-y border-white/5" style={{ background: '#0e0e0e' }}>
            <CuriosidadesMagicas dataInicio={pagina.dados_casal.dataInicio} cor={cor} fontes={fontes} />
          </section>
        )}
` + c.slice(afterStories);
    console.log('7. CuriosidadesMagicas section: ADDED');
  }
} else {
  console.log('7. CuriosidadesMagicas: EXISTS');
}

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');

// ========================================
// VERIFY
// ========================================
const final = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');
console.log('\n--- VERIFY ---');
console.log('IntroWrapped rendered:', final.includes('<IntroWrapped'));
console.log('Scroll lock count:', (final.match(/overflow.*introVisivel/g) || []).length, '(should be 1)');
console.log('MapaAmor dynamic:', final.includes("dynamic(() => import"));
console.log('Pills rounded-full:', final.includes('rounded-full backdrop-blur'));
console.log('Timeline 16:9:', final.includes('aspect-video object-cover'));
console.log('CuriosidadesMagicas:', final.includes('CuriosidadesMagicas'));
console.log('introVisivel state:', final.includes("const [introVisivel, setIntroVisivel] = useState(true)"));
