const fs = require('fs');
let c = fs.readFileSync('src/components/EternizarWrapped.tsx', 'utf8');

// Add strokeDashoffset to ALL paths that have strokeDasharray
// Pattern: strokeDasharray="1000" (without strokeDashoffset after it)
c = c.replace(
  /strokeDasharray="1000"(?!\s*strokeDashoffset)/g,
  'strokeDasharray="1000" strokeDashoffset="1000"'
);

const count = (c.match(/strokeDashoffset="1000"/g) || []).length;
console.log('strokeDashoffset added:', count, 'times');

// Also add wave-float to the draw-line animations if not already there
c = c.replace(
  /animation: 'draw-line 3s ease-in-out 0\.3s forwards'(?!.*wave)/g,
  "animation: 'draw-line 3s ease-in-out 0.3s forwards, wave-float-1 6s ease-in-out 3.5s infinite'"
);
c = c.replace(
  /animation: 'draw-line 3\.5s ease-in-out 0\.8s forwards'(?!.*wave)/g,
  "animation: 'draw-line 3.5s ease-in-out 0.8s forwards, wave-float-2 7s ease-in-out 4.5s infinite'"
);
c = c.replace(
  /animation: 'draw-line 4s ease-in-out 1\.2s forwards'(?!.*wave)/g,
  "animation: 'draw-line 4s ease-in-out 1.2s forwards, wave-float-3 8s ease-in-out 5.5s infinite'"
);

console.log('wave-float refs:', (c.match(/wave-float/g) || []).length);

fs.writeFileSync('src/components/EternizarWrapped.tsx', c, 'utf8');
