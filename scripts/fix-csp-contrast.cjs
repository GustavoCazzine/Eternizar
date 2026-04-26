const fs = require('fs');

// ===== 1. FIX CSP — allow Pixabay audio + Nominatim geocoding + Leaflet CSS =====
let config = fs.readFileSync('next.config.ts', 'utf8');

// media-src: add pixabay
config = config.replace(
  "media-src 'self' https://*.mzstatic.com https://*.itunes.apple.com blob:",
  "media-src 'self' https://*.mzstatic.com https://*.itunes.apple.com https://cdn.pixabay.com blob:"
);
console.log('1a. CSP media-src pixabay:', config.includes('cdn.pixabay.com') ? 'OK' : 'FAIL');

// connect-src: add nominatim + pixabay + leaflet tiles
config = config.replace(
  `connect-src 'self' https://\${supaHost} https://api.mercadopago.com https://itunes.apple.com wss://\${supaHost}`,
  `connect-src 'self' https://\${supaHost} https://api.mercadopago.com https://itunes.apple.com https://cdn.pixabay.com https://nominatim.openstreetmap.org https://*.basemaps.cartocdn.com wss://\${supaHost}`
);
console.log('1b. CSP connect-src:', config.includes('nominatim') ? 'OK' : 'FAIL');

// style-src: add unpkg for leaflet CSS
config = config.replace(
  "style-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://unpkg.com"
);
console.log('1c. CSP style-src unpkg:', config.includes('unpkg.com') ? 'OK' : 'FAIL');

fs.writeFileSync('next.config.ts', config, 'utf8');

// ===== 2. FIX CONTRAST — all secondary texts to 0.8 minimum =====
let wrapped = fs.readFileSync('src/components/EternizarWrapped.tsx', 'utf8');

// Text: "Ative o som..." on start screen
wrapped = wrapped.replace("color: 'rgba(255,255,255,0.6)' }}>", "color: 'rgba(255,255,255,0.8)' }}>");

// Subtitle "{titulo}" on tela 1
wrapped = wrapped.replace(
  "className=\"text-sm mt-8 nome-capitalize\" style={{ color: 'rgba(255,255,255,0.55)' }}",
  "className=\"text-base mt-8 nome-capitalize\" style={{ color: 'rgba(255,255,255,0.8)' }}"
);

// "dias desde que tudo mudou" on tela 2
wrapped = wrapped.replace(
  "className=\"text-lg sm:text-xl mt-6\" style={{ color: 'rgba(255,255,255,0.75)' }}",
  "className=\"text-lg sm:text-xl mt-6\" style={{ color: 'rgba(255,255,255,0.85)' }}"
);

// "Tempo suficiente para assistir..." on tela 2
wrapped = wrapped.replace(
  "className=\"text-sm mt-4\" style={{ color: 'rgba(255,255,255,0.45)' }}>",
  "className=\"text-base mt-4\" style={{ color: 'rgba(255,255,255,0.8)' }}>"
);

// "De 8 bilhoes de pessoas..." on tela 3
wrapped = wrapped.replace(
  "className=\"text-base leading-relaxed\" style={{ color: 'rgba(255,255,255,0.7)' }}",
  "className=\"text-base leading-relaxed\" style={{ color: 'rgba(255,255,255,0.8)' }}"
);

// "A trilha sonora..." on tela 5
wrapped = wrapped.replace(
  "className=\"text-xl sm:text-2xl\" style={{ color: 'rgba(255,255,255,0.75)'",
  "className=\"text-xl sm:text-2xl\" style={{ color: 'rgba(255,255,255,0.85)'"
);

// Music name on tela 5
wrapped = wrapped.replace(
  "className=\"text-sm mt-3\" style={{ color: 'rgba(255,255,255,0.45)' }}>{musicaNome}",
  "className=\"text-sm mt-3\" style={{ color: 'rgba(255,255,255,0.8)' }}>{musicaNome}"
);

// "Mas os numeros..." on tela 6
wrapped = wrapped.replace(
  "color: 'rgba(255,255,255,0.6)' }}>",
  "color: 'rgba(255,255,255,0.8)' }}>"
);

// "Cada momento tem..." fallback on tela 5
wrapped = wrapped.replace(
  "style={{ color: 'rgba(255,255,255,0.6)', fontFamily: fontes.titulo }}",
  "style={{ color: 'rgba(255,255,255,0.8)', fontFamily: fontes.titulo }}"
);

// Eternizar branding text — keep subtle
// (this one stays at 0.06, it's intentionally invisible branding)

console.log('2. Contrast fixes applied');

// ===== 3. VERIFY stroke widths =====
const strokes = wrapped.match(/strokeWidth="[\d.]+"/g);
console.log('3. SVG strokes:', strokes);

// ===== 4. VERIFY radar rings =====
console.log('4. Radar rings:', wrapped.includes('ping-lg') ? wrapped.match(/ping-lg/g).length + ' refs' : 'MISSING');

// ===== 5. VERIFY outlined class =====
console.log('5. Outlined stroke:', wrapped.includes('-webkit-text-stroke:2.5px') ? '2.5px OK' : 'MISSING');

// ===== 6. VERIFY audio drop =====
console.log('6. BG_LOOP:', wrapped.includes('cdn.pixabay.com') ? 'OK' : 'MISSING');
console.log('6. Audio drop useInView:', wrapped.includes('useInView') ? 'OK' : 'MISSING');
console.log('6. Fade out bg:', wrapped.includes('vol -= 0.03') ? 'OK' : 'MISSING');

fs.writeFileSync('src/components/EternizarWrapped.tsx', wrapped, 'utf8');
console.log('\nAll fixes applied.');
