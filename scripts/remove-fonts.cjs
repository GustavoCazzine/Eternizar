const fs = require('fs');
let c = fs.readFileSync('src/app/criar/page.tsx', 'utf8');
const lines = c.split('\n');

// 1. Remove paresFonte array (find start and end)
let pareStart = -1, pareEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const paresFonte = [')) pareStart = i;
  if (pareStart !== -1 && pareEnd === -1 && lines[i].trim() === ']') { pareEnd = i; break; }
}
if (pareStart !== -1 && pareEnd !== -1) {
  lines.splice(pareStart, pareEnd - pareStart + 1);
  console.log('1. paresFonte removed:', pareStart+1, '-', pareEnd+1);
} else {
  console.log('1. paresFonte:', pareStart, pareEnd);
}

// 2. Remove Tipografia UI section
let tipoStart = -1, tipoEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{/* Tipografia */}')) tipoStart = i;
  if (tipoStart !== -1 && tipoEnd === -1 && i > tipoStart + 3 && lines[i].trim() === '</div>') {
    // Need to find the right closing </div> — count opens
    tipoEnd = i;
    break;
  }
}
if (tipoStart !== -1 && tipoEnd !== -1) {
  lines.splice(tipoStart, tipoEnd - tipoStart + 1);
  console.log('2. Tipografia UI removed:', tipoStart+1, '-', tipoEnd+1);
}

// 3. Remove fontTitulo variable
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const fontTitulo = fontes[form.fontePar]')) {
    lines.splice(i, 1);
    console.log('3. fontTitulo removed at line', i+1);
    break;
  }
}

// 4. Remove fontes Record if exists
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("const fontes: Record<string, string>") || lines[i].includes("const fontes = {")) {
    // Find end of object
    let end = i;
    while (end < lines.length && !lines[end].trim().endsWith('}')) end++;
    lines.splice(i, end - i + 1);
    console.log('4. fontes Record removed');
    break;
  }
}

c = lines.join('\n');

// Verify
console.log('\n--- VERIFY ---');
console.log('paresFonte:', c.includes('const paresFonte') ? 'STILL EXISTS' : 'REMOVED');
console.log('Tipografia UI:', c.includes('{/* Tipografia */}') ? 'STILL EXISTS' : 'REMOVED');
console.log('fontTitulo:', c.includes('const fontTitulo') ? 'STILL EXISTS' : 'REMOVED');
console.log('fontePar in state:', c.includes("fontePar: 'classico'") ? 'KEPT (backward compat)' : 'missing');
console.log('fontePar in submit:', c.includes("fd.append('fontePar'") ? 'KEPT (backward compat)' : 'missing');

fs.writeFileSync('src/app/criar/page.tsx', c, 'utf8');
