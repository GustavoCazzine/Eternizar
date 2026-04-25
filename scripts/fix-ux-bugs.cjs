const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// ===== 1. CARTA SELADA — fix layout shift =====
// Find CartaSelada component and add min-height to prevent shift
const cartaReturn = c.indexOf("className=\"max-w-lg mx-auto rounded-3xl p-8 border\"");
if (cartaReturn !== -1) {
  c = c.replace(
    'className="max-w-lg mx-auto rounded-3xl p-8 border"',
    'className="max-w-lg mx-auto rounded-3xl p-8 border min-h-[200px]"'
  );
  console.log('1. CartaSelada min-height: OK');
}

// Also fix the mensagem section itself — reserve space
const msgSection = c.indexOf('{/* ===== SLIDE 5');
if (msgSection !== -1) {
  // The mensagem text container needs min-height
  c = c.replace(
    'className="text-center max-w-2xl mx-auto relative z-10"',
    'className="text-center max-w-2xl mx-auto relative z-10 min-h-[280px] flex flex-col items-center justify-center"'
  );
  console.log('1b. Mensagem section min-height: OK');
}

// ===== 2. MAPA FALLBACK — elegant placeholder =====
let mapa = fs.readFileSync('src/components/MapaAmor.tsx', 'utf8');
mapa = mapa.replace(
  `{!hasCoords && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 mx-auto mb-2" style={{ color: cor, opacity: 0.4 }} />
                  <p className="text-sm text-zinc-600">Carregando mapa...</p>
                </div>
              </div>
            )}`,
  `{!hasCoords && (
              <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
                {/* Abstract map placeholder */}
                <div className="absolute inset-0" style={{
                  background: 'radial-gradient(circle at 30% 40%, rgba(155,27,48,0.08) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(155,27,48,0.05) 0%, transparent 40%)',
                }} />
                <div className="absolute inset-0" style={{
                  backgroundImage: \`linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)\`,
                  backgroundSize: '40px 40px',
                }} />
                <div className="absolute inset-0 backdrop-blur-sm" />
                <div className="text-center relative z-10">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    <MapPin className="w-10 h-10 mx-auto mb-3" style={{ color: cor, opacity: 0.5 }} />
                  </motion.div>
                  <p className="text-sm text-zinc-500 font-medium">Carregando mapa...</p>
                  <p className="text-xs text-zinc-700 mt-1">Localizando seus momentos</p>
                </div>
              </div>
            )}`
);
fs.writeFileSync('src/components/MapaAmor.tsx', mapa, 'utf8');
console.log('2. Mapa fallback premium: OK');

// ===== 3. CURIOSIDADES — Lucide icons + grid 2 cols =====
// Find the tags/cards section
const cardsSection = c.indexOf("Cards de dados do casal");
if (cardsSection !== -1) {
  // Replace emoji dots with Lucide icon names
  c = c.replace(
    "{ emoji: '\u25CF', label: 'Onde tudo come\u00e7ou', valor: pagina.dados_casal.cidadePrimeiroEncontro },",
    "{ icon: 'MapPin', label: 'Onde tudo come\u00e7ou', valor: pagina.dados_casal.cidadePrimeiroEncontro },"
  );
  c = c.replace(
    "{ emoji: '\u2022', label: 'Comida favorita', valor: pagina.dados_casal.comeFavorita },",
    "{ icon: 'Utensils', label: 'Comida favorita', valor: pagina.dados_casal.comeFavorita },"
  );
  c = c.replace(
    "{ emoji: '\u2022', label: 'Filme favorito', valor: pagina.dados_casal.filmeFavorito },",
    "{ icon: 'Film', label: 'Filme favorito', valor: pagina.dados_casal.filmeFavorito },"
  );
  console.log('3a. Icons mapped: OK');

  // Add Utensils and Film to imports
  if (!c.includes('Utensils')) {
    c = c.replace(
      "import { Heart, Calendar, ArrowDown, Play, Pause, Volume2, Images, MessageCircle, Send } from 'lucide-react'",
      "import { Heart, Calendar, ArrowDown, Play, Pause, Volume2, Images, MessageCircle, Send, MapPin as MapPinIcon, Utensils, Film } from 'lucide-react'"
    );
    console.log('3b. Lucide imports: OK');
  }

  // Replace the rendering of emoji with Lucide icons
  // Find the map((item) render block
  const emojiRender = c.indexOf("{item.emoji}");
  if (emojiRender !== -1) {
    // Find the parent container and replace
    const blockStart = c.lastIndexOf('<div key=', emojiRender);
    const blockEnd = c.indexOf('</div>\n', c.indexOf('</div>', c.indexOf('</div>', emojiRender) + 6) + 6);
    
    // Instead of complex block replacement, just replace emoji rendering
    c = c.replace(
      '{item.emoji}',
      '{item.icon === "MapPin" ? <MapPinIcon className="w-4 h-4" style={{ color: cor }} /> : item.icon === "Utensils" ? <Utensils className="w-4 h-4" style={{ color: cor }} /> : item.icon === "Film" ? <Film className="w-4 h-4" style={{ color: cor }} /> : <Heart className="w-4 h-4" style={{ color: cor }} />}'
    );
    console.log('3c. Icon rendering: OK');
  }

  // Change layout to grid 2 cols on mobile
  c = c.replace(
    'className="grid grid-cols-1 gap-3"',
    'className="grid grid-cols-2 gap-3"'
  );
  // Try alternate pattern
  const gridSearch = c.indexOf('cidadePrimeiroEncontro || pagina.dados_casal.comeFavorita');
  if (gridSearch !== -1) {
    // Find the container div after the filter
    const containerAfter = c.indexOf('className="', gridSearch + 100);
    if (containerAfter !== -1) {
      const classEnd = c.indexOf('"', containerAfter + 11);
      const oldClass = c.slice(containerAfter + 11, classEnd);
      if (oldClass.includes('space-y') || oldClass.includes('grid-cols-1') || oldClass.includes('flex flex-col')) {
        c = c.slice(0, containerAfter + 11) + 'grid grid-cols-2 gap-3' + c.slice(classEnd);
        console.log('3d. Grid 2 cols: OK');
      } else {
        console.log('3d. Grid container class:', oldClass.slice(0, 60));
      }
    }
  }
}

// ===== 4. SPACING — player + tags breathing room =====
// Player already has mt-10, increase to mt-12
c = c.replace(
  '{pagina.musica_dados && <Secao delay={0.3} className="mt-10">',
  '{pagina.musica_dados && <Secao delay={0.3} className="mt-14">'
);
console.log('4a. Player spacing mt-14: OK');

// Tags section spacing
c = c.replace(
  '<Secao delay={0.3} className="mt-16 max-w-sm mx-auto">',
  '<Secao delay={0.3} className="mt-20 max-w-sm mx-auto">'
);
console.log('4b. Tags spacing mt-20: OK');

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('\nAll 4 fixes applied.');
