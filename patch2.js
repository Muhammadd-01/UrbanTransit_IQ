const fs = require('fs');
let html = fs.readFileSync('frontend/public/landing/index.htm', 'utf8');

// Replace hardcoded dark theme with a script that checks localStorage
html = html.replace(
  '<html lang="en" data-theme="dark">',
  `<html lang="en" data-theme="light">`
);

// Add script to check localStorage right after <head>
html = html.replace(
  '<head>',
  `<head>
<script>
  try {
    const saved = localStorage.getItem('theme');
    // If not set, or set to light, use light. Only dark if explicitly dark.
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  } catch(e) {}
</script>`
);
fs.writeFileSync('frontend/public/landing/index.htm', html);
