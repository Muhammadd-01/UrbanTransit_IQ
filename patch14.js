const fs = require('fs');
let html = fs.readFileSync('frontend/public/landing/index.htm', 'utf8');

html = html.replace(
  '.cert-fallback-card{ border:1px solid var(--border); background:var(--panel); padding:10px; color:var(--text); text-align:left; }',
  '.cert-fallback-card{ border:1px solid var(--border); background:var(--panel) !important; backdrop-filter: blur(14px) saturate(160%); -webkit-backdrop-filter: blur(14px) saturate(160%); padding:10px; color:var(--text); text-align:left; }'
);

fs.writeFileSync('frontend/public/landing/index.htm', html);
