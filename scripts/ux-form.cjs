const fs = require('fs');
let c = fs.readFileSync('src/app/criar/page.tsx', 'utf8');

// ===== 1. EMOTIONAL PROGRESS TEXT =====
// Replace "Passo {passo + 1} de {totalPassos}" with emotional text
const oldProgress = "Passo {passo + 1} de {totalPassos}";
const newProgress = `{['Escolha o tipo...', 'Começo da mágica...', 'Capturando momentos...', 'Relembrando a história...', 'A trilha sonora...', 'Detalhes especiais...', 'Quase pronto para emocionar!', 'Últimos toques...'][Math.min(passo, 7)]}`;

if (c.includes(oldProgress)) {
  c = c.replace(oldProgress, newProgress);
  console.log('1. Emotional progress text: OK');
}

// Also replace the numeric counter "passo + 1}/{totalPassos}" in header
c = c.replace(
  `<span className="text-xs text-zinc-600 shrink-0 tabular-nums">{passo + 1}/{totalPassos}</span>`,
  `<span className="text-xs text-zinc-600 shrink-0 tabular-nums">{passo + 1}/{totalPassos}</span>`
);
// Keep numeric but make it subtler - already fine

// ===== 2. MICRO-REWARD ON DATE =====
// Find the date input in PassoNomes and add a "X dias juntos!" display
const dateInputArea = c.indexOf("type=\"date\"");
if (dateInputArea !== -1) {
  // Find the closing of the date input container
  const afterDate = c.indexOf('</div>', dateInputArea);
  // Check if micro-reward already exists
  if (!c.includes('dias juntos')) {
    // Find where dataInicio is used in PassoNomes
    const nomesFunc = c.indexOf('function PassoNomes');
    const nomesEnd = c.indexOf('\nfunction ', nomesFunc + 20);
    const nomesArea = c.slice(nomesFunc, nomesEnd);
    
    // Find the date input and add reward after its container
    const dateInNomes = nomesArea.indexOf("type=\"date\"");
    if (dateInNomes !== -1) {
      const absDatePos = nomesFunc + dateInNomes;
      // Find the next </div> that closes the date field group
      let closingDiv = c.indexOf('</div>', absDatePos);
      closingDiv = c.indexOf('\n', closingDiv);
      
      const reward = `
          {form.dadosCasal.dataInicio && (() => {
            const d = Math.floor((Date.now() - new Date(form.dadosCasal.dataInicio).getTime()) / 86400000)
            return d > 0 ? <p className="text-sm mt-2 font-medium" style={{ color: corHex || '#ec4899' }}>Uau! Isso d\u00e1 {d.toLocaleString('pt-BR')} dias juntos \u2665</p> : null
          })()}`;
      
      c = c.slice(0, closingDiv) + reward + c.slice(closingDiv);
      console.log('2. Date micro-reward: OK');
    }
  }
}

// ===== 3. HUMANIZED ERROR MESSAGES =====
const errorReplacements = [
  ["'Preencha a mensagem.'", "'Ops! Faltou escrever a mensagem do cora\u00e7\u00e3o.'"],
  ["'T\u00edtulo inv\u00e1lido", "'O t\u00edtulo precisa ter entre 1 e 100 caracteres'"],
  ["'E-mail inv\u00e1lido.'", "'Hmm, esse e-mail n\u00e3o parece certo. Confere pra gente?'"],
  ["'Tipo de p\u00e1gina inv\u00e1lido.'", "'Escolha um tipo de homenagem para come\u00e7ar.'"],
  ["'Muitas tentativas. Aguarde um momento.'", "'Calma! Aguarde um minutinho antes de tentar de novo.'"],
  ["'Erro inesperado'", "'Algo deu errado, mas n\u00e3o se preocupe. Tente novamente!'"],
  ["'Erro ao criar'", "'N\u00e3o conseguimos criar a p\u00e1gina. Tente de novo?'"],
  ["'Fotos muito grandes. Reduza o tamanho total para menos de 4MB.'", "'As fotos ficaram grandes demais! Tente usar fotos menores (at\u00e9 4MB no total).'"],
];

