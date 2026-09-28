const fs = require('fs');
let html = fs.readFileSync('frontend/public/landing/index.htm', 'utf8');

// Patch cert-detail-inner
html = html.replace(
  'background:linear-gradient(135deg, rgba(10,16,27,.72), rgba(4,7,13,.92));',
  'background: transparent;'
);

// Patch box-shadow of inner since panel already handles it
html = html.replace(
  'box-shadow:-30px 0 70px rgba(0,0,0,.4);',
  'box-shadow: none;'
);

fs.writeFileSync('frontend/public/landing/index.htm', html);
