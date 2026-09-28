const fs = require('fs');
let css = fs.readFileSync('frontend/public/landing/assets/ui-overrides.css', 'utf8');

css = css.replace(/14,\s*143,\s*131/g, '0, 122, 255');
css = css.replace(/#0e8f83/gi, '#007AFF');
css = css.replace(/#0a6d64/gi, '#0056B3');
css = css.replace(/#086960/gi, '#004080');

fs.writeFileSync('frontend/public/landing/assets/ui-overrides.css', css);

let js = fs.readFileSync('frontend/public/landing/assets/tech-sphere.js', 'utf8');
js = js.replace(/#0e8f83/gi, '#007AFF');
js = js.replace(/#7de3d6/gi, '#38BDF8'); // Optional: change the dark mode glow if it's teal
fs.writeFileSync('frontend/public/landing/assets/tech-sphere.js', js);
