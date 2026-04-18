const fs = require('fs');
let c = fs.readFileSync('src/app/criar/page.tsx', 'utf8');

// 1. FIX DATE REWARD — protect against invalid/partial dates
const oldReward = `{form.dadosCasal.dataInicio && (() => {
            const d = Math.floor((Date.now() - new Date(form.dadosCasal.dataInicio).getTime()) / 86400000)
            return d > 0 ? <p className="text-sm mt-2 font-medium" style={{ color: '#ec4899' }}>Uau! Isso dá {d.toLocaleString('pt-BR')} dias juntos \u2665</p> : null
          })()}`;

const newReward = `{form.dadosCasal.dataInicio && form.dadosCasal.dataInicio.length === 10 && (() => {
            const dt = new Date(form.dadosCasal.dataInicio)
            if (isNaN(dt.getTime())) return null
            const d = Math.floor((Date.now() - dt.getTime()) / 86400000)
            return d > 0 ? <p className="text-sm mt-2 font-medium" style={{ color: '#ec4899' }}>Uau! {d.toLocaleString('pt-BR')} dias juntos \u2665</p> : null
          })()}`;

if (c.includes(oldReward)) {
  c = c.replace(oldReward, newReward);
  console.log('1. Date reward: fixed NaN protection');
} else {
  console.log('1. Old reward not found, trying partial match');
  // Try replacing just the check
  c = c.replace(
    '{form.dadosCasal.dataInicio && (() => {',
    '{form.dadosCasal.dataInicio && form.dadosCasal.dataInicio.length === 10 && (() => {'
  );
  // Add NaN check
  c = c.replace(
    'const d = Math.floor((Date.now() - new Date(form.dadosCasal.dataInicio).getTime()) / 86400000)',
    'const dt = new Date(form.dadosCasal.dataInicio); if (isNaN(dt.getTime())) return null; const d = Math.floor((Date.now() - dt.getTime()) / 86400000)'
  );
  console.log('1. Date reward: patched');
}

// 2. CIDADE — keep as simple text input (no search needed, it's optional flavor text)
// Just improve the placeholder
c = c.replace(
  'placeholder="Ex: S\u00e3o Paulo"',
  'placeholder="Ex: S\u00e3o Paulo, Rio de Janeiro..."'
);
console.log('2. Cidade placeholder: OK');

fs.writeFileSync('src/app/criar/page.tsx', c, 'utf8');
console.log('Done');
