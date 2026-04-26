const fs = require('fs');
let c = fs.readFileSync('src/components/EternizarWrapped.tsx', 'utf8');

// ===== 1. FIX BROKEN CSS — remove orphan lines =====
c = c.replace(/\s*50%\{transform:translate\(60px,40px\) scale\(1\.15\)\}\}/g, '');
c = c.replace(/\s*50%\{transform:translate\(-50px,-30px\) scale\(1\.1\)\}\}/g, '');
console.log('1. Broken CSS cleaned');

// ===== 2. FIX SVG LINES — add strokeDashoffset="1000" =====
// Path 1
c = c.replace(
  `strokeDasharray="1000" style={{ animation: 'draw-line 3s ease-in-out 0.3s forwards' }}
            initial={{ opacity: 0 }} animate={{ opacity: 0.3 }}`,
  `strokeDasharray="1000" strokeDashoffset="1000"
            style={{ animation: 'draw-line 3s ease-in-out 0.3s forwards, wave-float-1 6s ease-in-out 3.5s infinite' }}
            initial={{ opacity: 0 }} animate={{ opacity: 0.3 }}`
);
// Path 2
c = c.replace(
  `strokeDasharray="1000" style={{ animation: 'draw-line 3.5s ease-in-out 0.8s forwards' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}`,
  `strokeDasharray="1000" strokeDashoffset="1000"
            style={{ animation: 'draw-line 3.5s ease-in-out 0.8s forwards, wave-float-2 7s ease-in-out 4.5s infinite' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}`
);
// Path 3
c = c.replace(
  `strokeDasharray="1000" style={{ animation: 'draw-line 4s ease-in-out 1.2s forwards' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}`,
  `strokeDasharray="1000" strokeDashoffset="1000"
            style={{ animation: 'draw-line 4s ease-in-out 1.2s forwards, wave-float-3 8s ease-in-out 5.5s infinite' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}`
);
console.log('2. strokeDashoffset + wave-float:', 
  c.includes('strokeDashoffset="1000"') ? 'OK' : 'FAIL');

// ===== 3. FIX AUDIO — replace useInView with manual IntersectionObserver =====
// Remove useInView import and usage
c = c.replace(
  "import { motion, useInView } from 'framer-motion'",
  "import { motion } from 'framer-motion'"
);
c = c.replace(
  "const isMusicVisible = useInView(musicSectionRef, { amount: 0.4 })",
  "const [isMusicVisible, setIsMusicVisible] = useState(false)"
);

// Add manual IntersectionObserver after body lock useEffect
const bodyLockEnd = c.indexOf("}, [removido])");
const insertPoint = c.indexOf('\n', bodyLockEnd) + 1;
const observerCode = `
  // Manual IntersectionObserver for music drop (more reliable with scroll-snap)
  useEffect(() => {
    if (!started || !musicSectionRef.current) return
    const el = musicSectionRef.current
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        console.log('[Wrapped Audio] Music section VISIBLE via IO')
        setIsMusicVisible(true)
        obs.disconnect()
      }
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [started])

`;
c = c.slice(0, insertPoint) + observerCode + c.slice(insertPoint);
console.log('3. Manual IntersectionObserver:', c.includes('IntersectionObserver') ? 'OK' : 'FAIL');

// ===== 4. Ensure wave-float keyframes exist =====
if (!c.includes('wave-float-1')) {
  c = c.replace(
    '@keyframes draw-line{from{stroke-dashoffset:1000}to{stroke-dashoffset:0}}',
    `@keyframes draw-line{from{stroke-dashoffset:1000}to{stroke-dashoffset:0}}
        @keyframes wave-float-1{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes wave-float-2{0%,100%{transform:translateY(0)}50%{transform:translateY(10px)}}
        @keyframes wave-float-3{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`
  );
}
console.log('4. Wave keyframes:', c.includes('wave-float-1') ? 'OK' : 'FAIL');

fs.writeFileSync('src/components/EternizarWrapped.tsx', c, 'utf8');
console.log('Done');
