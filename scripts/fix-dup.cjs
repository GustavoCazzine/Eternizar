const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Remove duplicate — keep only one audioRef near containerRef
c = c.replace(
  "const containerRef = useRef<HTMLDivElement>(null)\n  const audioRef = useRef<HTMLAudioElement | null>(null)\n  const audioRef = useRef<HTMLAudioElement | null>(null)",
  "const containerRef = useRef<HTMLDivElement>(null)\n  const audioRef = useRef<HTMLAudioElement | null>(null)"
);

// Also try CRLF variant
c = c.replace(
  "const containerRef = useRef<HTMLDivElement>(null)\r\n  const audioRef = useRef<HTMLAudioElement | null>(null)\r\n  const audioRef = useRef<HTMLAudioElement | null>(null)",
  "const containerRef = useRef<HTMLDivElement>(null)\r\n  const audioRef = useRef<HTMLAudioElement | null>(null)"
);

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
const defs = c.match(/const audioRef = useRef/g);
console.log('audioRef defs:', defs.length);
