const fs = require('fs');
let c = fs.readFileSync('src/components/EternizarWrapped.tsx', 'utf8');

// 1. Remove entire Aura component
c = c.replace(/function Aura\(\{ cor \}: \{ cor: string \}\) \{[\s\S]*?\n\}\n/g, '');
console.log('1. Aura component:', c.includes('function Aura') ? 'STILL' : 'REMOVED');

// 2. Remove all <Aura /> usages
c = c.replace(/<Aura cor=\{cor\} \/>\s*/g, '');
console.log('2. <Aura /> refs:', (c.match(/<Aura/g) || []).length);

// 3. Remove aura-drift keyframes
c = c.replace(/@keyframes aura-drift-1\{[^}]*\}\s*/g, '');
c = c.replace(/@keyframes aura-drift-2\{[^}]*\}\s*/g, '');
console.log('3. aura-drift keyframes:', c.includes('aura-drift') ? 'STILL' : 'REMOVED');

// 4. Remove album glow blur div (the blur behind album cover in tela 5)
c = c.replace(
  /<div className="absolute inset-0 rounded-3xl pointer-events-none"\s*style=\{\{ background: cor, filter: 'blur\(70px\)', opacity: 0\.25, transform: 'scale\(1\.6\)' \}\} \/>/g,
  ''
);
console.log('4. Album glow blur:', c.includes("blur(70px)") ? 'STILL' : 'REMOVED');

fs.writeFileSync('src/components/EternizarWrapped.tsx', c, 'utf8');
console.log('Done');
