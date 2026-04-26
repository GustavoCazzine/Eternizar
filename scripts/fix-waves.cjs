const fs = require('fs');
let c = fs.readFileSync('src/components/EternizarWrapped.tsx', 'utf8');

// 1. Remove the two circles from Tela 1 SVG
c = c.replace(
  `          <circle cx="330" cy="140" r="60" stroke="rgba(255,255,255,0.06)" strokeWidth="2" fill="none"\n            strokeDasharray="400" style={{ animation: 'draw-line 2.5s ease-in-out 2s forwards' }} />\n          <circle cx="70" cy="670" r="45" stroke={\`\${cor}25\`} strokeWidth="2" fill="none"\n            strokeDasharray="300" style={{ animation: 'draw-line 2.5s ease-in-out 2.5s forwards' }} />`,
  ''
);
console.log('1. Circles removed:', !c.includes('cx="330"') ? 'OK' : 'FAIL');

// 2. Add wave animation keyframes + apply to lines after draw
// Replace draw-line with draw-then-wave (draws first, then undulates)
c = c.replace(
  '@keyframes draw-line{from{stroke-dashoffset:1000}to{stroke-dashoffset:0}}',
  `@keyframes draw-line{from{stroke-dashoffset:1000}to{stroke-dashoffset:0}}
        @keyframes wave-drift{0%,100%{d:path('M-30,180 Q80,80 200,280 T430,220')}50%{d:path('M-30,200 Q100,120 180,260 T430,240')}}
        @keyframes wave-float-1{0%,100%{transform:translateY(0)}50%{transform:translateY(-15px)}}
        @keyframes wave-float-2{0%,100%{transform:translateY(0)}50%{transform:translateY(12px)}}
        @keyframes wave-float-3{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`
);

// Replace the 3 path lines to add wave animation after draw
c = c.replace(
  `<motion.path d="M-30,180 Q80,80 200,280 T430,220"
            stroke={cor} strokeWidth="3" strokeLinecap="round" fill="none"
            strokeDasharray="1000" style={{ animation: 'draw-line 3s ease-in-out 0.3s forwards' }}
            initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 0.3, duration: 0.5 }} />`,
  `<motion.path d="M-30,180 Q80,80 200,280 T430,220"
            stroke={cor} strokeWidth="3" strokeLinecap="round" fill="none"
            strokeDasharray="1000"
            style={{ animation: 'draw-line 3s ease-in-out 0.3s forwards, wave-float-1 6s ease-in-out 3.5s infinite' }}
            initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 0.3, duration: 0.5 }} />`
);

c = c.replace(
  `<motion.path d="M-30,450 Q140,350 260,520 T430,440"
            stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" fill="none"
            strokeDasharray="1000" style={{ animation: 'draw-line 3.5s ease-in-out 0.8s forwards' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} />`,
  `<motion.path d="M-30,450 Q140,350 260,520 T430,440"
            stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" fill="none"
            strokeDasharray="1000"
            style={{ animation: 'draw-line 3.5s ease-in-out 0.8s forwards, wave-float-2 7s ease-in-out 4.5s infinite' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} />`
);

c = c.replace(
  `<motion.path d="M-30,620 Q180,540 310,680 T430,620"
            stroke={\`\${cor}50\`} strokeWidth="3.5" fill="none"
            strokeDasharray="1000" style={{ animation: 'draw-line 4s ease-in-out 1.2s forwards' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} />`,
  `<motion.path d="M-30,620 Q180,540 310,680 T430,620"
            stroke={\`\${cor}50\`} strokeWidth="3.5" fill="none"
            strokeDasharray="1000"
            style={{ animation: 'draw-line 4s ease-in-out 1.2s forwards, wave-float-3 8s ease-in-out 5.5s infinite' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} />`
);

console.log('2. Wave animations:', c.includes('wave-float-1') ? 'OK' : 'FAIL');

fs.writeFileSync('src/components/EternizarWrapped.tsx', c, 'utf8');
console.log('Done');
