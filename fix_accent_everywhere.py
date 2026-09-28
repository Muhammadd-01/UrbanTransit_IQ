import os

# Fix tech-sphere.js colors
path_ts = "frontend/public/landing/assets/tech-sphere.js"
with open(path_ts, "r", encoding="utf-8") as f:
    content = f.read()
content = content.replace("0x0A84FF", "0x0A84FF")  # keep
content = content.replace("0x7de3d6", "0x0A84FF")
content = content.replace("0x00e5ff", "0x0A84FF")
content = content.replace("0xa6f0e6", "0x38BDF8")
with open(path_ts, "w", encoding="utf-8") as f:
    f.write(content)

# Fix terminal.js — update accent references
path_tm = "frontend/public/landing/assets/terminal.js"
with open(path_tm, "r", encoding="utf-8") as f:
    content = f.read()
content = content.replace("#7de3d6", "#0A84FF")
content = content.replace("#00e5ff", "#0A84FF")
content = content.replace("#a6f0e6", "#38BDF8")
# Also update any remaining portfolio text
content = content.replace("graphics programming", "transit intelligence")
content = content.replace("Graphics Programming", "Transit Intelligence")
content = content.replace("graphics", "transit analytics")
content = content.replace("rendering", "prediction")
content = content.replace("C++ and OpenGL", "Spark and XGBoost")
content = content.replace("graphics / rendering opportunities", "transit analytics opportunities")
with open(path_tm, "w", encoding="utf-8") as f:
    f.write(content)

# Fix experience.js if it exists
path_exp = "frontend/public/landing/assets/experience.js"
if os.path.exists(path_exp):
    with open(path_exp, "r", encoding="utf-8") as f:
        content = f.read()
    content = content.replace("#7de3d6", "#0A84FF")
    content = content.replace("#00e5ff", "#0A84FF")
    content = content.replace("0x7de3d6", "0x0A84FF")
    content = content.replace("0x00e5ff", "0x0A84FF")
    with open(path_exp, "w", encoding="utf-8") as f:
        f.write(content)

# Fix all CSS files in assets/
for fname in os.listdir("frontend/public/landing/assets/"):
    if fname.endswith(".css"):
        fpath = os.path.join("frontend/public/landing/assets/", fname)
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()
        content = content.replace("#7de3d6", "#0A84FF")
        content = content.replace("#00e5ff", "#0A84FF")
        content = content.replace("#a6f0e6", "#38BDF8")
        content = content.replace("rgb(125,227,214)", "rgb(10,132,255)")
        content = content.replace("rgba(125,227,214", "rgba(10,132,255")
        # Replace the font references in external CSS too
        content = content.replace("'Plus Jakarta Sans'", "'Inter'")
        content = content.replace("'IBM Plex Mono'", "'JetBrains Mono'")
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)

# Also fix inline CSS in index.htm for the glow
path_htm = "frontend/public/landing/index.htm"
with open(path_htm, "r", encoding="utf-8") as f:
    content = f.read()
# Make sure teal glow CSS class uses blue
content = content.replace("text-shadow:0 0 30px rgba(125,227,214,0.5)", "text-shadow:0 0 30px rgba(10,132,255,0.5)")
content = content.replace("text-shadow:0 0 20px rgba(125,227,214", "text-shadow:0 0 20px rgba(10,132,255")
content = content.replace("text-shadow: 0 0 30px rgba(125,227,214", "text-shadow: 0 0 30px rgba(10,132,255")
# Teal color references in inline CSS 
content = content.replace("#7de3d6", "#0A84FF")
content = content.replace("#a6f0e6", "#38BDF8")
content = content.replace("rgb(125, 227, 214)", "rgb(10, 132, 255)")
content = content.replace("rgb(125,227,214)", "rgb(10,132,255)")
content = content.replace("rgba(125, 227, 214", "rgba(10, 132, 255")
content = content.replace("rgba(125,227,214", "rgba(10,132,255")
with open(path_htm, "w", encoding="utf-8") as f:
    f.write(content)

print("✅ All accent colors fixed to #0A84FF (Electric Blue) across all files")
