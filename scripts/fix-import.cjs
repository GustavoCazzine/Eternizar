const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Fix import
c = c.replace(
  "import { Heart, Calendar, ArrowDown, Play, Pause, Volume2, Images, MessageCircle, Send } from 'lucide-react'",
  "import { Heart, Calendar, ArrowDown, Play, Pause, Volume2, Images, MessageCircle, Send, MapPin as MapPinIcon, Utensils, Film } from 'lucide-react'"
);

// Verify
console.log('Import has MapPinIcon:', c.includes('MapPinIcon'));
console.log('Import has Utensils:', c.includes('Utensils'));
console.log('Import has Film:', c.includes('Film'));

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
