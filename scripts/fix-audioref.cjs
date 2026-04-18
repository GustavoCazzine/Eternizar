const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Check if audioRef exists in PaginaCliente
const mainFunc = c.indexOf('export default function PaginaCliente');
const containerRef = c.indexOf('const containerRef', mainFunc);
console.log('containerRef at:', containerRef);
console.log('Has audioRef:', c.includes('const audioRef = useRef<HTMLAudioElement'));

// Find line after containerRef
const afterContainer = c.indexOf('\n', containerRef);
console.log('After containerRef:', c.slice(afterContainer, afterContainer + 80));

// Add audioRef
if (!c.includes('const audioRef = useRef<HTMLAudioElement')) {
  c = c.slice(0, afterContainer) + '\n  const audioRef = useRef<HTMLAudioElement | null>(null)' + c.slice(afterContainer);
  console.log('audioRef: ADDED');
}

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');

// Verify
const v = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');
console.log('Verify audioRef:', v.includes('const audioRef = useRef<HTMLAudioElement'));
