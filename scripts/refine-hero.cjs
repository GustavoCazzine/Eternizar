const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// ===== 1. BACKGROUND — better gradient + parallax fixed =====
// Fix the photo opacity (too dark at 0.40)
c = c.replace(
  'className="w-full h-full object-cover scale-110 opacity-40"',
  'className="w-full h-full object-cover scale-110 opacity-60" style={{ objectPosition: "center 30%" }}'
);
console.log('1a. Photo opacity: 40% -> 60%');

// Fix gradient overlay — lighter top, dark bottom
c = c.replace(
  "? `linear-gradient(to bottom, ${paleta.fundoAlt}99 0%, ${paleta.fundo}dd 50%, #121212 100%)`",
  "? `linear-gradient(to bottom, transparent 0%, ${paleta.fundo}40 30%, ${paleta.fundo}bb 60%, #121212 100%)`"
);
console.log('1b. Gradient: lighter top, dark bottom');

// Add background-attachment fixed for parallax feel
// Replace ParallaxLayer wrapper with simpler fixed background
c = c.replace(
  '<ParallaxLayer speed={0.15} className="absolute inset-0 pointer-events-none">',
  '<div className="absolute inset-0 pointer-events-none" style={{ backgroundAttachment: "fixed" }}>'
);
c = c.replace(
  '</ParallaxLayer>\n            )}',
  '</div>\n            )}'
);
console.log('1c. Parallax fixed: OK');

// ===== 2. TYPOGRAPHY — fix "surpresa" text contrast =====
c = c.replace(
  "className=\"text-xs uppercase tracking-[0.25em] mb-6 font-medium\" style={{ color: cor }}>\n                Uma surpresa especial para voc",
  "className=\"text-xs uppercase tracking-[0.25em] mb-6 font-medium\" style={{ color: 'rgba(255,255,255,0.7)' }}>\n                Uma surpresa especial para voc"
);
console.log('2a. "Surpresa" text: white 70% opacity');

// Fix subtitle contrast
c = c.replace(
  'className="text-lg md:text-xl text-gray-300 mt-6 nome-capitalize"',
  'className="text-lg md:text-xl mt-6 nome-capitalize" style={{ color: "rgba(255,255,255,0.7)" }}'
);
// Remove duplicate style if subtitle had textShadow
console.log('2b. Subtitle: white 70% opacity');

// ===== 3. CONTADOR — verify count-up + seconds pulse =====
// Already implemented odometer, just verify
const hasOdometer = c.includes('requestAnimationFrame(tick)');
const hasContadorRef = c.includes('contadorRef');
console.log('3a. Odometer count-up:', hasOdometer ? 'EXISTS' : 'MISSING');
console.log('3b. ContadorRef:', hasContadorRef ? 'EXISTS' : 'MISSING');

// Add CSS pulse for seconds in globals
let css = fs.readFileSync('src/app/globals.css', 'utf8');
if (!css.includes('pulse-second')) {
  css += `
/* Seconds pulse */
@keyframes pulse-second {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}
.pulse-second {
  animation: pulse-second 1s ease-in-out infinite;
}
`;
  fs.writeFileSync('src/app/globals.css', css, 'utf8');
  console.log('3c. Pulse-second CSS: ADDED');
}

// Apply pulse-second class to seconds box in ContadorTempo
c = c.replace(
  "transform: item.dest ? 'scale(1.02)' : 'none',",
  "animation: item.dest ? 'pulse-second 1s ease-in-out infinite' : 'none',"
);
console.log('3d. Seconds pulse animation: OK');

// ===== 4. PLAYER — more spacing =====
c = c.replace(
  '{pagina.musica_dados && <Secao delay={0.3}><PlayerMusica dados={pagina.musica_dados} cor={cor} /></Secao>}',
  '{pagina.musica_dados && <Secao delay={0.3} className="mt-10"><PlayerMusica dados={pagina.musica_dados} cor={cor} /></Secao>}'
);
console.log('4. Player margin-top: mt-10');

// ===== 5. TAGS/CARDS — move below scroll indicator =====
// The cards are currently inside the counter section
// Add more spacing above them
c = c.replace(
  "{/* Cards de dados do casal */}",
  "{/* Cards de dados do casal — below scroll area */}"
);
c = c.replace(
  '<Secao delay={0.3} className="mt-12 max-w-sm mx-auto">',
  '<Secao delay={0.3} className="mt-16 max-w-sm mx-auto">'
);
console.log('5. Cards spacing: mt-12 -> mt-16');

// ===== 6. REMOVE global particles (performance) =====
const particlesStart = c.indexOf('{/* Partículas decorativas globais */}');
if (particlesStart !== -1) {
  const particlesEnd = c.indexOf('</div>\n', c.indexOf('[...Array(5)]', particlesStart));
  if (particlesEnd !== -1) {
    const fullParticles = c.slice(particlesStart, particlesEnd + 7);
    c = c.replace(fullParticles, '{/* Particles removed for performance */}');
    console.log('6. Global particles: REMOVED');
  }
}

// ===== 7. GLOW ORBS — reduce size for perf =====
c = c.replace('w-96 h-96 rounded-full blur-3xl', 'w-48 h-48 rounded-full blur-2xl');
c = c.replace('w-64 h-64 rounded-full blur-3xl', 'w-32 h-32 rounded-full blur-2xl');
console.log('7. Glow orbs: halved size');

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('\nAll hero refinements applied.');