errorReplacements.forEach(([old, neo]) => {
  if (c.includes(old)) {
    c = c.replace(old, neo);
  }
});
console.log('3. Humanized errors: OK');

// ===== 4. MAGIC WAND TEXT GENERATOR =====
// Add to PassoMensagem - a button that inserts pre-written text
const passoMensagemFunc = c.indexOf('function PassoMensagem');
if (passoMensagemFunc !== -1) {
  // Find the textarea/label area
  const mensagemArea = c.indexOf("Mensagem do cora", passoMensagemFunc);
  if (mensagemArea !== -1) {
    // Find the textarea
    const textareaIdx = c.indexOf('<textarea', mensagemArea);
    if (textareaIdx !== -1) {
      // Add magic wand button before textarea
      const wand = `
          {/* Varinha m\u00e1gica */}
          <div className="flex gap-2 mb-3 flex-wrap">
            <span className="text-xs text-zinc-600 self-center">Precisa de inspira\u00e7\u00e3o?</span>
            {[
              { label: 'Rom\u00e2ntico', text: 'Cada dia ao seu lado \u00e9 uma p\u00e1gina nova da hist\u00f3ria mais bonita que eu j\u00e1 vivi. Voc\u00ea transformou meu mundo em algo que eu nem sabia que podia existir. Obrigado(a) por ser meu porto seguro, meu riso f\u00e1cil e meu amor mais verdadeiro.' },
              { label: 'Divertido', text: 'Se algu\u00e9m me dissesse que eu ia encontrar uma pessoa que aguenta minhas piadas ruins, come a \u00faltima fatia de pizza comigo e ainda me faz rir todo dia... eu diria que essa pessoa merece um tr\u00f3feu. Esse \u00e9 voc\u00ea. Te amo, criatura!' },
              { label: 'Direto', text: 'N\u00e3o sou de muitas palavras, mas preciso dizer: voc\u00ea \u00e9 a melhor coisa que aconteceu na minha vida. Simples assim.' },
            ].map(opt => (
              <button key={opt.label} type="button"
                onClick={() => upd('mensagem', opt.text)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 hover:border-white/25 text-zinc-400 hover:text-white transition">
                \u2728 {opt.label}
              </button>
            ))}
          </div>
`;
      c = c.slice(0, textareaIdx) + wand + c.slice(textareaIdx);
      console.log('4. Magic wand: OK');
    }
  }
}

// ===== 5. CHARACTER COUNTER on mensagem =====
// Find the mensagem textarea and add counter after it
const msgTextarea = c.indexOf("600 caracteres");
if (msgTextarea === -1) {
  // Find "600" near textarea
  const textareaClose = c.indexOf('</textarea>', c.indexOf("Escreva aqui do cora"));
  if (textareaClose !== -1) {
    const afterTextarea = c.indexOf('\n', textareaClose);
    const counter = `
          <p className={\`text-xs mt-1 text-right \${form.mensagem.length > 550 ? 'text-red-400' : 'text-zinc-600'}\`}>
            {form.mensagem.length}/600 caracteres
          </p>`;
    c = c.slice(0, afterTextarea) + counter + c.slice(afterTextarea);
    console.log('5. Character counter: OK');
  }
}

// ===== 6. BETTER PLACEHOLDERS =====
c = c.replace(
  'placeholder="Ex: nome do pet, m\u00fasica favorita..."',
  'placeholder="Ex: Onde foi nosso primeiro beijo?"'
);
c = c.replace(
  `placeholder='Dica para quem vai receber... Ex: "Nossa m\u00fasica favorita"'`,
  `placeholder='Ex: O nome do nosso pet, o lugar do primeiro encontro...'`
);
console.log('6. Better placeholders: OK');

fs.writeFileSync('src/app/criar/page.tsx', c, 'utf8');
console.log('\nAll form UX improvements applied.');
