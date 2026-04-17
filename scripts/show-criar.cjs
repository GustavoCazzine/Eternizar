const fs = require('fs');
const c = fs.readFileSync('src/app/criar/page.tsx', 'utf8');

// Show key sections
const lines = c.split('\n');
console.log('Total lines:', lines.length);

// Find progress bar
lines.forEach((l, i) => {
  if (/Passo.*de|passo.*total|progress/i.test(l)) console.log('PROGRESS ' + (i+1) + ': ' + l.trim().slice(0, 120));
});

// Find error messages
lines.forEach((l, i) => {
  if (/setErro|erro.*obrigat|erro.*inv/i.test(l)) console.log('ERROR ' + (i+1) + ': ' + l.trim().slice(0, 120));
});

// Find placeholder texts
lines.forEach((l, i) => {
  if (/placeholder=/i.test(l)) console.log('PLACEHOLDER ' + (i+1) + ': ' + l.trim().slice(0, 120));
});

// Find the step names
lines.forEach((l, i) => {
  if (/PassoTipo|PassoNomes|PassoFotos|PassoMusica|PassoTimeline|PassoDetalhes|PassoMensagem|PassoEmail/i.test(l) && /function/.test(l)) {
    console.log('STEP_FUNC ' + (i+1) + ': ' + l.trim().slice(0, 100));
  }
});

// Find passosVisiveis
const passosIdx = c.indexOf('passosVisiveis');
if (passosIdx !== -1) {
  console.log('\nPASSOSVISIVEIS:', c.slice(passosIdx, passosIdx + 400));
}
