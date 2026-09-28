const fs = require('fs');
let html = fs.readFileSync('frontend/public/landing/index.htm', 'utf8');

// Patch mobile cert-detail-panel background
html = html.replace(
  'background:rgba(2,6,10,.86);',
  'background: var(--panel) !important; backdrop-filter: blur(14px) saturate(160%); -webkit-backdrop-filter: blur(14px) saturate(160%);'
);

fs.writeFileSync('frontend/public/landing/index.htm', html);
