const fs = require('fs');
const c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');
const lines = c.split('\n');

// Find ALL audioRef occurrences
lines.forEach((l, i) => {
  if (l.includes('audioRef')) console.log((i+1) + ': ' + l.trim().slice(0, 120));
});

// Find PlayerMusica - does it use audioRef from props or local?
console.log('\n--- PlayerMusica audioRef ---');
const playerStart = c.indexOf('function PlayerMusica');
const playerEnd = c.indexOf('\nfunction ', playerStart + 20);
const playerCode = c.slice(playerStart, playerEnd !== -1 ? playerEnd : playerStart + 2000);
const playerLines = playerCode.split('\n');
playerLines.forEach((l, i) => {
  if (l.includes('audioRef') || l.includes('useRef')) console.log('  P' + i + ': ' + l.trim());
});

// Find CapsulaAudio - does it reference audioRef?
console.log('\n--- CapsulaAudio audioRef ---');
const capsStart = c.indexOf('function CapsulaAudio');
if (capsStart !== -1) {
  const capsEnd = c.indexOf('\nfunction ', capsStart + 20);
  const capsCode = c.slice(capsStart, capsEnd !== -1 ? capsEnd : capsStart + 2000);
  const capsLines = capsCode.split('\n');
  capsLines.forEach((l, i) => {
    if (l.includes('audioRef') || l.includes('musicRef')) console.log('  C' + i + ': ' + l.trim());
  });
}

// Check if audioRef is used where PlayerMusica is rendered
console.log('\n--- audioRef in JSX ---');
lines.forEach((l, i) => {
  if (l.includes('audioRef=') || l.includes('musicRef=')) console.log((i+1) + ': ' + l.trim().slice(0, 120));
});

// Check the main component's refs
console.log('\n--- Main component refs ---');
const mainStart = c.indexOf('export default function PaginaCliente');
for (let i = 0; i < 30; i++) {
  const lineIdx = c.slice(0, mainStart).split('\n').length + i;
  if (lineIdx < lines.length && (lines[lineIdx].includes('useRef') || lines[lineIdx].includes('useState'))) {
    console.log((lineIdx+1) + ': ' + lines[lineIdx].trim());
  }
}
