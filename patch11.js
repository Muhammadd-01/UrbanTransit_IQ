const fs = require('fs');
let css = fs.readFileSync('frontend/public/landing/assets/terminal.css', 'utf8');

css = css.replace(/#cfe9e4/gi, '#e6f0ff');
css = css.replace(/#eafffb/gi, '#ffffff');
css = css.replace(/#9fb3ba/gi, '#94a3b8');

fs.writeFileSync('frontend/public/landing/assets/terminal.css', css);
