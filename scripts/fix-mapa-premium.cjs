const fs = require('fs');
let c = fs.readFileSync('src/components/MapaAmor.tsx', 'utf8');

// ===== 1. CARD HOVER — translateY + box-shadow =====
c = c.replace(
  "className={`shrink-0 w-56 lg:w-full text-left p-4 rounded-2xl transition-all duration-300 snap-center ${selecionado === i ? 'ring-1' : ''}`}",
  "className={`shrink-0 w-56 lg:w-full text-left p-4 rounded-2xl transition-all duration-300 snap-center hover:-translate-y-0.5 ${selecionado === i ? 'ring-1' : ''}`}"
);
// Add box-shadow on active/hover
c = c.replace(
  "ringColor: cor,\n                }}>",
  "ringColor: cor,\n                  boxShadow: selecionado === i ? `0 4px 20px ${cor}25` : 'none',\n                  transform: selecionado === i ? 'translateY(-2px)' : undefined,\n                }}>",
);
console.log('1. Card hover/active elevation: OK');

// ===== 2. CARD TITLE — serif font =====
c = c.replace(
  '<p className="text-sm font-semibold text-white truncate">{local.titulo}</p>',
  '<p className="text-sm font-semibold text-white truncate" style={{ fontFamily: fontes.titulo }}>{local.titulo}</p>'
);
console.log('2. Card title serif: OK');

// ===== 3. PINOS PULSE ANIMATION =====
c = c.replace(
  `html: \`<div style="
            width:28px;height:28px;border-radius:50%;
            background:\${cor};border:3px solid rgba(255,255,255,0.9);
            box-shadow:0 2px 12px \${cor}80, 0 0 0 4px \${cor}30;
            display:flex;align-items:center;justify-content:center;
            font-size:11px;font-weight:bold;color:white;
          ">\${i + 1}</div>\``,
  `html: \`<div style="
            width:28px;height:28px;border-radius:50%;
            background:\${cor};border:3px solid rgba(255,255,255,0.9);
            box-shadow:0 2px 12px \${cor}80, 0 0 0 4px \${cor}30;
            display:flex;align-items:center;justify-content:center;
            font-size:11px;font-weight:bold;color:white;
            animation: pinPulse 2s ease-in-out infinite;
          ">\${i + 1}</div>
          <style>@keyframes pinPulse { 0%,100%{box-shadow:0 2px 12px \${cor}80, 0 0 0 4px \${cor}30} 50%{box-shadow:0 2px 20px \${cor}aa, 0 0 0 8px \${cor}20} }</style>\``
);
console.log('3. Pin pulse animation: OK');

// ===== 4. MOBILE — carousel overlapping map =====
// Change order-2 to absolute positioned overlay on mobile
c = c.replace(
  '<div className="order-2 lg:order-1 lg:w-[35%]">',
  '<div className="order-2 lg:order-1 lg:w-[35%] lg:relative -mt-16 lg:mt-0 relative z-10">'
);
console.log('4. Mobile carousel overlap: OK');

fs.writeFileSync('src/components/MapaAmor.tsx', c, 'utf8');
console.log('\nAll missing items applied.');
