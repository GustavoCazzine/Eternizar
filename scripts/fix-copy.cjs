const fs = require('fs');
let c = fs.readFileSync('src/components/EternizarWrapped.tsx', 'utf8');

// ===== TELA 3A — Cosmos =====
c = c.replace(
  "O universo tem<br />{UNIVERSE.age}.",
  "Em um universo com<br />{UNIVERSE.age}..."
);
c = c.replace(
  "A Terra gira a {UNIVERSE.earthSpeed}.",
  "E um planeta que gira a {UNIVERSE.earthSpeed} no escuro..."
);
console.log('3A:', c.includes('Em um universo com') ? 'OK' : 'FAIL');

// ===== TELA 3B — Radar/Cidade =====
// Replace "E de {UNIVERSE.population},\ntudo convergiu em:"
c = c.replace(
  /E de \{UNIVERSE\.population\},\s*<br \/>tudo convergiu em:/,
  "A maior das coincidencias aconteceu."
);

// Now add the second text + keep city. Find the city motion.p and add bridge text before it
c = c.replace(
  /<motion\.p initial=\{\{ opacity: 0, scale: 0\.7 \}\} whileInView=\{\{ opacity: 1, scale: 1 \}\}\s*viewport=\{\{ once: true \}\} transition=\{\{ duration: 0\.6, type: 'spring' \}\}\s*className="text-5xl/,
  `<motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.6 }}
              className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Entre 8 bilhoes de pessoas,<br />nossos caminhos se cruzaram em:
            </motion.p>
            <motion.p initial={{ opacity: 0, scale: 0.7 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ delay: 0.8, duration: 0.6, type: 'spring' }}
              className="text-5xl`
);

// Change the bridge text font size to smaller
c = c.replace(
  "A maior das coincidencias aconteceu.",
  "A maior das coincidencias aconteceu."
);

console.log('3B bridge:', c.includes('maior das coincidencias') ? 'OK' : 'FAIL');
console.log('3B cruzaram:', c.includes('nossos caminhos se cruzaram') ? 'OK' : 'FAIL');

fs.writeFileSync('src/components/EternizarWrapped.tsx', c, 'utf8');
