const fs = require('fs');
let html = fs.readFileSync('frontend/public/landing/index.htm', 'utf8');

// Replace light mode variables
html = html.replace(
  '--panel:#FAFAF7;',
  '--panel:rgba(255, 255, 255, 0.45);'
);
html = html.replace(
  '--panel-2:#FFFFFF;',
  '--panel-2:rgba(255, 255, 255, 0.65);'
);

// Replace dark mode variables
html = html.replace(
  '--panel:rgba(14, 20, 36, 0.65);',
  '--panel:rgba(20, 24, 26, 0.6);'
);
html = html.replace(
  '--panel-2:rgba(22, 32, 56, 0.78);',
  '--panel-2:rgba(28, 32, 38, 0.7);'
);

fs.writeFileSync('frontend/public/landing/index.htm', html);
