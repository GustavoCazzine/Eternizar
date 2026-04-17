const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Check if ParallaxLayer exists
if (!c.includes('function ParallaxLayer')) {
  // Add it back before PlayerMusica
  const playerIdx = c.indexOf('function PlayerMusica');
  if (playerIdx !== -1) {
    const parallax = `// Efeito de parallax em camadas
function ParallaxLayer({ children, speed = 0.3, className = '' }: {
  children: React.ReactNode; speed?: number; className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const rawY = useTransform(scrollYProgress, [0, 1], [\`\${speed * -50}%\`, \`\${speed * 50}%\`])
  const y = useSpring(rawY, { stiffness: 100, damping: 30 })

  return (
    <div ref={ref} className={\`overflow-hidden \${className}\`}>
      <motion.div style={{ y }} className="w-full h-full">
        {children}
      </motion.div>
    </div>
  )
}

`;
    c = c.slice(0, playerIdx) + parallax + c.slice(playerIdx);
    console.log('OK: ParallaxLayer restored');
  }
}

// Also fix PlayerMusica blur background (wasn't found earlier due to encoding)
// Find the actual opening div of PlayerMusica's return
const playerReturnMatch = c.match(/return\s*\(\s*\n\s*<div className="rounded-3xl overflow-hidden/);
if (playerReturnMatch) {
  const idx = c.indexOf(playerReturnMatch[0]);
  // Find the style attribute on that div
  const lineEnd = c.indexOf('\n', idx + playerReturnMatch[0].length);
  const line = c.slice(idx, lineEnd);
  console.log('Player div found:', line.slice(0, 120));
}

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('Done');
