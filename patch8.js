const fs = require('fs');
let code = fs.readFileSync('frontend/src/utils/plotlyTheme.js', 'utf8');

code = code.replace(
  "color: '#0f172a'",
  "color: 'var(--color-text-primary)'"
).replace(
  "color: '#0f172a'",
  "color: 'var(--color-text-primary)'"
).replace(
  "color: '#64748b'",
  "color: 'var(--color-text-muted)'"
).replace(
  "color: '#64748b'",
  "color: 'var(--color-text-muted)'"
).replace(
  "color: '#64748b'",
  "color: 'var(--color-text-muted)'"
).replace(
  "bgcolor: 'rgba(255, 255, 255, 0.5)'",
  "bgcolor: 'transparent'"
).replace(
  "bgcolor: '#ffffff'",
  "bgcolor: 'var(--color-panel-elevated)'"
).replace(
  "bordercolor: 'rgba(0,0,0,0.1)'",
  "bordercolor: 'var(--color-border)'"
).replace(
  "gridcolor: 'rgba(0,0,0,0.06)'",
  "gridcolor: 'var(--color-border-subtle)'"
);

fs.writeFileSync('frontend/src/utils/plotlyTheme.js', code);
