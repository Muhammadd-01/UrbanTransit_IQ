const fs = require('fs');
let html = fs.readFileSync('frontend/public/landing/index.htm', 'utf8');

// Replace teal accent in light mode with blue accent
html = html.replace('--accent:#0e8f83;', '--accent:#007AFF;');
html = html.replace('--accent-strong:#0a6d64;', '--accent-strong:#0056B3;');
html = html.replace('--accent-dim:rgba(14,143,131,0.32);', '--accent-dim:rgba(0,122,255,0.32);');
html = html.replace('--accent-glow:rgba(14,143,131,0.12);', '--accent-glow:rgba(0,122,255,0.12);');

fs.writeFileSync('frontend/public/landing/index.htm', html);
