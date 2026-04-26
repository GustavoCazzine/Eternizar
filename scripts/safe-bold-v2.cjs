const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// ===== SAFE REPLACEMENTS ONLY — no greedy regex =====

// 1. Background: all #0A0A0A and #121212 → #000
c = c.split('#0A0A0A').join('#000');
c = c.split('#121212').join('#000');
console.log('1. Backgrounds → #000');

// 2. Section gradient backgrounds → pure black
c = c.split("`linear-gradient(180deg, #000, ${paleta.fundo}, #000)`").join("'#000'");
c = c.split("`linear-gradient(180deg, #000, ${paleta.fundo} 50%, #000)`").join("'#000'");
c = c.split("`radial-gradient(ellipse at center bottom, ${paleta.fundoAlt}, #000)`").join("'#000'");
c = c.split("`radial-gradient(ellipse at center, ${paleta.fundoAlt}, #000)`").join("'#000'");
console.log('2. Section gradients → #000');

// 3. Hero gradient — clean linear (no vignette)
c = c.replace(
  "? `linear-gradient(to bottom, transparent 0%, ${paleta.fundo}40 30%, ${paleta.fundo}bb 60%, #000 100%)`",
  "? 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.9) 75%, #000 100%)'"
);
c = c.replace(
  ": `radial-gradient(ellipse at 50% 30%, ${paleta.fundoAlt}, #000)`",
  ": '#000'"
);
console.log('3. Hero gradient → clean linear');

// 4. Password screen — replace radial-gradient background
c = c.replace(
  "`radial-gradient(ellipse at center, ${paleta.fundoAlt}, #000)`",
  "'#000'"
);
// Replace password dot icon with SVG lock
c = c.replace(
  `animate={{ rotate: [0, -10, 10, -10, 0] }}\n transition={{ duration: 1, delay: 0.5 }}\n className="text-6xl mb-6"\n >•</motion.div>`,
  `initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }}\n className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"\n style={{ border: \`2px solid \${cor}40\` }}>\n <svg className="w-6 h-6" style={{ color: cor }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>\n </motion.div>`
);
// Password title
c = c.replace(
  '<h1 className="text-2xl font-bold mb-2">Surpresa especial te esperando!</h1>',
  '<h1 className="text-3xl sm:text-4xl font-black mb-3" style={{ fontFamily: fontes.titulo }}>Uma surpresa te espera</h1>'
);
c = c.replace(
  "<p className=\"text-gray-400 mb-2\">Alguém criou algo lindo para você.</p>",
  ''
);
c = c.replace(
  "<p className=\"text-gray-500 text-sm mb-6\">Para abrir, responda: o que só vocês dois sabem?</p>",
  '<p className="text-sm mb-8" style={{ color: \'rgba(255,255,255,0.35)\' }}>Responda para desbloquear</p>'
);
// Password input — underline style
c = c.replace(
  'className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none mb-3 transition nome-capitalize"',
  'className="w-full bg-transparent border-b border-white/15 px-2 py-3 text-white text-center placeholder-white/20 focus:outline-none focus:border-white/40 transition mb-4"'
);
// Password button — pill
c = c.replace(
  "className=\"w-full py-3 rounded-xl font-semibold text-white transition hover:opacity-90\"",
  "className=\"w-full py-4 rounded-full font-bold text-white transition hover:opacity-90\""
);
c = c.replace('>Abrir surpresa', '>Desbloquear');
// Password hint — clean
c = c.replace(
  'className="mb-6 p-4 rounded-2xl border bg-white/5"',
  'className="mb-8"'
);
console.log('4. Password screen → premium');

// 5. Player — borderless
c = c.replace(
  "className=\"flex items-center gap-4 max-w-md mx-auto p-4 rounded-2xl\" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}",
  "className=\"flex items-center gap-4 max-w-md mx-auto p-4\""
);
console.log('5. Player → borderless');

// 6. Carta icon — SVG
c = c.replace(
  '<div className="w-16 h-12 relative">',
  '<div className="flex items-center justify-center">'
);
c = c.replace(
  `<div className="absolute inset-0 rounded-lg" style={{ background: \`\${cor}20\`, border: \`2px solid \${cor}40\` }} />`,
  ''
);
c = c.replace(
  `<div className="absolute top-0 left-0 right-0 h-6" style={{ background: \`\${cor}15\`, clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }} />`,
  `<svg className="w-10 h-10" style={{ color: cor }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>`
);
console.log('6. Carta → SVG envelope');

// 7. Guestbook form card — lighter
c = c.replace(
  "style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}",
  "style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}"
);
console.log('7. Guestbook → minimal');

// 8. Tags/curiosidades — pills style
c = c.replace(
  "className=\"flex items-center gap-3 px-5 py-3 rounded-full backdrop-blur-sm\"",
  "className=\"flex items-center gap-2.5 px-5 py-2.5 rounded-full\""
);
c = c.replace(
  "background: `linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))`,",
  "background: 'rgba(255,255,255,0.04)',\n                  backdropFilter: 'blur(5px)',"
);
c = c.replace(
  "border: `1px solid rgba(255,255,255,0.1)`,",
  "border: '1px solid rgba(255,255,255,0.06)',"
);
console.log('8. Tags → pills');

// 9. Palette backgrounds — darken
c = c.replace(/fundo: '#\w{6}'/g, "fundo: '#030303'");
c = c.replace(/fundoAlt: '#\w{6}'/g, "fundoAlt: '#050505'");
console.log('9. Palettes → near black');

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('\nDone. Size:', Math.round(c.length/1024) + 'KB');
