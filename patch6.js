const fs = require('fs');
let css = fs.readFileSync('frontend/public/landing/assets/ui-overrides.css', 'utf8');

// Replace light mode card solid backgrounds with glassmorphism
css = css.replace(
  'background: var(--panel-2) !important;',
  `background: var(--panel) !important;
  backdrop-filter: blur(14px) saturate(160%) !important;
  -webkit-backdrop-filter: blur(14px) saturate(160%) !important;`
);

fs.writeFileSync('frontend/public/landing/assets/ui-overrides.css', css);
