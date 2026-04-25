const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Remove remaining scroll lock duplicates using regex
c = c.replace(/\s*useEffect\(\(\) => \{\s*document\.body\.style\.overflow = introVisivel \? 'hidden' : ''\s*return \(\) => \{ document\.body\.style\.overflow = '' \}\s*\}, \[introVisivel\]\)\s*/g, '\n');

// Add single clean one before guestbook effect
const gbEffect = c.indexOf("fetch(`/api/guestbook");
const beforeGb = c.lastIndexOf('useEffect(', gbEffect);
c = c.slice(0, beforeGb) + `useEffect(() => {
    if (introVisivel) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [introVisivel])

  ` + c.slice(beforeGb);

const count = (c.match(/introVisivel \? 'hidden'/g) || []).length;
console.log('Scroll lock count:', count, '(should be 1)');

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
