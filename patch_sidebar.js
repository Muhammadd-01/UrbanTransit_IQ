const fs = require('fs');
const file = '/Users/muhammadaffan/Coding/UrbanTransit_IQ/frontend/src/components/layout/Sidebar.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace labels in Sidebar.jsx
content = content.replace(/'OD Analysis'/g, "'Travel Patterns'");
content = content.replace(/"OD Analysis"/g, '"Travel Patterns"');
content = content.replace(/>OD Analysis</g, '>Travel Patterns<');

content = content.replace(/'Anomaly Detection'/g, "'Unusual Activity'");
content = content.replace(/"Anomaly Detection"/g, '"Unusual Activity"');
content = content.replace(/>Anomaly Detection</g, '>Unusual Activity<');

content = content.replace(/'Clustering'/g, "'Route Grouping'");
content = content.replace(/"Clustering"/g, '"Route Grouping"');
content = content.replace(/>Clustering</g, '>Route Grouping<');

content = content.replace(/'Vehicle Analytics'/g, "'Fleet Monitor'");
content = content.replace(/"Vehicle Analytics"/g, '"Fleet Monitor"');
content = content.replace(/>Vehicle Analytics</g, '>Fleet Monitor<');

fs.writeFileSync(file, content, 'utf8');
