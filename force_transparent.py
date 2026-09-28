path = "frontend/public/landing/index.htm"
with open(path, "r", encoding="utf-8") as f:
    html = f.read()

# Make sure html and body are definitively transparent in CSS
html = html.replace("body{background:transparent !important;", "html, body { background: transparent !important; }\\nbody{")
# Remove any accidental background:var(--bg); from body
html = html.replace("  background:var(--bg);", "  background: transparent !important;")

with open(path, "w", encoding="utf-8") as f:
    f.write(html)
print("✅ Forced transparent")
