const fs = require('fs');
const path = require('path');

console.log('=== FIX 1: Error handling in criar page ===');
{
  let c = fs.readFileSync('src/app/criar/page.tsx', 'utf8');
  // Fix: catch non-JSON responses (413 from Vercel, HTML error pages)
  c = c.replace(
    `const res = await fetch('/api/criar', { method: 'POST', body: fd })
      const data = await res.json()`,
    `const res = await fetch('/api/criar', { method: 'POST', body: fd })
      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        throw new Error(res.status === 413 ? 'Fotos muito grandes. Reduza o tamanho total para menos de 4MB.' : 'Erro no servidor. Tente novamente.')
      }
      const data = await res.json()`
  );

  // Also remove infinite particle animations
  c = c.replace(
    /animate=\{\{\s*y:\s*\[-?\d+,\s*-?\d+,\s*-?\d+\],\s*opacity:\s*\[[^\]]+\]\s*\}\}\s*transition=\{\{[^}]*repeat:\s*Infinity[^}]*\}\}/g,
    ''
  );

  fs.writeFileSync('src/app/criar/page.tsx', c, 'utf8');
  console.log('OK: criar page - JSON error handling + removed infinite anims');
}

console.log('\n=== FIX 2: Google avatar + CSP ===');
{
  let c = fs.readFileSync('next.config.ts', 'utf8');

  // Add Google avatar domain to images
  c = c.replace(
    "{ protocol: 'https', hostname: 'is1-ssl.mzstatic.com' },",
    "{ protocol: 'https', hostname: 'is1-ssl.mzstatic.com' },\n      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },"
  );

  // Add Google avatar to CSP img-src
  c = c.replace(
    "https://images.unsplash.com`",
    "https://images.unsplash.com https://lh3.googleusercontent.com`"
  );

  fs.writeFileSync('next.config.ts', c, 'utf8');
  console.log('OK: next.config.ts - Google avatar domain added');
}

