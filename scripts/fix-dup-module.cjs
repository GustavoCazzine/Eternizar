const fs = require('fs');
let c = fs.readFileSync('src/app/criar/page.tsx', 'utf8');

// Remove the duplicate 'use client' + imports block that starts at line ~85
// Find the orphaned section: "// Fonts hardcoded..." followed by duplicate imports
const orphan = c.indexOf("// Fonts hardcoded: Playfair Display (titles) + Inter (body)");
if (orphan !== -1) {
  // Find where the duplicate imports end (look for the first function/const after the duplicate)
  const nextUseClient = c.indexOf("use client'", orphan);
  if (nextUseClient !== -1) {
    // Find the end of the duplicate imports — look for the first function or type definition
    const dupSection = c.slice(orphan);
    // Find where the duplicate ends — it should have same imports as the top
    // Look for the second occurrence of "// ─── Tipos" or "function Typewriter" after the orphan
    const dupEnd = c.indexOf('// ─── Tipos', orphan);
    if (dupEnd === -1) {
      // Try another marker
      const dupEnd2 = c.indexOf('function Typewriter', orphan);
      if (dupEnd2 !== -1) {
        c = c.slice(0, orphan) + c.slice(dupEnd2);
        console.log('Removed duplicate block from', orphan, 'to', dupEnd2);
      }
    } else {
      c = c.slice(0, orphan) + c.slice(dupEnd);
      console.log('Removed duplicate block from', orphan, 'to', dupEnd);
    }
  }
}

// Also ensure no duplicate imports
const lines = c.split('\n');
const seen = new Set();
const cleaned = [];
for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed.startsWith('import ') && trimmed.includes(' from ')) {
    if (seen.has(trimmed)) continue;
    seen.add(trimmed);
  }
  cleaned.push(line);
}
c = cleaned.join('\n');

// Ensure starts with 'use client'
if (!c.trim().startsWith("'use client'")) {
  c = "'use client'\n\n" + c;
}

fs.writeFileSync('src/app/criar/page.tsx', c, 'utf8');
console.log('File size:', Math.round(c.length / 1024) + 'KB');
console.log('Starts with use client:', c.trim().startsWith("'use client'"));
