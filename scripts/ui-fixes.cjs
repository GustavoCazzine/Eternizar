const fs = require('fs');

// ===== 1. INPUT CONTRAST — lighter backgrounds =====
let criar = fs.readFileSync('src/app/criar/page.tsx', 'utf8');

// Replace input class with higher contrast
const oldInput = 'bg-white/5 border border-white/10';
const newInput = 'bg-white/[0.08] border border-white/[0.15]';
criar = criar.split(oldInput).join(newInput);
console.log('1. Input contrast: OK');

// Also fix the progress bar visibility
criar = criar.replace(
  'className="h-full rounded-full"',
  'className="h-full rounded-full shadow-sm"'
);
// Make progress bar brighter
criar = criar.replace(
  "background: `linear-gradient(90deg, ${corHex}, ${corHex}88)`",
  "background: `linear-gradient(90deg, ${corHex}, ${corHex}cc)`"
);
console.log('1b. Progress bar: brighter');

fs.writeFileSync('src/app/criar/page.tsx', criar, 'utf8');

// ===== 2. SUCESSO PAGE — fix QR + hide stats + fix mockup =====
let suc = fs.readFileSync('src/app/sucesso/page.tsx', 'utf8');

// Fix QR Code colors - use dark/subtle instead of bright theme color
suc = suc.replace(
  "dark: corHex,",
  "dark: '#1a1a2e',"
);
suc = suc.replace(
  "light: '#00000000'",
  "light: '#ffffff'"
);
console.log('2a. QR Code: dark on white (scannable)');

// Hide stats section (0 visits is depressing)
if (suc.includes('Visitas e Intera')) {
  suc = suc.replace(
    /\{\/\*?\s*Stats[\s\S]*?Intera..es[\s\S]*?<\/div>\s*<\/div>/,
    '{/* Stats hidden until visits > 0 */}'
  );
  // Try alternate pattern
  const statsStart = suc.indexOf('Visitas e Intera');
  if (statsStart !== -1) {
    const sectionStart = suc.lastIndexOf('<div', statsStart - 200);
    // Find the border-t that starts the stats section
    const borderT = suc.lastIndexOf('border-t', statsStart);
    if (borderT !== -1) {
      const divStart = suc.lastIndexOf('<div', borderT);
      // Find matching closing - count 3 closing divs
      let pos = suc.indexOf('</div>', statsStart);
      pos = suc.indexOf('</div>', pos + 6);
      pos = suc.indexOf('</div>', pos + 6) + 6;
      const oldStats = suc.slice(divStart, pos);
      suc = suc.replace(oldStats, '{/* Stats: shown only in /painel */}');
      console.log('2b. Stats section: hidden');
    }
  }
}

// Fix mockup rotation (torto)
suc = suc.replace('rotate: -6', 'rotate: 0');
suc = suc.replace('rotate: -8', 'rotate: 0');
suc = suc.replace('rotate(-6)', 'rotate(0)');
console.log('2c. Mockup: straightened');

fs.writeFileSync('src/app/sucesso/page.tsx', suc, 'utf8');

// ===== 3. GLOBAL INPUT STYLES =====
let css = fs.readFileSync('src/app/globals.css', 'utf8');
if (!css.includes('input-premium')) {
  css += `
/* Premium input overrides */
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(0.5) sepia(1) saturate(3) hue-rotate(-10deg);
  cursor: pointer;
}
`;
  fs.writeFileSync('src/app/globals.css', css, 'utf8');
  console.log('3. Date picker icon: themed');
}

console.log('\nAll UI fixes applied.');
