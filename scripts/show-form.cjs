const fs = require('fs');
const c = fs.readFileSync('src/app/criar/page.tsx', 'utf8');

// Find PASSOS array
const passosIdx = c.indexOf('const PASSOS');
if (passosIdx !== -1) {
  const passosEnd = c.indexOf('];', passosIdx);
  console.log('PASSOS:', c.slice(passosIdx, passosEnd + 2));
}

// Find FormData interface
const fdIdx = c.indexOf('interface FormData');
const fdEnd = c.indexOf('}', fdIdx);
console.log('\nFormData:', c.slice(fdIdx, fdEnd + 1));

// Find initial state
const initIdx = c.indexOf('useState<FormData>({');
if (initIdx !== -1) {
  const initEnd = c.indexOf('})', initIdx);
  console.log('\nInitState:', c.slice(initIdx, initEnd + 2).slice(0, 500));
}

// Find submit handler - what's appended to FormData
const submitIdx = c.indexOf("fd.append('bucketList'");
if (submitIdx !== -1) {
  const area = c.slice(submitIdx - 200, submitIdx + 200);
  console.log('\nSubmit area:', area.slice(0, 400));
}