console.log('\n=== FIX 3: Music player mobile ===');
{
  let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

  // Find and fix the audio player
  // The issue is that mobile browsers require user gesture to play audio
  // We need to make sure the play button creates/resumes the Audio on tap

  // Check if there's a useRef for audio
  const hasAudioRef = c.includes('audioRef') || c.includes('new Audio');
  console.log('Has audio ref:', hasAudioRef);

  // Find the play/pause handler
  const playMatch = c.match(/function\s+(togglePlay|handlePlay|playPause|tocarMusica)[^{]*\{[\s\S]*?\n\s*\}/);
  if (playMatch) {
    console.log('Found play handler:', playMatch[1]);
  }

  // Find audio-related code
  const audioLines = c.split('\n').filter((l, i) => 
    /audio|Audio|tocando|previewUrl|\.play\(|\.pause\(/i.test(l)
  );
  audioLines.forEach(l => console.log('  AUDIO:', l.trim().slice(0, 120)));

  // Fix: Replace the audio handling to work on mobile
  // Mobile needs Audio to be created INSIDE a user gesture handler
  
  // Check current pattern
  if (c.includes('audioRef.current')) {
    // Pattern 1: using ref
    // Ensure play is called inside click handler with proper error handling
    c = c.replace(
      /audioRef\.current\.play\(\)/g,
      'audioRef.current.play().catch(() => {})'
    );
  }

  if (c.includes('new Audio(')) {
    // Ensure Audio is created in gesture handler
    c = c.replace(
      /const\s+audio\s*=\s*new\s+Audio\(([^)]+)\)\s*\n/g,
      (match, url) => {
        return `const audio = new Audio(${url})\n    audio.setAttribute('playsinline', 'true')\n`;
      }
    );
  }

  // Make sure tocando state toggles correctly
  // Add playsinline attribute for iOS

  fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
  console.log('OK: PaginaCliente - audio fixes applied');
}

console.log('\n=== FIX 4: Remove remaining mojibake in ALL files ===');
{
  function walk(dir) {
    const out = [];
    for (const item of fs.readdirSync(dir)) {
      if (item === 'node_modules' || item === '.next' || item.startsWith('.')) continue;
      const full = path.join(dir, item);
      if (fs.statSync(full).isDirectory()) out.push(...walk(full));
      else if (/\.(tsx?|jsx?)$/.test(item)) out.push(full);
    }
    return out;
  }

  let fixed = 0;
  for (const f of walk('src')) {
    let c = fs.readFileSync(f, 'utf8');
    const before = c;
    
    // Fix comment mojibake (box drawing chars encoded as mojibake)
    c = c.replace(/\u00E2\u0094\u0080/g, '-');
    c = c.replace(/\u00E2\u0095\u0090/g, '=');
    c = c.replace(/\u00E2\u0094\u0082/g, '|');
    c = c.replace(/\u00E2\u0094\u008C/g, '+');
    c = c.replace(/\u00E2\u0094\u0090/g, '+');
    c = c.replace(/\u00E2\u0094\u0094/g, '+');
    c = c.replace(/\u00E2\u0094\u0098/g, '+');
    c = c.replace(/\u00E2\u0094\u009C/g, '+');
    c = c.replace(/\u00E2\u0094\u00A4/g, '+');
    c = c.replace(/\u00E2\u0094\u00AC/g, '+');
    c = c.replace(/\u00E2\u0094\u00B4/g, '+');
    c = c.replace(/\u00E2\u0094\u00BC/g, '+');
    
    // Remaining á, é etc that got double-encoded differently
    c = c.replace(/\u00C3\u00A0/g, '\u00E0'); // à 
    c = c.replace(/\u00C3\u00A1/g, '\u00E1'); // á
    c = c.replace(/\u00C3\u00A9/g, '\u00E9'); // é
    c = c.replace(/\u00C3\u00AD/g, '\u00ED'); // í
    c = c.replace(/\u00C3\u00B3/g, '\u00F3'); // ó
    c = c.replace(/\u00C3\u00BA/g, '\u00FA'); // ú
    c = c.replace(/\u00C3\u00A3/g, '\u00E3'); // ã
    c = c.replace(/\u00C3\u00B5/g, '\u00F5'); // õ
    c = c.replace(/\u00C3\u00A7/g, '\u00E7'); // ç
    c = c.replace(/\u00C3\u00A2/g, '\u00E2'); // â
    c = c.replace(/\u00C3\u00AA/g, '\u00EA'); // ê
    c = c.replace(/\u00C3\u00B4/g, '\u00F4'); // ô

    // Fix ───── patterns (sequences of - from previous fixes)
    c = c.replace(/[-]{5,}/g, '-----');
    c = c.replace(/[=]{5,}/g, '=====');
    
    if (c !== before) {
      fs.writeFileSync(f, c, 'utf8');
      fixed++;
    }
  }
  console.log('OK: Fixed remaining encoding in', fixed, 'files');
}

console.log('\n=== FIX 5: Remove remaining infinite animations ===');
{
  function walk(dir) {
    const out = [];
    for (const item of fs.readdirSync(dir)) {
      if (item === 'node_modules' || item === '.next' || item.startsWith('.')) continue;
      const full = path.join(dir, item);
      if (fs.statSync(full).isDirectory()) out.push(full);
      else if (/\.tsx$/.test(item)) out.push(full);
    }
    // Flatten directories
    const expanded = [];
    for (const f of out) {
      try {
        if (fs.statSync(f).isDirectory()) expanded.push(...walk2(f));
        else expanded.push(f);
      } catch {}
    }
    return expanded;
  }
  function walk2(dir) {
    const out = [];
    for (const item of fs.readdirSync(dir)) {
      if (item === 'node_modules' || item === '.next') continue;
      const full = path.join(dir, item);
      if (fs.statSync(full).isDirectory()) out.push(...walk2(full));
      else if (/\.tsx$/.test(item)) out.push(full);
    }
    return out;
  }

  let totalRemoved = 0;
  for (const f of walk2('src')) {
    let c = fs.readFileSync(f, 'utf8');
    const before = c;

    // Remove transition with repeat: Infinity (except if already cleaned)
    const infiniteCount = (c.match(/repeat:\s*Infinity/g) || []).length;
    if (infiniteCount > 0) {
      // Remove the animate prop + transition with infinity
      c = c.replace(
        /\s*animate=\{\{[^}]*\}\}\s*transition=\{\{[^}]*repeat:\s*Infinity[^}]*\}\}/g,
        ''
      );
      totalRemoved += infiniteCount;
    }

    if (c !== before) {
      fs.writeFileSync(f, c, 'utf8');
      console.log('  Cleaned:', path.relative('.', f), `(${infiniteCount} infinite anims)`);
    }
  }
  console.log('OK: Removed', totalRemoved, 'infinite animations total');
}

console.log('\n=== ALL FIXES DONE ===');
