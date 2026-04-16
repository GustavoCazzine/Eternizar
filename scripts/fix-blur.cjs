const fs = require('fs');
const path = require('path');

function walk(dir) {
  const out = [];
  for (const item of fs.readdirSync(dir)) {
    if (item === 'node_modules' || item === '.next' || item.startsWith('.')) continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.tsx$/.test(item)) out.push(full);
  }
  return out;
}

let fixed = 0;
for (const f of walk('src')) {
  let c = fs.readFileSync(f, 'utf8');
  const before = c;

  // Cap max blur at 80px desktop, 40px mobile
  c = c.replace(/blur-\[180px\]/g, 'blur-[40px] md:blur-[80px]');
  c = c.replace(/blur-\[150px\]/g, 'blur-[40px] md:blur-[80px]');
  c = c.replace(/blur-\[130px\]/g, 'blur-[40px] md:blur-[70px]');
  c = c.replace(/blur-\[120px\]/g, 'blur-[40px] md:blur-[70px]');
  c = c.replace(/blur-\[100px\]/g, 'blur-[30px] md:blur-[60px]');

  // Also reduce oversized glow orbs
  c = c.replace(/w-\[600px\] h-\[600px\]/g, 'w-[200px] h-[200px] md:w-[400px] md:h-[400px]');
  c = c.replace(/w-\[500px\] h-\[500px\]/g, 'w-[180px] h-[180px] md:w-[350px] md:h-[350px]');

  if (c !== before) {
    fs.writeFileSync(f, c, 'utf8');
    fixed++;
    console.log('FIXED:', path.relative('.', f));
  }
}
console.log('Total:', fixed);
