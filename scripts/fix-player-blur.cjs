const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

const target = '<div className="relative rounded-3xl overflow-hidden shadow-2xl max-w-sm mx-auto border border-white/8">';

if (c.includes(target) && !c.includes('blur-[30px] scale-150 opacity-25')) {
  c = c.replace(target, target + `
      {dados.capa && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dados.capa} alt="" className="w-full h-full object-cover blur-[30px] scale-150 opacity-25" />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}`);
  console.log('OK: Blur background inserted');
} else if (c.includes('blur-[30px] scale-150')) {
  console.log('SKIP: Already has blur');
} else {
  console.log('FAIL: Target not found');
}

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
