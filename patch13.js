const fs = require('fs');
let css = fs.readFileSync('frontend/public/landing/assets/hero-featured.css', 'utf8');

// Replace dark mode solid background
css = css.replace(
  'background: var(--panel);',
  'background: var(--panel) !important;\n  backdrop-filter: blur(14px) saturate(160%);\n  -webkit-backdrop-filter: blur(14px) saturate(160%);'
);

// Replace light mode solid background
css = css.replace(
  'background: var(--panel-2);',
  'background: var(--panel) !important;\n  backdrop-filter: blur(14px) saturate(160%);\n  -webkit-backdrop-filter: blur(14px) saturate(160%);'
);

// Also let's check if hover shadow has teal color? 
// rgba(0, 240, 255, 0.2) is cyan/teal-ish. Let's make it match iOS Blue glow: rgba(0, 122, 255, 0.2)
css = css.replace(
  'rgba(0, 240, 255, 0.2)',
  'rgba(0, 122, 255, 0.2)'
);

fs.writeFileSync('frontend/public/landing/assets/hero-featured.css', css);
