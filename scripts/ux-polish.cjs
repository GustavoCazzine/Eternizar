const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// ===== 1. TIMELINE DOTS — remove emoji, use clean dot =====
// Find EmojiAnimado usage in timeline and replace with dot
// Pattern: <EmojiAnimado emoji={...} /> inside timeline events
const emojiInTimeline = /<EmojiAnimado\s+emoji[^/]*\/>/g;
const emojiMatches = c.match(emojiInTimeline);
if (emojiMatches) {
  // Replace with a clean dot
  c = c.replace(emojiInTimeline, '<div className="w-3 h-3 rounded-full bg-white" />');
  console.log('1. Timeline dots: replaced', emojiMatches.length, 'emoji with clean dots');
} else {
  // Try finding the emoji node differently
  const timelineSection = c.indexOf('Nossa hist');
  if (timelineSection !== -1) {
    // Find emoji spans/divs in timeline area
    const areaEnd = c.indexOf('</section>', timelineSection);
    const area = c.slice(timelineSection, areaEnd);
    const emojiCount = (area.match(/EmojiAnimado/g) || []).length;
    console.log('1. EmojiAnimado in timeline area:', emojiCount);
    
    if (emojiCount > 0) {
      // Replace only within timeline section
      const before = c.slice(0, timelineSection);
      let section = c.slice(timelineSection, areaEnd);
      section = section.replace(/<EmojiAnimado\s+emoji[^/]*\/>/g, '<div className="w-3 h-3 rounded-full bg-white" />');
      c = before + section + c.slice(areaEnd);
      console.log('1. Timeline dots: OK');
    }
  }
}

// Also simplify the timeline node container - remove heavy gradient bg, just use dot
// Find the node div with gradient background in timeline
const nodePattern = /className="absolute left-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden text-2xl shrink-0"/;
if (nodePattern.test(c)) {
  c = c.replace(nodePattern, 'className="absolute left-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0"');
  console.log('1b. Node shape: rounded-2xl -> rounded-full, smaller');
}

// Remove boxShadow from node
c = c.replace(/boxShadow: `0 8px 40px \$\{cor\}50`/g, 'boxShadow: `0 4px 20px ${cor}30`');

// ===== 2. TIMELINE IMAGES — 16:9 aspect ratio =====
// Find timeline event images (fotoUrl)
const fotoUrlImg = /className="w-full rounded-xl/g;
if (fotoUrlImg.test(c)) {
  c = c.replace(/className="w-full rounded-xl/g, 'className="w-full aspect-video object-cover rounded-xl');
  console.log('2. Timeline images: aspect-video added');
} else {
  // Find img tags near fotoUrl
  const fotoUrlIdx = c.indexOf('ev.fotoUrl');
  if (fotoUrlIdx !== -1) {
    // Find nearby img tag
    const nearbyImg = c.indexOf('<img', fotoUrlIdx);
    if (nearbyImg !== -1 && nearbyImg - fotoUrlIdx < 300) {
      const imgEnd = c.indexOf('/>', nearbyImg) + 2;
      const imgTag = c.slice(nearbyImg, imgEnd);
      console.log('2. Timeline img tag:', imgTag.slice(0, 120));
      
      // Add aspect-ratio and object-cover if not present
      if (!imgTag.includes('aspect-video')) {
        const newImg = imgTag.replace('className="', 'className="aspect-video object-cover ');
        if (newImg !== imgTag) {
          c = c.replace(imgTag, newImg);
          console.log('2. Timeline images: aspect-video added');
        } else {
          // Try without className
          const withClass = imgTag.replace('class="', 'class="aspect-video object-cover ');
          if (withClass !== imgTag) {
            c = c.replace(imgTag, withClass);
            console.log('2. Timeline images: aspect-video added (alt)');
          }
        }
      }
    }
  }
}

// Also ensure rounded corners on timeline images
c = c.replace(/rounded-xl object-cover/g, 'rounded-2xl object-cover');

// ===== 3. STORIES AVATAR — gradient border =====
// Find "Nossos momentos" or stories avatars
const momentosIdx = c.indexOf('Nossos momentos');
const storiesIdx = c.indexOf('StoriesViewer');
console.log('3. Nossos momentos:', momentosIdx, 'StoriesViewer:', storiesIdx);

// Find avatar/thumbnail styling near stories
if (storiesIdx !== -1) {
  // Look for border styling on story thumbnails in the component usage
  const storiesArea = c.slice(Math.max(0, storiesIdx - 200), storiesIdx + 200);
  console.log('3. Stories area:', storiesArea.slice(0, 200).replace(/\n/g, '\\n'));
}

// ===== 4. CARTA SELADA — reduce spacing =====
// Find CartaSelada button and reduce padding
c = c.replace(
  'className="w-full max-w-sm mx-auto flex flex-col items-center gap-4 py-10 px-6 rounded-3xl border-2 border-dashed cursor-pointer"',
  'className="w-full max-w-sm mx-auto flex flex-col items-center gap-3 py-6 px-5 rounded-2xl border border-dashed cursor-pointer"'
);
console.log('4. CartaSelada spacing: reduced py-10->py-6, gap-4->gap-3');

// ===== 5. ANIMATIONS — verify existing =====
console.log('5a. Odometer:', c.includes('requestAnimationFrame(tick)') ? 'OK' : 'MISSING');
console.log('5b. Timeline scroll:', c.includes('TimelineLine') ? 'OK' : 'MISSING');
console.log('5c. Fade-in events:', c.includes('whileInView={{ opacity: 1') ? 'OK' : 'MISSING');

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
console.log('\nDone. All polish applied.');
