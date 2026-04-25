const fs = require('fs');
let c = fs.readFileSync('src/components/MapaAmor.tsx', 'utf8');

// Remove the broken try { inside initMap
c = c.replace(
  "async function initMap() {\n      try {",
  "async function initMap() {"
);

// Remove the broken catch if any exists
c = c.replace(
  /\} catch \(err\) \{\s*console\.error\("Mapa erro:", err\)\s*setMapError\(true\)\s*\}/,
  ''
);

// Instead, wrap the initMap() CALL in try-catch
c = c.replace(
  "    initMap()\n",
  "    initMap().catch(() => setMapError(true))\n"
);

fs.writeFileSync('src/components/MapaAmor.tsx', c, 'utf8');
console.log('Fixed: try-catch on initMap call');
