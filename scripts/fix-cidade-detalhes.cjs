const fs = require('fs');
let c = fs.readFileSync('src/app/criar/page.tsx', 'utf8');
const lines = c.split('\n');

// Find and replace lines 733-741 (the cidade input + datalist)
let startLine = -1, endLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("Cidade do 1") && lines[i].includes("encontro")) {
    startLine = i;
  }
  if (startLine !== -1 && lines[i].includes('</datalist>')) {
    endLine = i;
    break;
  }
}

if (startLine !== -1 && endLine !== -1) {
  console.log('Replacing lines', startLine+1, 'to', endLine+1);
  const replacement = [
    ' <p className="text-xs text-gray-400 mb-1.5 flex items-center gap-1"><MapPin className="w-3 h-3" /> Cidade do 1\u00ba encontro</p>',
    ' <CidadeInput',
    '   value={form.dadosCasal.cidadePrimeiroEncontro}',
    '   onChange={v => updCasal(\'cidadePrimeiroEncontro\', v)}',
    '   onSelect={cidade => updCasal(\'cidadePrimeiroEncontro\', cidade.nome)}',
    '   className={inputClass}',
    '   placeholder="Comece a digitar a cidade..."',
    ' />',
  ];
  lines.splice(startLine, endLine - startLine + 1, ...replacement);
  c = lines.join('\n');
  console.log('CidadeInput in PassoDetalhes: OK');
} else {
  console.log('NOT FOUND: startLine', startLine, 'endLine', endLine);
}

fs.writeFileSync('src/app/criar/page.tsx', c, 'utf8');

// Verify no datalist remains
const final = fs.readFileSync('src/app/criar/page.tsx', 'utf8');
console.log('datalist remaining:', final.includes('datalist') ? 'YES' : 'NONE');
console.log('CidadeInput count:', (final.match(/<CidadeInput/g) || []).length);
