const fs = require('fs');
let c = fs.readFileSync('src/components/EternizarWrapped.tsx', 'utf8');

// 1. Remove wave-float from line animations — keep only slow draw
c = c.replace(/, wave-float-1 6s ease-in-out 3\.5s infinite/g, '');
c = c.replace(/, wave-float-2 7s ease-in-out 4\.5s infinite/g, '');
c = c.replace(/, wave-float-3 8s ease-in-out 5\.5s infinite/g, '');
console.log('1. Wave-float removed from paths');

// 2. Make draw slower (3s→5s, 3.5s→6s, 4s→7s)
c = c.replace("draw-line 3s ease-in-out 0.3s", "draw-line 5s ease-in-out 0.5s");
c = c.replace("draw-line 3.5s ease-in-out 0.8s", "draw-line 6s ease-in-out 1.5s");
c = c.replace("draw-line 4s ease-in-out 1.2s", "draw-line 7s ease-in-out 2.5s");
console.log('2. Draw speed: slower');

// 3. Remove ALL couple music / drop audio logic
// Remove dropRef
c = c.replace("const dropRef = useRef<HTMLAudioElement | null>(null)\n", '');
// Remove dropped state
c = c.replace("const [dropped, setDropped] = useState(false)\n", '');
// Remove isMusicVisible state
c = c.replace("const [isMusicVisible, setIsMusicVisible] = useState(false)\n", '');
// Remove musicSectionRef
c = c.replace("const musicSectionRef = useRef<HTMLDivElement>(null)\n", '');

// Remove the IntersectionObserver useEffect
c = c.replace(/\s*\/\/ Manual IntersectionObserver[\s\S]*?}, \[started\]\)\n/g, '');

// Remove the debug useEffect
c = c.replace(/\s*\/\/ DEBUG \+ CROSSFADE\s*useEffect\(\(\) => \{[\s\S]*?\}, \[previewUrl, isMusicVisible, dropped, started\]\)\n/g, '');

// Remove the crossfade useEffect  
c = c.replace(/\s*useEffect\(\(\) => \{\s*if \(!isMusicVisible[\s\S]*?\}, \[isMusicVisible, dropped, started, previewUrl\]\)\n/g, '');

// Remove ref={musicSectionRef} from tela 5
c = c.replace(' ref={musicSectionRef}', '');

// Remove dropRef from unlock
c = c.replace('const a = dropRef.current || bgRef.current', 'const a = bgRef.current');

// Remove previewUrl from props interface and destructuring
c = c.replace("previewUrl?: string | null\n  ", '');
c = c.replace(/, previewUrl,/g, ',');

// Remove wave-float keyframes
c = c.replace(/@keyframes wave-float-1\{[^}]+\}\s*/g, '');
c = c.replace(/@keyframes wave-float-2\{[^}]+\}\s*/g, '');
c = c.replace(/@keyframes wave-float-3\{[^}]+\}\s*/g, '');
c = c.replace(/@keyframes wave-drift\{[^}]+\}\s*/g, '');

// Clean up any console.log refs to audio
c = c.replace(/\s*console\.log\('\[Wrapped Audio\].*\n/g, '\n');
c = c.replace(/\s*console\.warn\('\[Wrapped Audio\].*\n/g, '\n');
c = c.replace(/\s*console\.error\('\[Wrapped Audio\].*\n/g, '\n');

console.log('3. Couple music removed');
console.log('dropRef:', c.includes('dropRef') ? 'STILL' : 'GONE');
console.log('isMusicVisible:', c.includes('isMusicVisible') ? 'STILL' : 'GONE');
console.log('previewUrl prop:', c.includes('previewUrl?') ? 'STILL' : 'GONE');

fs.writeFileSync('src/components/EternizarWrapped.tsx', c, 'utf8');
