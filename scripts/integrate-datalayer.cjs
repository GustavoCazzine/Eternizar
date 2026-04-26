const fs = require('fs');
let c = fs.readFileSync('src/app/criar/page.tsx', 'utf8');

// ===== 1. ADD IMPORTS =====
const lastImport = c.lastIndexOf("import ");
const lastImportEnd = c.indexOf('\n', c.indexOf('\n', lastImport) + 1);

if (!c.includes("import CidadeInput")) {
  c = c.slice(0, lastImportEnd) + `
import CidadeInput from '@/components/CidadeInput'
import { calculateTotalDays, calculateWeekendsTogether, formatRelativeDate } from '@/utils/dateMath'
import { VALIDATION } from '@/lib/schema'
` + c.slice(lastImportEnd);
  console.log('1. Imports: OK');
}

// ===== 2. REPLACE CIDADE INPUT in PassoDetalhes =====
// Replace the old datalist cidade input with CidadeInput component
const oldCidade = `<p className="text-xs text-gray-400 mb-1.5 flex items-center gap-1"><MapPin className="w-3 h-3" /> Cidade do 1º encontro</p>
 <input value={form.dadosCasal.cidadePrimeiroEncontro} onChange={e => updCasal('cidadePrimeiroEncontro', e.target.value)}
 placeholder="Ex: São Paulo, Rio de Janeiro..." className={inputClass} list="cidades" autoComplete="off" />
 <datalist id="cidades">
 {['São Paulo, SP','Rio de Janeiro, RJ','Belo Horizonte, MG','Brasília, DF','Curitiba, PR','Salvador, BA','Fortaleza, CE','Recife, PE','Porto Alegre, RS','Goiânia, GO','Manaus, AM','Campinas, SP','São Luís, MA','Florianópolis, SC','Vitória, ES','Natal, RN','Santos, SP','Ribeirão Preto, SP','Sorocaba, SP','Joinville, SC','Londrina, PR','Niterói, RJ','Aracaju, SE','Maceió, AL','Campo Grande, MS'].map(c => (
 <option key={c} value={c} />
 ))}
 </datalist>`;

