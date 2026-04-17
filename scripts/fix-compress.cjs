const fs = require('fs');

let c = fs.readFileSync('src/app/criar/page.tsx', 'utf8');

// 1. Add import for comprimirImagem
if (!c.includes('comprimirImagem')) {
  c = c.replace(
    "import { useBlobUrl, useBlobUrls } from '@/lib/useBlobUrl'",
    "import { useBlobUrl, useBlobUrls } from '@/lib/useBlobUrl'\nimport { comprimirImagem } from '@/lib/comprimirImagem'"
  );
}

// 2. Find handleFotos and add compression
// Look for the pattern where files are added to state
const handleFotosMatch = c.match(/function handleFotos[^{]*\{[\s\S]*?\n\s{2}\}/);
if (handleFotosMatch) {
  console.log('Found handleFotos, length:', handleFotosMatch[0].length);
  console.log('Preview:', handleFotosMatch[0].slice(0, 200));
}

// Find where fotoCapa is set
const fotoCapaMatch = c.match(/fotoCapa[^}]*File[^}]*/);
if (fotoCapaMatch) {
  console.log('fotoCapa pattern:', fotoCapaMatch[0].slice(0, 100));
}

// 3. Find the submit handler and add compression before FormData append
// Add compression to fotos before appending
const oldFotosAppend = "form.fotos.forEach(f => fd.append('fotos', f.file))";
const newFotosAppend = `// Comprimir fotos antes de enviar
      const fotosComprimidas = await Promise.all(form.fotos.map(f => comprimirImagem(f.file)))
      fotosComprimidas.forEach(f => fd.append('fotos', f))`;

if (c.includes(oldFotosAppend)) {
  c = c.replace(oldFotosAppend, newFotosAppend);
  console.log('OK: fotos compression added to submit');
}

// 4. Add compression to fotoCapa
const oldCapaAppend = "if (form.fotoCapa) fd.append('fotoCapa', form.fotoCapa)";
const newCapaAppend = "if (form.fotoCapa) { const capaComprimida = await comprimirImagem(form.fotoCapa); fd.append('fotoCapa', capaComprimida) }";

if (c.includes(oldCapaAppend)) {
  c = c.replace(oldCapaAppend, newCapaAppend);
  console.log('OK: fotoCapa compression added');
}

// 5. Compress event photos too
const oldEventoAppend = "form.eventos.forEach((ev, i) => { if (ev.foto) fd.append(`eventoFoto_${i}`, ev.foto) })";
const newEventoAppend = "for (let i = 0; i < form.eventos.length; i++) { if (form.eventos[i].foto) { const evComp = await comprimirImagem(form.eventos[i].foto!); fd.append(`eventoFoto_${i}`, evComp) } }";

if (c.includes(oldEventoAppend)) {
  c = c.replace(oldEventoAppend, newEventoAppend);
  console.log('OK: evento photos compression added');
}

fs.writeFileSync('src/app/criar/page.tsx', c, 'utf8');
console.log('\nDone. All image compression integrated.');
