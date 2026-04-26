const fs = require('fs');
let c = fs.readFileSync('src/app/criar/page.tsx', 'utf8');

// Find the pattern: </div>\n\n </div>\n </div>\n )\n} near the Cor do tema
c = c.replace(
  /(<\/div>\s*<\/div>\s*\n\s*<\/div>\s*<\/div>\s*\)\s*\}\s*\n\s*\/\/ Passo 7)/,
  (match) => {
    // Count </div> — should be 3 not 4
    const divCount = (match.match(/<\/div>/g) || []).length;
    console.log('</div> count near Cor do tema:', divCount);
    if (divCount === 4) {
      return match.replace('</div>\n </div>', '</div>');
    }
    return match;
  }
);

// Simpler approach: just find and remove the extra </div>
const lines = c.split('\n');
for (let i = 0; i < lines.length; i++) {
  // Find 3 consecutive </div> lines
  if (lines[i].trim() === '</div>' && 
      lines[i+1]?.trim() === '</div>' && 
      lines[i+2]?.trim() === '' &&
      lines[i+3]?.trim() === '</div>' &&
      lines[i+4]?.trim() === '</div>') {
    // Remove one </div>
    lines.splice(i+3, 1);
    console.log('Removed extra </div> at line', i+4);
    break;
  }
}

c = lines.join('\n');
fs.writeFileSync('src/app/criar/page.tsx', c, 'utf8');
