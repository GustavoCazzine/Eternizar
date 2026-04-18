const c=require('fs').readFileSync('src/app/p/[slug]/PaginaCliente.tsx','utf8');
const lines=c.split('\n');
for(let i=896;i<lines.length;i++){
  const l=lines[i].trim();
  if(l.startsWith('<section')||l.startsWith('{/*')||l.startsWith('</section')||l.includes('Secao')||l.includes('className="py-')||l.includes('footer')||l.includes('Footer')||l.includes('</div>')==false&&l.length>5&&(l.includes('/*')||l.startsWith('</')))
    console.log((i+1)+': '+l.slice(0,130));
}
