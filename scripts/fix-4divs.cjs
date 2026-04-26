const fs = require('fs');
let c = fs.readFileSync('src/app/criar/page.tsx', 'utf8');
const lines = c.split('\n');

// Find 4 consecutive </div> and reduce to 3
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === '</div>' && 
      lines[i+1]?.trim() === '</div>' && 
      lines[i+2]?.trim() === '</div>' && 
      lines[i+3]?.trim() === '</div>') {
    lines.splice(i, 1); // remove one
    console.log('Removed extra </div> at line', i+1);
    break;
  }
}

c = lines.join('\n');
fs.writeFileSync('src/app/criar/page.tsx', c, 'utf8');
console.log('Done');
