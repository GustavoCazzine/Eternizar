const fs = require('fs');
let c = fs.readFileSync('src/app/page.tsx', 'utf8');

// Update hero text
c = c.replace(
  'Algumas hist\u00f3rias merecem',
  'Algumas hist\u00f3rias merecem'
);

// Fix: "ser eternizadas." emphasis text
// Keep this as is — it's already good

// Update subtitle if needed
c = c.replace(
  'Transforme os momentos mais especiais em uma experi\u00eancia digital inesquec\u00edvel. Com m\u00fasica, fotos e a hist\u00f3ria de voc\u00eas.',
  'Transforme seus melhores momentos em uma experi\u00eancia inesquec\u00edvel. Com m\u00fasica, fotos e a hist\u00f3ria de voc\u00eas.'
);

// Update CTA
c = c.replace('Criar minha homenagem', 'Eternizar agora');

fs.writeFileSync('src/app/page.tsx', c, 'utf8');
console.log('Landing copy updated');
