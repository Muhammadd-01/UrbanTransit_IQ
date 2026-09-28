const fs = require('fs');
let html = fs.readFileSync('frontend/public/landing/index.htm', 'utf8');

// Ensure html is transparent in both themes
html = html.replace(
  'html[data-theme="light"]{background:transparent !important;',
  'html { background: transparent !important; }\nhtml[data-theme="light"]{'
);

fs.writeFileSync('frontend/public/landing/index.htm', html);
