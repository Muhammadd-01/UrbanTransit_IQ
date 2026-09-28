import re

path = "frontend/public/landing/index.htm"
with open(path, "r", encoding="utf-8") as f:
    html = f.read()

# 1. Add Login and Register to orbital nav
nav_html = """
    <button class="orbital-node" data-target="lab" aria-label="Go to Pipeline section"><span class="num">05</span><span class="label">Pipeline</span><span class="dot"></span></button>
    <div style="height: 20px;"></div>
    <button class="orbital-node action-node" data-href="/login" aria-label="Go to Login"><span class="num"></span><span class="label">Login</span><span class="dot" style="border-color: #34C759;"></span></button>
    <button class="orbital-node action-node" data-href="/login?tab=register" aria-label="Go to Register"><span class="num"></span><span class="label">Register</span><span class="dot" style="border-color: #0A84FF;"></span></button>
"""
html = html.replace('<button class="orbital-node" data-target="lab" aria-label="Go to Pipeline section"><span class="num">05</span><span class="label">Pipeline</span><span class="dot"></span></button>', nav_html)

# 2. Patch orbital node click handler to support data-href
js_old = """document.querySelectorAll('.orbital-node').forEach(node => {
    node.addEventListener('click', () => {
      const t = document.getElementById(node.dataset.target);
      if(t) window.scrollTo({ top: t.offsetTop, behavior: 'smooth' });
    });
  });"""

js_new = """document.querySelectorAll('.orbital-node').forEach(node => {
    node.addEventListener('click', () => {
      if (node.hasAttribute('data-href')) {
        window.parent.location.href = node.getAttribute('data-href');
        return;
      }
      const t = document.getElementById(node.dataset.target);
      if(t) window.scrollTo({ top: t.offsetTop, behavior: 'smooth' });
    });
  });"""
html = html.replace(js_old, js_new)

# 3. Patch the image paths in the gallery
html = html.replace("assets/project-screens/certfi5.jpeg", "assets/project-screens/twincity-dashboard.png")
html = html.replace("assets/project-screens/certfi7.jpeg", "assets/project-screens/statix-dashboard.png")
html = html.replace("assets/project-screens/certfi8.jpeg", "assets/project-screens/automata-dfa.png")

with open(path, "w", encoding="utf-8") as f:
    f.write(html)
print("✅ Patched orbital nav and image paths!")
