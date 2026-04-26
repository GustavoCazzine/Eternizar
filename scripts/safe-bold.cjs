const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');
const lines = c.split('\n');

// ===== 1. PASSWORD SCREEN =====
// Find the exact password screen and replace line by line
const senhaStart = lines.findIndex(l => l.includes('min-h-screen text-white flex items-center'));
const senhaEnd = lines.findIndex((l, i) => i > senhaStart && l.trim() === ')' && lines[i+1]?.trim() === '}');
console.log('Password screen:', senhaStart+1, '-', senhaEnd+1);

if (senhaStart !== -1 && senhaEnd !== -1) {
  const newSenha = [
    ' <div className="min-h-screen text-white flex items-center justify-center px-4 relative overflow-hidden"',
    '   style={{ background: \'#000\' }}>',
    '   {fotoCapa && (',
    '     <div className="absolute inset-0">',
    '       {/* eslint-disable-next-line @next/next/no-img-element */}',
    '       <img src={fotoCapa} alt="" className="w-full h-full object-cover" style={{ filter: \'brightness(0.2) blur(8px)\', transform: \'scale(1.1)\' }} />',
    '     </div>',
    '   )}',
    '   <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm w-full relative z-10">',
    '     <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: \'spring\', delay: 0.3 }}',
    '       className="w-16 h-16 rounded-full mx-auto mb-8 flex items-center justify-center"',
    `       style={{ border: \`2px solid \${cor}40\` }}>`,
    `       <svg className="w-6 h-6" style={{ color: cor }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">`,
    '         <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>',
    '       </svg>',
    '     </motion.div>',
    '     <h1 className="text-3xl sm:text-4xl font-black mb-3" style={{ fontFamily: fontes.titulo }}>Uma surpresa te espera</h1>',
    '     <p className="text-sm mb-8" style={{ color: \'rgba(255,255,255,0.35)\' }}>Responda para desbloquear</p>',
    '     {pagina.senha_dica && (',
    '       <div className="mb-8">',
    `         <p className="text-[10px] uppercase tracking-[0.3em] mb-2" style={{ color: cor }}>Dica</p>`,
    '         <p className="text-white/60 italic text-sm">&quot;{pagina.senha_dica}&quot;</p>',
    '       </div>',
    '     )}',
    '     <input type="text" value={senhaInput} onChange={e => setSenhaInput(e.target.value)}',
    '       onKeyDown={e => e.key === \'Enter\' && verificarSenha()}',
    '       placeholder="Sua resposta..."',
    '       className="w-full bg-transparent border-b border-white/15 px-2 py-3 text-white text-center placeholder-white/20 focus:outline-none focus:border-white/40 transition mb-4"',
    '       style={{ borderColor: erroSenha ? \'#f43f5e\' : undefined }}',
    '     />',
    '     {erroSenha && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs mb-4">Hmm, nao foi dessa vez.</motion.p>}',
    '     <button onClick={verificarSenha} className="w-full py-4 rounded-full font-bold text-white transition hover:opacity-90 mt-4"',
    `       style={{ background: cor }}>Desbloquear</button>`,
    '     <p className="text-[10px] uppercase tracking-[0.3em] mt-12" style={{ color: \'rgba(255,255,255,0.1)\' }}>eternizar</p>',
    '   </motion.div>',
    ' </div>',
  ];
  lines.splice(senhaStart, senhaEnd - senhaStart, ...newSenha);
  console.log('1. Password screen: REWRITTEN');
}

c = lines.join('\n');

// ===== 2. BACKGROUNDS — safe string replacements =====
c = c.split('#0A0A0A').join('#000');
c = c.split("background: '#121212'").join("background: '#000'");
console.log('2. Backgrounds: #000');

// ===== 3. HERO GRADIENT — replace specific pattern =====
c = c.replace(
  "? `linear-gradient(to bottom, transparent 0%, ${paleta.fundo}40 30%, ${paleta.fundo}bb 60%, #000 100%)`",
  "? 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.9) 75%, #000 100%)'"
);
c = c.replace(
  ": `radial-gradient(ellipse at 50% 30%, ${paleta.fundoAlt}, #000)`",
  ": '#000'"
);
console.log('3. Hero gradient: clean linear');

// ===== 4. SECTION GRADIENTS — simplify =====
c = c.replace(/`linear-gradient\(180deg, #000, \$\{paleta\.fundo\}, #000\)`/g, "'#000'");
c = c.replace(/`linear-gradient\(180deg, #000, \$\{paleta\.fundo\} 50%, #000\)`/g, "'#000'");
c = c.replace("`radial-gradient(ellipse at center, ${paleta.fundoAlt}, #000)`", "'#000'");
c = c.replace("`radial-gradient(ellipse at center bottom, ${paleta.fundoAlt}, #000)`", "'#000'");
console.log('4. Section gradients: pure black');

// ===== 5. COUNTER TITLE =====
c = c.replace(
  '>Contando cada segundo</h2>',
  ' style={{ fontFamily: fontes.titulo }}>Contando cada segundo</h2>'
);
console.log('5. Counter title: serif');

// ===== 6. CARTA ICON — replace envelope div with SVG =====
c = c.replace(
  '<div className="w-16 h-12 relative">',
  '<div className="w-12 h-12 flex items-center justify-center">'
);
c = c.replace(
  `<div className="absolute inset-0 rounded-lg" style={{ background: \`\${cor}20\`, border: \`2px solid \${cor}40\` }} />`,
  ''
);
c = c.replace(
  `<div className="absolute top-0 left-0 right-0 h-6" style={{ background: \`\${cor}15\`, clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }} />`,
  `<svg className="w-8 h-8" style={{ color: cor }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>`
);
console.log('6. Carta icon: SVG envelope');

// ===== 7. PLAYER — remove bg/border =====
c = c.replace(
  "className=\"flex items-center gap-4 max-w-md mx-auto p-4 rounded-2xl\" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}",
  'className="flex items-center gap-4 max-w-md mx-auto p-4"'
);
// Try alternate (no backdropFilter version)
c = c.replace(
  'className="flex items-center gap-4 max-w-md mx-auto p-4 rounded-2xl" style={{ background: \'rgba(255,255,255,0.04)\', border: \'1px solid rgba(255,255,255,0.08)\' }}',
  'className="flex items-center gap-4 max-w-md mx-auto p-4"'
);
console.log('7. Player: borderless');

// ===== 8. GUESTBOOK — lighter cards =====
c = c.replace(
  "background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)'",
  "borderBottom: '1px solid rgba(255,255,255,0.05)'"
);
console.log('8. Guestbook: minimal borders');

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('\nDone. Size:', Math.round(c.length / 1024) + 'KB');
