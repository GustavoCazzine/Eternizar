const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// ========== 1. PLAYER IMERSIVO ==========
const oldPlayerDiv = `<div className="rounded-3xl overflow-hidden shadow-2xl max-w-sm mx-auto border border-white/8" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)' }}>`;

const newPlayerDiv = `<div className="relative rounded-3xl overflow-hidden shadow-2xl max-w-sm mx-auto border border-white/8">
      {dados.capa && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dados.capa} alt="" className="w-full h-full object-cover blur-[30px] scale-150 opacity-25" />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}
      <div className="relative z-10" style={{ background: 'rgba(0,0,0,0.2)' }}>`;

if (c.includes(oldPlayerDiv)) {
  c = c.replace(oldPlayerDiv, newPlayerDiv);
  
  // Need to add closing </div> for the z-10 wrapper
  // Find "Preview de 30s" text which is near end of PlayerMusica
  const previewText = "Preview de 30s";
  const previewIdx = c.indexOf(previewText);
  if (previewIdx !== -1) {
    // Find the </p> after it, then the </div> that closes the p-6 section
    const afterP = c.indexOf('</p>', previewIdx);
    const closingDiv = c.indexOf('\n    </div>', afterP);
    if (closingDiv !== -1) {
      c = c.slice(0, closingDiv) + '\n      </div>' + c.slice(closingDiv);
      console.log('OK: Player blur background added');
    }
  }
} else {
  console.log('FAIL: Player div not found');
}

// ========== 2. TIMELINE VIVA — scroll-triggered line ==========
// Find the timeline section and enhance it
const timelineSection = c.indexOf("linha_do_tempo?.length > 0 && (");
if (timelineSection !== -1) {
  console.log('Timeline section found at', timelineSection);
  // Show 500 chars of context
  const ctx = c.slice(timelineSection, timelineSection + 600);
  console.log('Context:', ctx.slice(0, 300));
} else {
  console.log('Timeline section not found');
}

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
