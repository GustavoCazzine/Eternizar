const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

const parallax = `
// Efeito de parallax
function ParallaxLayer({ children, speed = 0.3, className = '' }: {
  children: React.ReactNode; speed?: number; className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const rawY = useTransform(scrollYProgress, [0, 1], [\`\${speed * -50}%\`, \`\${speed * 50}%\`])
  const y = useSpring(rawY, { stiffness: 100, damping: 30 })
  return (
    <div ref={ref} className={\`overflow-hidden \${className}\`}>
      <motion.div style={{ y }} className="w-full h-full">{children}</motion.div>
    </div>
  )
}

`;

// Insert right before first usage
const usageIdx = c.indexOf('<ParallaxLayer');
if (usageIdx === -1) { console.log('No usage found'); process.exit(1); }

// Find the function that contains this usage - go backwards to find "function "
let insertPoint = c.lastIndexOf('\nfunction ', usageIdx);
if (insertPoint === -1) insertPoint = c.lastIndexOf('\n// ', usageIdx);

// Actually simpler: insert after the CartaSelada component (right before SlideMemoria or export)
const slideIdx = c.indexOf('function SlideMemoria');
const exportIdx = c.indexOf('export default function PaginaCliente');

const target = slideIdx !== -1 ? slideIdx : exportIdx;
c = c.slice(0, target) + parallax + c.slice(target);

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('Inserted at position', target);
console.log('Verify:', c.includes('function ParallaxLayer'));
