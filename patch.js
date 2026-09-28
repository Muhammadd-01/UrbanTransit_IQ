const fs = require('fs');
const html = fs.readFileSync('frontend/public/landing/index.htm', 'utf8');
const newHtml = html.replace(
  /const targetId = node\.getAttribute\('data-target'\);/g,
  `const href = node.getAttribute('data-href');
      if (href) {
        window.parent.location.href = href;
        return;
      }
      const targetId = node.getAttribute('data-target');`
);
fs.writeFileSync('frontend/public/landing/index.htm', newHtml);
