import os

path = "frontend/public/landing/index.htm"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("0x08090b", "0x0a0c10")
content = content.replace("0x7de3d6", "0x00e5ff")
content = content.replace("0x14171d", "0x171b26")
# There's also colors in tech-sphere.js maybe?

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

path_ts = "frontend/public/landing/assets/tech-sphere.js"
with open(path_ts, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("0x08090b", "0x0a0c10")
content = content.replace("0x7de3d6", "0x00e5ff")
content = content.replace("0x14171d", "0x171b26")

with open(path_ts, "w", encoding="utf-8") as f:
    f.write(content)

