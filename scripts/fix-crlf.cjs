const fs = require('fs');
let c = fs.readFileSync('src/app/criar/page.tsx', 'utf8');

// ===== 1. PASSOS — use regex for CRLF tolerance =====
const passosRegex = /\{ id: 'detalhes', titulo: 'Detalhes', visivel: \(\) => true \},\s*\{ id: 'mensagem', titulo: 'Mensagem', visivel: \(\) => true \},/;
const match = c.match(passosRegex);
if (match) {
  c = c.replace(passosRegex, 
    "{ id: 'detalhes', titulo: 'Detalhes', visivel: () => true },\n  { id: 'bucketlist', titulo: 'Sonhos', visivel: (f) => f.tipo === 'casal', opcional: true },\n  { id: 'locais', titulo: 'Locais', visivel: (f) => f.tipo === 'casal', opcional: true },\n  { id: 'mensagem', titulo: 'Mensagem', visivel: () => true },"
  );
  console.log('1. PASSOS: FIXED');
} else {
  console.log('1. PASSOS regex no match');
}

// ===== 2. FormData interface =====
// Find the exact interface end
const fdStart = c.indexOf('interface FormData {');
const fdEnd = c.indexOf('}', c.indexOf('dadosFormatura: DadosFormatura', fdStart));
if (fdEnd !== -1) {
  const currentInterface = c.slice(fdStart, fdEnd + 1);
  if (!currentInterface.includes('audioMensagem')) {
    const newInterface = currentInterface.replace(
      /dadosCasal: DadosCasal;\s*dadosFormatura: DadosFormatura\s*\}/,
      'dadosCasal: DadosCasal; dadosFormatura: DadosFormatura\n  bucketList: Array<{texto: string; feito: boolean}>\n  locais: Array<{titulo: string; descricao: string; endereco: string}>\n  audioMensagem: File | null\n}'
    );
    c = c.replace(currentInterface, newInterface);
    console.log('2. FormData: FIXED');
  }
}

fs.writeFileSync('src/app/criar/page.tsx', c, 'utf8');

// Verify
const v = fs.readFileSync('src/app/criar/page.tsx', 'utf8');
console.log('\nVERIFY:');
console.log('PASSOS bucketlist:', v.includes("id: 'bucketlist'"));
console.log('PASSOS locais:', v.includes("id: 'locais'"));
console.log('FormData audio:', v.includes('audioMensagem: File'));
console.log('FormData locais:', v.includes('locais: Array'));
