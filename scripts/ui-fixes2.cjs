const fs = require('fs');

// ===== PAINEL — smaller cards in grid =====
let pan = fs.readFileSync('src/app/painel/PainelCliente.tsx', 'utf8');

// Find the card container and make it grid
// Look for the cards grid
if (pan.includes('grid-cols-1 md:grid-cols-2')) {
  // Already grid, might need smaller cards
  console.log('Painel: already has grid');
} else if (pan.includes('grid gap-')) {
  console.log('Painel: has grid');
} else {
  // Find the cards wrapper
  const cardsArea = pan.indexOf('.map((p,');
  if (cardsArea !== -1) {
    const wrapperDiv = pan.lastIndexOf('<div className="', cardsArea);
    const wrapperEnd = pan.indexOf('">', wrapperDiv + 16);
    const oldClass = pan.slice(wrapperDiv + 16, wrapperEnd);
    console.log('Painel cards wrapper:', oldClass);
  }
}

// Add icon labels to card footer buttons
// Find the footer buttons area
const footerArea = pan.indexOf('title="Editar"');
if (footerArea !== -1) {
  console.log('Painel: has tooltip titles on buttons');
}

fs.writeFileSync('src/app/painel/PainelCliente.tsx', pan, 'utf8');

// ===== LANDING — needs mockup images =====
let land = fs.readFileSync('src/app/page.tsx', 'utf8');

// Make "Ver exemplo" button more visible
land = land.replace(
  /Ver exemplo<\/a>/,
  'Ver exemplo</a>'
);

// Find "Ver exemplo" button styling
const verExIdx = land.indexOf('Ver exemplo');
if (verExIdx !== -1) {
  const btnStart = land.lastIndexOf('className="', verExIdx);
  const btnEnd = land.indexOf('"', btnStart + 11);
  const btnClass = land.slice(btnStart + 11, btnEnd);
  console.log('Ver exemplo class:', btnClass.slice(0, 100));
  
  // Add border to make it visible
  if (!btnClass.includes('border-white/20')) {
    land = land.replace(btnClass, btnClass + ' border border-white/20 hover:border-white/40');
    console.log('Landing: Ver exemplo button more visible');
  }
}

fs.writeFileSync('src/app/page.tsx', land, 'utf8');
console.log('Landing fixes applied');