if (c.includes(oldCidade)) {
  c = c.replace(oldCidade, `<p className="text-xs text-gray-400 mb-1.5 flex items-center gap-1"><MapPin className="w-3 h-3" /> Cidade do 1º encontro</p>
 <CidadeInput
   value={form.dadosCasal.cidadePrimeiroEncontro}
   onChange={v => updCasal('cidadePrimeiroEncontro', v)}
   onSelect={cidade => {
     updCasal('cidadePrimeiroEncontro', cidade.nome)
   }}
   className={inputClass}
   placeholder="Comece a digitar a cidade..."
 />`);
  console.log('2. CidadeInput in PassoDetalhes: OK');
} else {
  console.log('2. CidadeInput: old pattern not found, trying regex');
  // Try regex
  const cidadeRegex = /<p className="text-xs text-gray-400 mb-1\.5 flex items-center gap-1"><MapPin className="w-3 h-3" \/> Cidade do 1º encontro<\/p>\s*<input value=\{form\.dadosCasal\.cidadePrimeiroEncontro\}[^>]*\/>\s*<datalist id="cidades">\s*\{[\s\S]*?<\/datalist>/;
  if (cidadeRegex.test(c)) {
    c = c.replace(cidadeRegex, `<p className="text-xs text-gray-400 mb-1.5 flex items-center gap-1"><MapPin className="w-3 h-3" /> Cidade do 1º encontro</p>
 <CidadeInput
   value={form.dadosCasal.cidadePrimeiroEncontro}
   onChange={v => updCasal('cidadePrimeiroEncontro', v)}
   onSelect={cidade => updCasal('cidadePrimeiroEncontro', cidade.nome)}
   className={inputClass}
   placeholder="Comece a digitar a cidade..."
 />`);
    console.log('2. CidadeInput (regex): OK');
  } else {
    console.log('2. SKIP: could not find cidade input');
  }
}

// ===== 3. REPLACE ENDERECO IN PassoLocais with CidadeInput =====
const oldEndereco = `<input value={local.endereco} onChange={e => updateLocal(i, 'endereco', e.target.value)}
              placeholder="Endereco (cidade, estado)" className={\`\${inputClass} mb-2\`} list="cidades" autoComplete="off" />`;
const oldEnderecoAlt = `<input value={local.endereco} onChange={e => updateLocal(i, 'endereco', e.target.value)}`;

if (c.includes('updateLocal(i, \'endereco\'')) {
  // Find and replace the endereco input in PassoLocais
  const locaisStart = c.indexOf('function PassoLocais');
  const locaisEnd = c.indexOf('\nfunction ', locaisStart + 20);
  let locaisSection = c.slice(locaisStart, locaisEnd !== -1 ? locaisEnd : locaisStart + 3000);
  
  // Find the endereco input
  const enderecoIdx = locaisSection.indexOf("updateLocal(i, 'endereco'");
  if (enderecoIdx !== -1) {
    // Find the full input tag
    const inputStart = locaisSection.lastIndexOf('<input', enderecoIdx);
    const inputEnd = locaisSection.indexOf('/>', enderecoIdx) + 2;
    const oldInput = locaisSection.slice(inputStart, inputEnd);
    
    const newInput = `<CidadeInput
                value={local.endereco}
                onChange={v => updateLocal(i, 'endereco', v)}
                onSelect={cidade => {
                  updateLocal(i, 'endereco', cidade.nome)
                  const nova = [...form.locais]
                  nova[i] = { ...nova[i], lat: cidade.lat, lng: cidade.lng }
                  upd('locais', nova)
                }}
                className={\`\${inputClass} mb-2\`}
                placeholder="Comece a digitar a cidade..."
              />`;
    
    locaisSection = locaisSection.replace(oldInput, newInput);
    c = c.slice(0, locaisStart) + locaisSection + c.slice(locaisEnd !== -1 ? locaisEnd : locaisStart + 3000);
    console.log('3. CidadeInput in PassoLocais: OK');
  }
}

// ===== 4. UPGRADE DATE MICRO-REWARD with dateMath =====
const oldReward = /Uau! \{d\.toLocaleString\('pt-BR'\)\} dias juntos/;
if (oldReward.test(c)) {
  // Replace with richer reward using dateMath
  c = c.replace(
    /\{form\.dadosCasal\.dataInicio && form\.dadosCasal\.dataInicio\.length === 10 && \(\(\) => \{\s*const dt = new Date\(form\.dadosCasal\.dataInicio\)\s*if \(isNaN\(dt\.getTime\(\)\)\) return null\s*const d = Math\.floor\(\(Date\.now\(\) - dt\.getTime\(\)\) \/ 86400000\)\s*return d > 0 \? <p[^>]*>Uau! \{d\.toLocaleString\('pt-BR'\)\} dias juntos[^<]*<\/p> : null\s*\}\)\(\)\}/,
    `{form.dadosCasal.dataInicio && form.dadosCasal.dataInicio.length === 10 && (() => {
            const dias = calculateTotalDays(form.dadosCasal.dataInicio)
            const fds = calculateWeekendsTogether(form.dadosCasal.dataInicio)
            const tempo = formatRelativeDate(form.dadosCasal.dataInicio)
            if (dias <= 0) return null
            return (
              <div className="mt-3 space-y-1">
                <p className="text-sm font-medium animate-pulse" style={{ color: '#B91C3C' }}>
                  {tempo} juntos \u2665
                </p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {dias.toLocaleString('pt-BR')} dias \u00b7 {fds.toLocaleString('pt-BR')} finais de semana
                </p>
              </div>
            )
          })()}`
  );
  console.log('4. Date micro-reward upgraded: OK');
} else {
  console.log('4. Date reward: pattern not found, trying simpler');
  // Simple replacement
  if (c.includes('dias juntos')) {
    c = c.replace(
      /Uau! \{d[^}]*\} dias juntos/,
      '{formatRelativeDate(form.dadosCasal.dataInicio)} juntos'
    );
    console.log('4b. Date reward simplified: OK');
  }
}

// ===== 5. USE VALIDATION CONSTANTS =====
// Replace hardcoded 600 with VALIDATION.mensagem.max
c = c.replace(/\.slice\(0, 600\)/g, `.slice(0, VALIDATION.mensagem.max)`);
c = c.replace(/\/600 caracteres/g, `/{VALIDATION.mensagem.max} caracteres`);
c = c.replace(/form\.mensagem\.length > 550/g, 'form.mensagem.length > VALIDATION.mensagem.max - 50');
console.log('5. Validation constants: OK');

// ===== 6. USE VALIDATION for bucket list max =====
c = c.replace(/form\.bucketList\.length >= 20/g, 'form.bucketList.length >= VALIDATION.maxBucketItems');
c = c.replace(/form\.locais\.length >= 10/g, 'form.locais.length >= VALIDATION.maxLocais');
c = c.replace(/\/20 itens/g, '/{VALIDATION.maxBucketItems} itens');
console.log('6. Validation limits: OK');

fs.writeFileSync('src/app/criar/page.tsx', c, 'utf8');

// VERIFY
const final = fs.readFileSync('src/app/criar/page.tsx', 'utf8');
console.log('\n--- VERIFY ---');
console.log('Import CidadeInput:', final.includes("import CidadeInput"));
console.log('Import dateMath:', final.includes("import { calculateTotalDays"));
console.log('Import VALIDATION:', final.includes("import { VALIDATION }"));
console.log('CidadeInput in PassoDetalhes:', final.includes('<CidadeInput') && final.includes("cidadePrimeiroEncontro"));
console.log('CidadeInput in PassoLocais:', final.includes("cidade.lat, lng: cidade.lng"));
console.log('dateMath in reward:', final.includes('calculateTotalDays') || final.includes('formatRelativeDate'));
console.log('VALIDATION.mensagem.max:', final.includes('VALIDATION.mensagem.max'));
