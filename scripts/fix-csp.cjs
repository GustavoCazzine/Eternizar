const fs = require('fs');
let c = fs.readFileSync('next.config.ts', 'utf8');
c = c.replace(
  "media-src 'self' https://*.mzstatic.com blob:",
  "media-src 'self' https://*.mzstatic.com https://*.itunes.apple.com blob:"
);
fs.writeFileSync('next.config.ts', c, 'utf8');
console.log('OK: added itunes.apple.com to media-src CSP');
