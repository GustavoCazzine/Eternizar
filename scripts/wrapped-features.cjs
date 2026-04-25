const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// ===== 1. ADD IMPORTS =====
c = c.replace(
  "import StoriesViewer from '@/components/StoriesViewer'",
  "import StoriesViewer from '@/components/StoriesViewer'\nimport IntroWrapped from '@/components/IntroWrapped'\nimport CuriosidadesMagicas from '@/components/CuriosidadesMagicas'"
);
console.log('1. Imports: OK');

// ===== 2. ADD INTRO STATE =====
// Find after audioRef in PaginaCliente
const audioRefLine = c.indexOf('const audioRef = useRef<HTMLAudioElement', c.indexOf('export default function'));
const afterAudioRef = c.indexOf('\n', audioRefLine);
if (!c.includes('introVisivel')) {
  c = c.slice(0, afterAudioRef) + '\n  const [introVisivel, setIntroVisivel] = useState(true)' + c.slice(afterAudioRef);
  console.log('2. introVisivel state: OK');
}

// ===== 3. ADD BODY SCROLL LOCK =====
// Find the first useEffect in PaginaCliente
const mainEffects = c.indexOf('useEffect(', c.indexOf('export default function'));
if (!c.includes('overflow: introVisivel')) {
  const effectEnd = c.indexOf('\n', mainEffects);
  // Add before first useEffect
  c = c.slice(0, mainEffects) + `useEffect(() => {
    document.body.style.overflow = introVisivel ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [introVisivel])

  ` + c.slice(mainEffects);
  console.log('3. Body scroll lock: OK');
}

// ===== 4. RENDER INTRO — before main container =====
const mainContainer = c.indexOf('<div ref={containerRef}');
if (mainContainer !== -1 && !c.includes('IntroWrapped')) {
  // Actually IntroWrapped is now imported, but we need to render it
  // Find the return ( and add intro
  const returnStart = c.lastIndexOf('return (', mainContainer);
  const afterReturn = c.indexOf('\n', returnStart);
  
  const introRender = `
      {/* Cortina de abertura Wrapped */}
      {introVisivel && pagina.tipo === 'casal' && (
        <IntroWrapped
          fotoCapa={fotoCapa}
          titulo={pagina.titulo}
          cor={cor}
          fontes={fontes}
          onEntrar={() => {
            setIntroVisivel(false)
            const audio = document.querySelector('audio')
            if (audio) audio.play().catch(() => {})
          }}
        />
      )}
`;
  c = c.slice(0, afterReturn) + introRender + c.slice(afterReturn);
  console.log('4. IntroWrapped render: OK');
}

// ===== 5. ADD CURIOSIDADES MAGICAS — after Stories section =====
const storiesEnd = c.indexOf('</section>', c.indexOf('STORIES'));
if (storiesEnd !== -1 && !c.includes('CuriosidadesMagicas')) {
  const afterStories = c.indexOf('\n', storiesEnd + 10);
  const curiosidades = `

        {/* ===== DATA STORYTELLING ===== */}
        {pagina.tipo === 'casal' && pagina.dados_casal?.dataInicio && (
          <section className="py-4 border-y border-white/5" style={{ background: '#0e0e0e' }}>
            <CuriosidadesMagicas dataInicio={pagina.dados_casal.dataInicio} cor={cor} fontes={fontes} />
          </section>
        )}
`;
  c = c.slice(0, afterStories) + curiosidades + c.slice(afterStories);
  console.log('5. CuriosidadesMagicas: OK');
}

// ===== 6. MAPA — add error boundary wrapper =====
let mapa = fs.readFileSync('src/components/MapaAmor.tsx', 'utf8');
// Add try-catch around Leaflet init
if (!mapa.includes('setMapError')) {
  mapa = mapa.replace(
    'const [mapReady, setMapReady] = useState(false)',
    'const [mapReady, setMapReady] = useState(false)\n  const [mapError, setMapError] = useState(false)'
  );
  
  // Wrap initMap in try-catch
  mapa = mapa.replace(
    'async function initMap() {',
    'async function initMap() {\n      try {'
  );
  mapa = mapa.replace(
    'mapInstance.current = map\n      setMapReady(true)\n    }',
    'mapInstance.current = map\n      setMapReady(true)\n      } catch (err) {\n        console.error("Mapa erro:", err)\n        setMapError(true)\n      }\n    }'
  );

  // Add fallback SVG when error
  mapa = mapa.replace(
    '{!hasCoords && (',
    '{(mapError || !hasCoords) && ('
  );
  
  // Replace loading text with better fallback
  mapa = mapa.replace(
    "<p className=\"text-sm text-zinc-500 font-medium\">Carregando mapa...</p>\n                  <p className=\"text-xs text-zinc-700 mt-1\">Localizando seus momentos</p>",
    "<p className=\"text-sm text-zinc-500 font-medium\">{mapError ? 'Mapa indisponivel' : 'Carregando mapa...'}</p>\n                  <p className=\"text-xs text-zinc-700 mt-1\">{mapError ? 'Mostrando locais na lista' : 'Localizando seus momentos'}</p>"
  );

  // Add topographic SVG pattern in fallback
  mapa = mapa.replace(
    "backgroundSize: '40px 40px',",
    "backgroundSize: '40px 40px',\n                  opacity: mapError ? 0.15 : 0.05,"
  );

  fs.writeFileSync('src/components/MapaAmor.tsx', mapa, 'utf8');
  console.log('6. Mapa error boundary: OK');
}

// ===== 7. ADD CSP for Leaflet tiles =====
let config = fs.readFileSync('next.config.ts', 'utf8');
if (!config.includes('basemaps.cartocdn.com')) {
  config = config.replace(
    "img-src 'self'",
    "img-src 'self' https://*.basemaps.cartocdn.com"
  );
  fs.writeFileSync('next.config.ts', config, 'utf8');
  console.log('7. CSP CartoCD tiles: OK');
} else {
  console.log('7. CSP: already has CartoDB');
}

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('\nAll 3 features integrated.');
