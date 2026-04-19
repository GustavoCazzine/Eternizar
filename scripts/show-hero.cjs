const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');
const lines = c.split('\n');

// Show hero section structure (lines 670-760 approx)
console.log('=== HERO SECTION ===');
for (let i = 668; i < 770 && i < lines.length; i++) {
  const l = lines[i].trim();
  if (l.length > 3) console.log((i+1) + ': ' + l.slice(0, 140));
}

// Show where tags/dados_casal cards are
console.log('\n=== CASAL CARDS ===');
for (let i = 770; i < 850 && i < lines.length; i++) {
  const l = lines[i].trim();
  if (l.includes('Onde') || l.includes('dados_casal') || l.includes('Cards') || l.includes('label') || l.includes('Comida'))
    console.log((i+1) + ': ' + l.slice(0, 120));
}

// Show player section
console.log('\n=== PLAYER IN COUNTER ===');
for (let i = 790; i < 830 && i < lines.length; i++) {
  const l = lines[i].trim();
  if (l.includes('Player') || l.includes('musica') || l.includes('Secao'))
    console.log((i+1) + ': ' + l.slice(0, 120));
}
