const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Add audioRef AFTER containerRef in PaginaCliente (line 522 area)
const target = '  const containerRef = useRef<HTMLDivElement>(null)';
const mainFunc = c.indexOf('export default function PaginaCliente');

// Find containerRef specifically inside PaginaCliente
const containerInMain = c.indexOf(target, mainFunc);
if (containerInMain !== -1) {
  const lineEnd = c.indexOf('\n', containerInMain);
  const nextLine = c.slice(lineEnd + 1, lineEnd + 80);
  
  if (!nextLine.includes('audioRef')) {
    c = c.slice(0, lineEnd) + '\n  const audioRef = useRef<HTMLAudioElement | null>(null)' + c.slice(lineEnd);
    console.log('audioRef: ADDED to PaginaCliente');
  } else {
    console.log('audioRef: already in PaginaCliente');
  }
} else {
  console.log('containerRef not found in main, trying alternate');
  // Just add after the line with containerRef near line 522
  const lines = c.split('\n');
  for (let i = 520; i < 540; i++) {
    if (lines[i] && lines[i].includes('containerRef')) {
      lines.splice(i + 1, 0, '  const audioRef = useRef<HTMLAudioElement | null>(null)');
      c = lines.join('\n');
      console.log('audioRef: ADDED at line', i + 2);
      break;
    }
  }
}

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');

// Verify: count audioRef definitions
const defs = c.match(/const audioRef = useRef/g);
console.log('audioRef definitions:', defs ? defs.length : 0, '(should be 2: PlayerMusica + PaginaCliente)');
