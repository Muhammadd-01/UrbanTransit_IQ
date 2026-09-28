import os

path = "frontend/public/landing/assets/tech-sphere.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "'C++', 'C', 'ASM', 'GLSL', 'GL 3.3', 'SHADER', 'IMGUI', 'VAO',\\n    'GPU', 'TEXTURE', 'GIT', 'CMAKE', 'VS', 'LINUX', 'DSA', 'LIN ALG', 'ARCH', 'CALC'",
    "'SPARK', 'XGBOOST', 'PYTHON', 'FASTAPI', 'MONGO', 'POSTGRES', 'REACT', 'NODE',\\n    'DOCKER', 'K8S', 'HDFS', 'MAPREDUCE', 'DATA', 'AI', 'ML', 'PREDICT', 'ZONAL', 'OD'"
)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
