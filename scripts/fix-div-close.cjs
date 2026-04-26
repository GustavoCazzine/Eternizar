const fs = require('fs');
let c = fs.readFileSync('src/app/criar/page.tsx', 'utf8');

// Add missing </div> before the ) that closes PassoDetalhes return
c = c.replace(
  / <\/div>\r?\n\r?\n \)\r?\n\}\r?\n\r?\n\/\/ Passo 7/,
  (match) => {
    return match.replace(/\n\r?\n \)/, '\n </div>\n )')
  }
);

// Simpler approach: find the exact spot
const lines = c.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === ')' && lines[i+1]?.trim() === '}' && lines[i+2]?.trim() === '' && lines[i+3]?.includes('Passo 7')) {
    // Check if line before is </div> (Cor do tema closing)
    if (lines[i-2]?.trim() === '</div>') {
      lines.splice(i, 0, ' </div>');
      console.log('Added missing </div> at line', i+1);
      break;
    }
  }
}

c = lines.join('\n');
fs.writeFileSync('src/app/criar/page.tsx', c, 'utf8');
console.log('Done');
