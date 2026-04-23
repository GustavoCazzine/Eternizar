const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Replace entire stories thumbnails section
const oldSection = `        {/* Miniaturas estilo stories */}
        <div className="flex gap-4 justify-center flex-wrap max-w-2xl mx-auto">
          {fotosNormalizadas.map((foto, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setStoryInicial(i); setStoriesAberto(true) }}
              className="relative flex flex-col items-center gap-2 group"
            >
              {/* Anel colorido estilo story n\u00e3o visto */}
              <div className="p-0.5 rounded-full" style={{ background: \`linear-gradient(135deg, \${cor}, \${paleta.secundaria})\` }}>
                <div className="p-0.5 rounded-full bg-[#121212]">
                  <div className="w-20 h-20 rounded-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={foto.url} alt={foto.legenda || \`Foto \${i + 1}\`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
              </div>
              {/* Legenda curta */}
              <p className="text-xs text-gray-400 text-center max-w-[80px] truncate">
                {foto.legenda || \`Foto \${i + 1}\`}
              </p>
            </motion.button>
          ))}
        </div>`;

// Try with CRLF
const oldSectionCRLF = oldSection.replace(/\n/g, '\r\n');
const found = c.includes(oldSection) ? oldSection : c.includes(oldSectionCRLF) ? oldSectionCRLF : null;

const newSection = `        {/* Miniaturas estilo stories — scroll horizontal */}
          <div className="flex gap-5 overflow-x-auto scrollbar-hide px-4 pb-2 snap-x snap-mandatory max-w-3xl mx-auto justify-start lg:justify-center lg:flex-wrap">
            {fotosNormalizadas.map((foto, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setStoryInicial(i); setStoriesAberto(true) }}
                className="relative flex flex-col items-center gap-2.5 group shrink-0 snap-center"
              >
                {/* Aro gradiente premium */}
                <div className="p-[3px] rounded-full" style={{ background: \`linear-gradient(135deg, \${cor}, \${paleta.secundaria}, \${cor})\` }}>
                  <div className="p-[2px] rounded-full bg-[#121212]">
                    <div className="w-[76px] h-[76px] rounded-full overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={foto.url} alt={foto.legenda || \`Foto \${i + 1}\`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  </div>
                </div>
                {/* Legenda */}
                <p className="text-[11px] text-center max-w-[80px] truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {foto.legenda || \`Foto \${i + 1}\`}
                </p>
              </motion.button>
            ))}
          </div>`;

if (found) {
  c = c.replace(found, newSection);
  console.log('Stories thumbnails: REPLACED');
} else {
  // Fallback: find by unique markers and replace
  const start = c.indexOf('{/* Miniaturas estilo stories');
  const end = c.indexOf('</div>\n', c.indexOf('truncate">', start) + 10);
  if (start !== -1 && end !== -1) {
    // Find the actual closing div of the flex container
    let braceCount = 0;
    let pos = start;
    let flexEnd = -1;
    while (pos < c.length) {
      if (c.slice(pos, pos + 4) === '<div') braceCount++;
      if (c.slice(pos, pos + 6) === '</div>') {
        braceCount--;
        if (braceCount <= 0) { flexEnd = pos + 6; break; }
      }
      pos++;
    }
    if (flexEnd !== -1) {
      c = c.slice(0, start) + newSection + c.slice(flexEnd);
      console.log('Stories thumbnails: REPLACED (fallback)');
    }
  } else {
    console.log('Stories thumbnails: NOT FOUND');
  }
}

// Update section header - tighter spacing
c = c.replace(
  /<section className="py-24 px-4">\s*<Secao className="text-center mb-10">\s*<p[^>]*>Mem..rias que ficam/,
  '<section className="py-14 sm:py-20 px-4">\n          <Secao className="text-center mb-8">\n            <p className="text-xs uppercase tracking-[0.25em] mb-3 font-medium" style={{ color: \'rgba(255,255,255,0.5)\' }}>Mem\u00f3rias que ficam'
);

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('Done');
