const c=require('fs').readFileSync('src/app/p/[slug]/PaginaCliente.tsx','utf8');
const lines=c.split('\n');
for(let i=648;i<Math.min(lines.length,900);i++){
  const l=lines[i].trim();
  if(l.startsWith('<section')||l.startsWith('{/*')||l.startsWith('</section')||l.includes('Secao')||l.includes('className="py-')||l.includes('className="min-h')||l.includes('footer')||l.includes('Footer'))
    console.log((i+1)+': '+l.slice(0,130));
}
