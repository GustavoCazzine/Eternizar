const fs = require('fs');
let c = fs.readFileSync('src/app/criar/page.tsx', 'utf8');

// Check Passo interface
const passoInterface = c.indexOf('interface Passo');
if (passoInterface !== -1) {
  const end = c.indexOf('}', passoInterface);
  console.log('Passo interface:', c.slice(passoInterface, end + 1));
}

// Check PASSOS definition
const passos = c.indexOf('const PASSOS');
const passosEnd = c.indexOf('];', passos);
console.log('\nPASSOS:', c.slice(passos, passosEnd + 2));

// Check if audio UI exists
console.log('\nHas audio UI:', c.includes('Mensagem de voz'));
console.log('Has audioMensagem in form:', c.includes("audioMensagem: File | null"));

// Check passosVisiveis call
const pv = c.indexOf('passosVisiveis');
console.log('\npassosVisiveis:', c.slice(pv, pv + 80));

// Check bucketlist rendering
console.log('\nHas PassoBucketList render:', c.includes('passoAtual?.id === "bucketlist"'));
console.log('Has PassoLocais render:', c.includes('passoAtual?.id === "locais"'));
console.log('Has function PassoBucketList:', c.includes('function PassoBucketList'));
console.log('Has function PassoLocais:', c.includes('function PassoLocais'));
