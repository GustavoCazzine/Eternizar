const fs = require('fs');
let c = fs.readFileSync('src/components/MapaAmor.tsx', 'utf8');

// Fix Leaflet type references — use any since it's dynamically imported
c = c.replace('const mapInstance = useRef<L.Map | null>(null)', 'const mapInstance = useRef<any>(null)');
c = c.replace('const markersRef = useRef<L.Marker[]>([])', 'const markersRef = useRef<any[]>([])');

fs.writeFileSync('src/components/MapaAmor.tsx', c, 'utf8');
console.log('Leaflet types fixed');
