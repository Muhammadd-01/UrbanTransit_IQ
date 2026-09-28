const fs = require('fs');
let css = fs.readFileSync('frontend/public/landing/assets/ui-overrides.css', 'utf8');

css = css.replace(/125,\s*227,\s*214/g, '56, 189, 248');

fs.writeFileSync('frontend/public/landing/assets/ui-overrides.css', css);

let termCss = fs.readFileSync('frontend/public/landing/assets/terminal.css', 'utf8');
termCss = termCss.replace(/125,\s*227,\s*214/g, '56, 189, 248');
fs.writeFileSync('frontend/public/landing/assets/terminal.css', termCss);
