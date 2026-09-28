const fs = require('fs');
let css = fs.readFileSync('frontend/public/landing/assets/ui-overrides.css', 'utf8');

css = css.replace(
  'background: var(--bg) !important;',
  'background: transparent !important;'
);

fs.writeFileSync('frontend/public/landing/assets/ui-overrides.css', css);
