const fs = require('fs');
let c = fs.readFileSync('src/app/criar/page.tsx', 'utf8');

// ===== 1. FADE-IN DELAY ON INPUTS =====
// Find where step content renders (AnimatePresence) and add staggered children
// The current pattern: motion.div wraps each step with fade
// We need to add delay to the inner content

// Add a FadeInGroup component after Typewriter
if (!c.includes('function FadeInGroup')) {
  const typewriterEnd = c.indexOf('\n\n', c.indexOf('function Typewriter'));
  if (typewriterEnd !== -1) {
    const comp = `

// Fade-in com delay para campos
function FadeInGroup({ children, delay = 0.4, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
`;
    c = c.slice(0, typewriterEnd) + comp + c.slice(typewriterEnd);
    console.log('1. FadeInGroup component: OK');
  }
}

// ===== 2. PHONE MOCKUP ON PREVIEW =====
// Find the desktop preview area and wrap with phone frame
const previaDesktop = c.indexOf('Pr\u00e9via ao vivo');
if (previaDesktop !== -1) {
  // Find the <Previa component
  const previaComp = c.indexOf('<Previa form=', previaDesktop);
  if (previaComp !== -1) {
    const previaEnd = c.indexOf('/>', previaComp) + 2;
    const oldPrevia = c.slice(previaComp, previaEnd);
    
    if (!c.includes('phone-mockup')) {
      const wrapped = `<div className="phone-mockup relative mx-auto" style={{ maxWidth: 280 }}>
              {/* Moldura */}
              <div className="relative rounded-[2.5rem] border-[3px] border-zinc-700 bg-black p-1 shadow-2xl shadow-black/50">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-20" />
                <div className="rounded-[2.2rem] overflow-hidden overflow-y-auto max-h-[520px] scrollbar-hide">
                  ${oldPrevia}
                </div>
              </div>
            </div>`;
      c = c.replace(oldPrevia, wrapped);
      console.log('2. Phone mockup preview: OK');
    }
  }
}

// Also add scrollbar-hide CSS if not present
let css = fs.readFileSync('src/app/globals.css', 'utf8');
if (!css.includes('scrollbar-hide')) {
  css += `
/* Hide scrollbar */
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
`;
  fs.writeFileSync('src/app/globals.css', css, 'utf8');
  console.log('2b. Scrollbar-hide CSS: OK');
}

fs.writeFileSync('src/app/criar/page.tsx', c, 'utf8');
console.log('\nDone: fade-in + phone mockup');
