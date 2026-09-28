const fs = require('fs');
let html = fs.readFileSync('frontend/public/landing/index.htm', 'utf8');

// Patch CSS for the certificate gallery
html = html.replace(
  'background:#02060a;',
  'background: var(--panel) !important; backdrop-filter: blur(14px) saturate(160%); -webkit-backdrop-filter: blur(14px) saturate(160%);'
);

html = html.replace(
  'background: #03080d;',
  'background: var(--panel-2) !important; backdrop-filter: blur(14px) saturate(160%); -webkit-backdrop-filter: blur(14px) saturate(160%); border-left: 1px solid var(--border);'
);

// Remove the dark ::before pseudo-element from the gallery
html = html.replace(
  /linear-gradient\(180deg, rgba\(0,0,0,\.12\), transparent 22%, transparent 72%, rgba\(0,0,0,\.32\)\),\s*radial-gradient\(ellipse at center, transparent 38%, rgba\(0,0,0,\.48\) 100%\)/,
  'none'
);

// Patch the JavaScript to use dynamic fog and backgrounds
html = html.replace(
  'scene.fog = new THREE.FogExp2(0x02060a, 0.052);',
  `
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  scene.fog = new THREE.FogExp2(isLight ? 0xf5f5f7 : 0x02060a, 0.052);
  
  // Create an observer to watch for theme changes and update fog/materials if needed
  const observer = new MutationObserver(() => {
    const isLightNow = document.documentElement.getAttribute('data-theme') === 'light';
    scene.fog.color.setHex(isLightNow ? 0xf5f5f7 : 0x02060a);
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  `
);

// Add the theme toggle button to the orbital HUD
html = html.replace(
  '<button class="orbital-node action-node" data-href="/login?tab=register" aria-label="Go to Register"><span class="num"></span><span class="label">Register</span><span class="dot" style="border-color: #0A84FF;"></span></button>',
  `<button class="orbital-node action-node" data-href="/login?tab=register" aria-label="Go to Register"><span class="num"></span><span class="label">Register</span><span class="dot" style="border-color: #0A84FF;"></span></button>
    <button class="orbital-node action-node" onclick="
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      window.parent.postMessage({ type: 'TOGGLE_THEME', theme: next }, '*');
    " aria-label="Toggle Theme"><span class="num"></span><span class="label">Toggle Theme</span><span class="dot" style="border-color: #FF9500;"></span></button>`
);

fs.writeFileSync('frontend/public/landing/index.htm', html);
