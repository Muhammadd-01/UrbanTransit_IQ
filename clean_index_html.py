import re

path = "frontend/public/landing/index.htm"
with open(path, "r", encoding="utf-8") as f:
    html = f.read()

# 1. Clean up old text
replacements = {
    "C++, OpenGL, GLSL": "Spark, XGBoost, FastAPI",
    "INITIALIZING GRAPHICS LAB": "INITIALIZING AI PIPELINE",
    "Graphics technologies": "AI Technologies",
    "Interactive systems built with C++, OpenGL and GLSL — from a real-time digital-twin city renderer to state-machine visual tooling and from-scratch data charts.": "Interactive systems built with Apache Spark, XGBoost and FastAPI — from a real-time predictive transit engine to live anomaly detection and origin-destination matrices.",
    "edX Dual-Engine AI Pipeline course, alongside a personal graphics programming roadmap.": "UrbanTransit Intelligence command system deployment and architectural expansion plan.",
    "GRAPHICS PROGRAMMER<br>C++ · OPENGL · GLSL · RENDERING": "TRANSIT INTELLIGENCE<br>SPARK · XGBOOST · FASTAPI · POSTGRES",
    "{n:'C / C++', s:'done'},": "{n:'Data Engineering', s:'done'},",
    "PROJECT FILTER — ALL / GRAPHICS / RENDERING / C++ / SYSTEMS / TOOLS": "PROJECT FILTER — ALL / AI PIPELINE / ANALYTICS / DASHBOARD / DATABASE / INFRA",
    "C++": "PostgreSQL", # in the 3D sphere context
    "OpenGL Dual-Engine AI Pipeline": "Spark Dual-Engine AI Pipeline",
    "Graphics Learning Lab": "Data Intelligence Lab",
    "Focused on OpenGL rendering pipelines, buffers, shaders, transformations, and practical GPU programming concepts.": "Focused on big data processing pipelines, random forests, distributed execution, and practical machine learning concepts.",
    "C++ Programming Essentials": "Python FastAPI Essentials",
    "Programming Academy": "Backend Engineering Academy",
    "Covered modern C++ syntax, object-oriented programming, memory concepts, STL usage, and reusable software design.": "Covered modern ASGI frameworks, dependency injection, concurrent routing, and RESTful pipeline design.",
    "Real-Time Rendering Concepts": "Real-Time Telemetry Concepts",
    "Studied real-time rendering architecture, lighting, materials, optimization, frame timing, and GPU-oriented techniques.": "Studied real-time analytics architecture, data ingestion, live forecasting, and pipeline optimization.",
}

for old, new in replacements.items():
    html = html.replace(old, new)

# 2. Make body background transparent for the iframe (and set html transparent too)
# Replace CSS rules:
html = html.replace("body{", "body{background:transparent !important;")
html = html.replace("html[data-theme=\"dark\"]{", "html[data-theme=\"dark\"]{background:transparent !important;")
html = html.replace("html[data-theme=\"light\"]{", "html[data-theme=\"light\"]{background:transparent !important;")

# Also the .noise class which adds grain, we want to keep it but ensure it doesn't block background
html = html.replace(".noise{", ".noise{pointer-events:none;z-index:-1;")

# The old 3D canvas (tech-sphere) has a solid background color cleared in WebGL. 
# We need to make the THREE.WebGLRenderer alpha:true and setClearColor to transparent.
# But wait, it's easier to just change the background CSS of `#canvas`
html = html.replace("background:var(--bg);", "background:transparent;")
# In index.htm there's an inline script that does renderer.setClearColor(themeBg)
html = html.replace("renderer.setClearColor(themeBg);", "renderer.setClearColor(0x000000, 0);")
html = html.replace("antialias:true", "antialias:true, alpha:true")
html = html.replace("antialias: true", "antialias: true, alpha:true")

# 3. Add script to forward mouse events to parent window
mouse_forwarder = """
<script>
  window.addEventListener('pointermove', (e) => {
    if(window.parent) {
      window.parent.postMessage({
        type: 'IFRAME_POINTER_MOVE',
        clientX: e.clientX,
        clientY: e.clientY,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight
      }, '*');
    }
  });
  window.addEventListener('pointerleave', (e) => {
    if(window.parent) {
      window.parent.postMessage({ type: 'IFRAME_POINTER_LEAVE' }, '*');
    }
  });
  window.addEventListener('pointerdown', (e) => {
    if(window.parent) {
      window.parent.postMessage({
        type: 'IFRAME_POINTER_DOWN',
        clientX: e.clientX,
        clientY: e.clientY,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight
      }, '*');
    }
  });
</script>
</body>
"""
html = html.replace("</body>", mouse_forwarder)

# 4. Hide the top navbar
# <nav id="nav" class="nav" aria-label="Main navigation">
html = re.sub(r'(<nav id="nav".*?>)', r'\1\n<style>#nav { display: none !important; }</style>', html)

with open(path, "w", encoding="utf-8") as f:
    f.write(html)
print("✅ index.htm cleaned")
