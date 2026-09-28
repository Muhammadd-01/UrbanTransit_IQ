path = "frontend/public/landing/assets/tech-sphere.js"
with open(path, "r", encoding="utf-8") as f:
    js = f.read()

# Make the renderer background transparent
js = js.replace("renderer.setClearColor(themeBg, 1);", "renderer.setClearColor(0x000000, 0);")
js = js.replace("renderer.setClearColor(themeBg);", "renderer.setClearColor(0x000000, 0);")
js = js.replace("{ antialias: true }", "{ antialias: true, alpha: true }")

with open(path, "w", encoding="utf-8") as f:
    f.write(js)
print("✅ tech-sphere.js patched")
