const fs = require('fs');
let html = fs.readFileSync('frontend/public/landing/index.htm', 'utf8');

// Patch cert-detail-panel
html = html.replace(
  'background:linear-gradient(135deg, rgba(7,15,25,.96), rgba(2,7,13,.985));',
  'background: var(--panel-2) !important; backdrop-filter: blur(14px) saturate(160%); -webkit-backdrop-filter: blur(14px) saturate(160%); border-left: 1px solid var(--border);'
);

fs.writeFileSync('frontend/public/landing/index.htm', html);
