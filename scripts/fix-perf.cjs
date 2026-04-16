const fs = require('fs');

// Fix sucesso/page.tsx
let suc = fs.readFileSync('src/app/sucesso/page.tsx', 'utf8');

// 1. Lighter GlowOrbs (1 orb instead of 3, smaller blur)
suc = suc.replace(
  /function GlowOrbs\(\) \{[\s\S]*?^\}/m,
  `function GlowOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div
        className="absolute w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full blur-[80px] md:blur-[120px] opacity-15"
        style={{ background: 'radial-gradient(circle, #ff2d78, transparent 70%)', top: '-10%', right: '-5%' }}
      />
    </div>
  )
}`
);

// 2. Remove Particulas (8 framer-motion divs animating forever = GPU killer on mobile)
suc = suc.replace(
  /function Particulas\(\) \{[\s\S]*?^\}/m,
  'function Particulas() { return null }'
);

fs.writeFileSync('src/app/sucesso/page.tsx', suc, 'utf8');
console.log('OK: sucesso perf');

// Fix page.tsx (landing) - check for heavy effects
let landing = fs.readFileSync('src/app/page.tsx', 'utf8');

// Reduce blur values on landing page
landing = landing.replace(/blur-\[150px\]/g, 'blur-[80px] md:blur-[120px]');
landing = landing.replace(/blur-\[130px\]/g, 'blur-[60px] md:blur-[100px]');
landing = landing.replace(/blur-\[120px\]/g, 'blur-[60px] md:blur-[100px]');
landing = landing.replace(/blur-\[100px\]/g, 'blur-[50px] md:blur-[80px]');

// Reduce orb sizes on mobile
landing = landing.replace(/w-\[600px\] h-\[600px\]/g, 'w-[250px] h-[250px] md:w-[500px] md:h-[500px]');
landing = landing.replace(/w-\[500px\] h-\[500px\]/g, 'w-[200px] h-[200px] md:w-[400px] md:h-[400px]');
landing = landing.replace(/w-\[400px\] h-\[400px\]/g, 'w-[180px] h-[180px] md:w-[350px] md:h-[350px]');
landing = landing.replace(/w-\[350px\] h-\[350px\]/g, 'w-[150px] h-[150px] md:w-[300px] md:h-[300px]');

fs.writeFileSync('src/app/page.tsx', landing, 'utf8');
console.log('OK: landing perf');

// Fix PaginaCliente.tsx - same pattern
const pcPath = 'src/app/p/[slug]/PaginaCliente.tsx';
let pc = fs.readFileSync(pcPath, 'utf8');
pc = pc.replace(/blur-\[150px\]/g, 'blur-[80px] md:blur-[120px]');
pc = pc.replace(/blur-\[130px\]/g, 'blur-[60px] md:blur-[100px]');
pc = pc.replace(/blur-\[120px\]/g, 'blur-[60px] md:blur-[100px]');
pc = pc.replace(/w-\[600px\] h-\[600px\]/g, 'w-[250px] h-[250px] md:w-[500px] md:h-[500px]');
pc = pc.replace(/w-\[500px\] h-\[500px\]/g, 'w-[200px] h-[200px] md:w-[400px] md:h-[400px]');
fs.writeFileSync(pcPath, pc, 'utf8');
console.log('OK: PaginaCliente perf');

// Fix painel
let painel = fs.readFileSync('src/app/painel/PainelCliente.tsx', 'utf8');
painel = painel.replace(/blur-\[150px\]/g, 'blur-[80px] md:blur-[120px]');
painel = painel.replace(/blur-\[130px\]/g, 'blur-[60px] md:blur-[100px]');
painel = painel.replace(/blur-\[120px\]/g, 'blur-[60px] md:blur-[100px]');
painel = painel.replace(/w-\[500px\] h-\[500px\]/g, 'w-[200px] h-[200px] md:w-[400px] md:h-[400px]');
fs.writeFileSync('src/app/painel/PainelCliente.tsx', painel, 'utf8');
console.log('OK: painel perf');

console.log('\nAll perf fixes done');
