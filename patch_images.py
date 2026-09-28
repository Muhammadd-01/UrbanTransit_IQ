path = "frontend/public/landing/index.htm"
with open(path, "r", encoding="utf-8") as f:
    html = f.read()

# Replace all remaining missing images with the existing ones
html = html.replace("assets/project-screens/certfi.jpeg", "assets/project-screens/twincity-dashboard.png")
html = html.replace("assets/project-screens/certfi3.jpeg", "assets/project-screens/statix-dashboard.png")
html = html.replace("assets/project-screens/certfi4.jpeg", "assets/project-screens/automata-dfa.png")
html = html.replace("assets/project-screens/certfi6.jpeg", "assets/project-screens/twincity-dashboard.png")

with open(path, "w", encoding="utf-8") as f:
    f.write(html)
