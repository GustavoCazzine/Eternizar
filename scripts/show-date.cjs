const fs = require('fs');
const c = fs.readFileSync('src/app/criar/page.tsx', 'utf8');

// Find the date micro-reward code
const rewardIdx = c.indexOf('dias juntos');
if (rewardIdx !== -1) {
  const start = c.lastIndexOf('{form.dadosCasal', rewardIdx);
  const area = c.slice(start, rewardIdx + 100);
  console.log('REWARD CODE:');
  console.log(area);
  
  // Find the full block
  const blockEnd = c.indexOf('})()}', rewardIdx);
  console.log('\nFULL BLOCK:');
  console.log(c.slice(start, blockEnd + 5));
}

// Find cidade field
const cidadeIdx = c.indexOf('cidadePrimeiroEncontro');
if (cidadeIdx !== -1) {
  const lines = c.split('\n');
  lines.forEach((l, i) => {
    if (l.includes('cidadePrimeiroEncontro') || l.includes('cidade') || l.includes('Cidade')) {
      console.log('\nCIDADE ' + (i+1) + ': ' + l.trim().slice(0, 130));
    }
  });
}
