path = "frontend/public/landing/index.htm"
with open(path, "r", encoding="utf-8") as f:
    html = f.read()

# Make the vignette transparent
html = html.replace("background:linear-gradient(180deg, transparent 40%, var(--bg) 96%);", "background:transparent;")
# Make the loader transparent
html = html.replace("background:color-mix(in srgb, var(--bg) 72%, transparent);", "background:transparent;")

with open(path, "w", encoding="utf-8") as f:
    f.write(html)
