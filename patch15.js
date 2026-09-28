const fs = require('fs');
let html = fs.readFileSync('frontend/public/landing/index.htm', 'utf8');

// Replace contact section
html = html.replace(
  '<a href="mailto:contact@urbantransit.iq" class="contact-email" data-cursor="EMAIL">contact@urbantransit.iq</a>',
  '<a href="javascript:void(0)" onclick="window.parent.location.href=\'/login\'" class="contact-email" data-cursor="OPEN">Initialize.System()</a>'
);

html = html.replace(
  '<a href="mailto:contact@urbantransit.iq" class="btn btn-primary" data-cursor="OPEN">CONTACT US →</a>',
  '<button onclick="window.parent.location.href=\'/login\'" class="btn btn-primary" data-cursor="OPEN">LAUNCH DASHBOARD →</button>'
);

html = html.replace(
  '<a href="https://github.com/Muhammadd-01" target="_blank" rel="noopener noreferrer" class="btn btn-ghost" data-cursor="OPEN">GITHUB ↗</a>',
  '<a href="#architecture" class="btn btn-ghost" data-cursor="OPEN">VIEW ARCHITECTURE ↓</a>'
);

html = html.replace(
  '<a href="https://www.linkedin.com/in/urbantransit-osman-500480405" target="_blank" rel="noopener noreferrer" class="btn btn-ghost" data-cursor="OPEN">LINKEDIN ↗</a>',
  '<a href="#stack" class="btn btn-ghost" data-cursor="OPEN">TECH STACK ↓</a>'
);

html = html.replace(
  '<a href="#" download="" class="btn-cv mono" data-cursor="DOWNLOAD">DOWNLOAD PDF ↓</a>',
  '<a href="https://github.com/Muhammadd-01" target="_blank" rel="noopener noreferrer" class="btn-cv mono" data-cursor="OPEN">GITHUB REPO ↗</a>'
);

// Footer links
html = html.replace(
  '<a href="https://github.com/Muhammadd-01" target="_blank" rel="noopener noreferrer">GITHUB</a>\n        <a href="mailto:contact@urbantransit.iq">EMAIL</a>',
  '<a href="javascript:void(0)" onclick="window.parent.location.href=\'/login\'">DASHBOARD</a>\n        <a href="#pipeline">PIPELINE</a>\n        <a href="#architecture">ARCHITECTURE</a>\n        <a href="https://github.com/Muhammadd-01" target="_blank" rel="noopener noreferrer">GITHUB</a>'
);

// Footer text
html = html.replace(
  '<span>Built with curiosity. Rendered with code.</span>',
  '<span>Powered by Apache Spark, XGBoost & React.</span>'
);

fs.writeFileSync('frontend/public/landing/index.htm', html);
