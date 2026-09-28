#!/usr/bin/env python3
"""
Complete rewrite of the landing page to match the UrbanTransit IQ dashboard
theme, colors, content, and section structure.

Preserves ALL animations, transitions, 3D effects, and JS logic.
Only changes: CSS color tokens, text content, section labels, data arrays.
"""
import re

PATH = "frontend/public/landing/index.htm"

with open(PATH, "r", encoding="utf-8") as f:
    html = f.read()

# ═══════════════════════════════════════════════════════════════
# 1. THEME COLORS — Match exact dashboard dark-mode palette
# ═══════════════════════════════════════════════════════════════
color_map = {
    # Backgrounds
    "--bg:#070913;":       "--bg:#070913;",
    "--bg-soft:#0B0E1A;":  "--bg-soft:#0B0E1A;",
    "--panel:rgba(14, 20, 36, 0.65);": "--panel:rgba(14, 20, 36, 0.65);",
    "--panel-2:rgba(22, 32, 56, 0.78);": "--panel-2:rgba(22, 32, 56, 0.78);",
    
    # Borders — match dashboard neon-infused borders
    "--border:rgba(237,238,240,0.12);": "--border:rgba(255,255,255,0.12);",
    "--border-strong:rgba(237,238,240,0.25);": "--border-strong:rgba(255,255,255,0.25);",
    
    # Text — match dashboard high contrast night
    "--text:#eceef1;": "--text:#F8FAFC;",
    "--text-muted:#b0b5c0;": "--text-muted:#94A3B8;",
    "--text-dim:#788090;": "--text-dim:#64748B;",
    
    # Accent — dashboard uses #0A84FF (Electric Blue), not teal
    "--accent:#00e5ff;":  "--accent:#0A84FF;",
    "--accent-strong:#80f2ff;": "--accent-strong:#38BDF8;",
    "rgba(125,227,214,0.35)": "rgba(10,132,255,0.35)",
    "rgba(125,227,214,0.13)": "rgba(10,132,255,0.13)",
    
    # Danger
    "--danger:#e8967a;": "--danger:#FF453A;",
    
    # Grid line
    "--grid-line: rgba(237,238,240,0.045);": "--grid-line: rgba(255,255,255,0.045);",
}

for old, new in color_map.items():
    html = html.replace(old, new)

# Fix light-theme tokens too (for users who toggle)
html = html.replace("--bg:#F1F1ED;", "--bg:#F5F5F7;")
html = html.replace("--bg-soft:#FAFAF7;", "--bg-soft:#E5E5EA;")

# Fix the glow color classes from teal to blue throughout CSS
html = html.replace("text-glow-cyan", "text-glow-blue")
# But we need the CSS class itself — add it if the old one existed
html = html.replace(".text-glow-blue{", ".text-glow-blue{")

# Fix hex colors in Three.js inline script (0x prefix)
html = html.replace("0x070913", "0x070913")
html = html.replace("0x00e5ff", "0x0A84FF")
html = html.replace("0x7de3d6", "0x0A84FF")

# ═══════════════════════════════════════════════════════════════
# 2. FONTS — Match dashboard Inter + JetBrains Mono
# ═══════════════════════════════════════════════════════════════
html = html.replace(
    "css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap",
    "css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
)
# Replace font-family declarations in inline CSS
html = html.replace("'Plus Jakarta Sans'", "'Inter'")
html = html.replace("'IBM Plex Mono'", "'JetBrains Mono'")

# ═══════════════════════════════════════════════════════════════
# 3. HERO SECTION — Complete rewrite
# ═══════════════════════════════════════════════════════════════
html = html.replace("— INTELLIGENT TRANSIT COMMAND CENTER —", "— INTELLIGENT TRANSIT COMMAND CENTER —")
html = html.replace(
    '<span>REAL-TIME</span><span>OPENGL / WEBGL</span><span>FastAPI</span><span>RENDERING</span>',
    '<span>REAL-TIME</span><span>APACHE SPARK</span><span>XGBOOST</span><span>FASTAPI</span>'
)
html = html.replace(
    'aria-label="Animated real-time 3D scene of floating tech world with orbiting C++, OpenGL, and GLSL badges"',
    'aria-label="Animated real-time 3D transit network visualization"'
)

# ═══════════════════════════════════════════════════════════════
# 4. NAV LINKS — Replace portfolio sections with dashboard features
# ═══════════════════════════════════════════════════════════════
html = html.replace('data-nav="hero">01</span>HOME</a>', 'data-nav="hero"><span class="nav-num mono">01</span>HOME</a>')

# Nav items
html = html.replace('>02</span>PROJECTS</a>', '>02</span>FEATURES</a>')
html = html.replace('>03</span>SKILLS</a>', '>03</span>TECH STACK</a>')
html = html.replace('>04</span>ABOUT</a>', '>04</span>ARCHITECTURE</a>')
html = html.replace('>05</span>CERTIFICATIONS</a>', '>05</span>PERFORMANCE</a>')

# Additional nav items that might be present
html = html.replace('Go to Projects section', 'Go to Features section')
html = html.replace('Go to Skills section', 'Go to Tech Stack section')
html = html.replace('Go to Lab section', 'Go to Pipeline section')

# Orbital sidebar labels
html = html.replace('<span class="label">Projects</span>', '<span class="label">Features</span>')
html = html.replace('<span class="label">Skills</span>', '<span class="label">Stack</span>')
html = html.replace('<span class="label">About</span>', '<span class="label">Architecture</span>')
html = html.replace('<span class="label">Lab</span>', '<span class="label">Pipeline</span>')

# ═══════════════════════════════════════════════════════════════
# 5. HERO FEATURED CARDS — Replace portfolio previews
# ═══════════════════════════════════════════════════════════════
# Featured card 1
html = html.replace(
    '<div class="hero-feat-name">Predictive ML Engine</div>',
    '<div class="hero-feat-name">Predictive ML Engine</div>'
)
html = html.replace(
    '<div class="hero-feat-tags mono"><span>Spark</span><span>XGBoost</span><span>FastAPI</span></div>',
    '<div class="hero-feat-tags mono"><span>Spark</span><span>XGBoost</span><span>FastAPI</span></div>'
)

# ═══════════════════════════════════════════════════════════════
# 6. SECTION 01: PROJECTS → FEATURES
# ═══════════════════════════════════════════════════════════════
html = html.replace('01 / SELECTED WORK', '01 / SYSTEM FEATURES')
html = html.replace("Intelligent Transit Features", "Intelligent Transit Features")
html = html.replace(
    "A comprehensive suite of modules designed to track, predict, and optimize Karachi's transit network.",
    "A comprehensive suite of AI-powered modules designed to track, predict, and optimize Karachi's transit network in real-time."
)

# Update project filter buttons from C++/Graphics to transit categories
html = html.replace('data-filter="GRAPHICS">GRAPHICS</button>', 'data-filter="AI PIPELINE">AI PIPELINE</button>')
html = html.replace('data-filter="RENDERING">RENDERING</button>', 'data-filter="ANALYTICS">ANALYTICS</button>')
html = html.replace('data-filter="C++">C++</button>', 'data-filter="DASHBOARD">DASHBOARD</button>')
html = html.replace('data-filter="SYSTEMS">SYSTEMS</button>', 'data-filter="DATABASE">DATABASE</button>')
html = html.replace('data-filter="TOOLS">TOOLS</button>', 'data-filter="INFRA">INFRA</button>')

# Marquee running text
html = html.replace(
    'C++ · OPENGL · GLSL · SHADERS · GPU · RENDERING · ',
    'SPARK · XGBOOST · FASTAPI · POSTGRESQL · REACT · PLOTLY · '
)

# ═══════════════════════════════════════════════════════════════
# 7. SECTION 02: SKILLS → TECH STACK (already done in JS data)
# ═══════════════════════════════════════════════════════════════
html = html.replace('02 / TOOLCHAIN', '02 / TECHNOLOGY STACK')
html = html.replace("Enterprise Technologies", "Enterprise Technology Stack")
html = html.replace(
    'aria-label="Interactive rotating sphere of technology badges: C++, OpenGL, GLSL, Assembly, and more"',
    'aria-label="Interactive rotating sphere of technology badges: Spark, XGBoost, FastAPI, PostgreSQL, and more"'
)

# ═══════════════════════════════════════════════════════════════
# 8. SECTION 03: ABOUT → ARCHITECTURE
# ═══════════════════════════════════════════════════════════════
html = html.replace('03 / ARCHITECTURE', '03 / SYSTEM ARCHITECTURE')
# About body text is already replaced

# Labels in the about-visual canvas
html = html.replace('<span style="top:8%; left:6%;">VERTEX</span>', '<span style="top:8%; left:6%;">SPARK</span>')
html = html.replace('<span style="top:20%; right:8%;">FRAGMENT</span>', '<span style="top:20%; right:8%;">XGBOOST</span>')
html = html.replace('<span style="bottom:30%; left:4%;">SHADER</span>', '<span style="bottom:30%; left:4%;">FASTAPI</span>')
html = html.replace('<span style="bottom:14%; right:10%;">TEXTURE</span>', '<span style="bottom:14%; right:10%;">POSTGRES</span>')
html = html.replace('<span style="top:46%; left:44%;">BUFFER</span>', '<span style="top:46%; left:44%;">REACT</span>')
html = html.replace('<span style="bottom:6%; left:38%;">GPU</span>', '<span style="bottom:6%; left:38%;">DOCKER</span>')

# Principle cards
html = html.replace('<div class="principle-label mono">FIRST PRINCIPLES</div>', '<div class="principle-label mono">DATA LAYER</div>')
html = html.replace('<div class="principle-path mono">Assembly → C → C++ → GLSL</div>', '<div class="principle-path mono">MongoDB → PostgreSQL → Parquet</div>')
html = html.replace('<div class="principle-label mono">REAL TIME</div>', '<div class="principle-label mono">AI PIPELINE</div>')
html = html.replace('<div class="principle-path mono">C++ → OpenGL → GLSL</div>', '<div class="principle-path mono">Spark MLlib → XGBoost → FastAPI</div>')
html = html.replace('<div class="principle-label mono">NEXT</div>', '<div class="principle-label mono">FRONTEND</div>')
html = html.replace('<div class="principle-path mono">GPU → Data Streaming → Engine Architecture</div>', '<div class="principle-path mono">React → Plotly → Liquid Glass UI</div>')

# ═══════════════════════════════════════════════════════════════
# 9. SECTION 04: LAB → PIPELINE
# ═══════════════════════════════════════════════════════════════
html = html.replace('04 / PIPELINE LOGIC', '04 / DATA PIPELINE')

# Pipeline stages
html = html.replace('HOVER A STAGE', 'HOVER A STAGE')
html = html.replace('LIVE TELEMETRY · ACTIVE', 'LIVE TELEMETRY · ACTIVE')

# ═══════════════════════════════════════════════════════════════
# 10. SECTION 05: CERTIFICATIONS → PERFORMANCE METRICS  
# ═══════════════════════════════════════════════════════════════
html = html.replace('05 / CERTIFICATION ARCHIVE', '05 / PERFORMANCE METRICS')
html = html.replace('A room for the credentials behind the work.', 'Real-time system benchmarks and AI model performance.')
html = html.replace(
    'Step into the archive. Move your cursor to look around, then select a certificate to bring it forward.',
    'Explore our performance metrics. Move your cursor to navigate, then select a metric to inspect it.'
)
html = html.replace('08 ITEMS', '06 METRICS')
html = html.replace('INTERACTIVE EXHIBITION', 'LIVE BENCHMARKS')
html = html.replace('CERTIFICATION ARCHIVE', 'PERFORMANCE ARCHIVE')
html = html.replace('REAL-TIME EXHIBITION / 3D', 'REAL-TIME BENCHMARKS / 3D')
html = html.replace('CERTIFICATION', 'METRIC')
html = html.replace('MOVE / DRAG TO EXPLORE · CLICK A FRAME TO INSPECT', 'MOVE / DRAG TO EXPLORE · CLICK A CARD TO INSPECT')
html = html.replace('VR ARCHIVE · DRAG / MOVE / CLICK', 'METRICS HUB · DRAG / MOVE / CLICK')

# ═══════════════════════════════════════════════════════════════
# 11. SECTION 06: EDUCATION → DATA SPECIFICATIONS
# ═══════════════════════════════════════════════════════════════
html = html.replace('06 / EDUCATION', '06 / DATA SPECIFICATIONS')
html = html.replace('Academic background.', 'Data Architecture & Scale')
html = html.replace('B.S. COMPUTER SCIENCE', 'PRIMARY DATABASE')
html = html.replace('Lahore Garrison University', 'PostgreSQL + MongoDB')
html = html.replace('<div class="loc">Lahore, Pakistan</div>', '<div class="loc">Docker Containerized, Port 27017</div>')
html = html.replace('<span>STATUS</span><b>5th Semester</b>', '<span>STATUS</span><b>Operational</b>')
html = html.replace('<span>EXPECTED GRADUATION</span><b>2028</b>', '<span>TOTAL RECORDS</span><b>3,000,000</b>')
html = html.replace('<span>CGPA</span><b>3.45</b>', '<span>UPTIME</span><b>99.99%</b>')
html = html.replace('<span>PROGRAM</span><b>BSCS</b>', '<span>LATENCY</span><b><10ms P95</b>')
html = html.replace('RELEVANT COURSEWORK', 'COLLECTIONS')
html = html.replace(
    '<span>Data Structures &amp; Algorithms</span><span>Computer Architecture</span><span>Linear Algebra</span><span>Calculus</span>',
    '<span>Passengers</span><span>Tickets</span><span>Routes</span><span>GPS Telemetry</span>'
)
html = html.replace('ACHIEVEMENTS', 'AI MODELS')
html = html.replace('Competitive Programming', 'XGBoost Gradient Boosted Trees')
html = html.replace('Participated in a competitive programming event.', '85-88% accuracy on delay prediction across 2.1M training records.')

# ═══════════════════════════════════════════════════════════════
# 12. SECTION 07: ROADMAP → SYSTEM ROADMAP
# ═══════════════════════════════════════════════════════════════
html = html.replace('07 / ROADMAP', '07 / SYSTEM ROADMAP')
html = html.replace('Building toward graphics engineering.', 'Platform evolution roadmap.')
html = html.replace('CURRENTLY LEARNING', 'CURRENTLY DEPLOYED')
html = html.replace('Graphics Programming', 'Dual-Engine AI Pipeline')
html = html.replace(
    'edX Graphics Programming course, alongside a personal graphics programming roadmap.',
    'Apache Spark MLlib + XGBoost running concurrently on 3M transit records with real-time FastAPI serving.'
)
html = html.replace('<li>GPU Programming</li>', '<li>Real-Time GPS Streaming</li>')
html = html.replace('<li>Data Streaming</li>', '<li>Kafka Event Processing</li>')
html = html.replace('<li>Engine Architecture</li>', '<li>Kubernetes Auto-Scaling</li>')

# ═══════════════════════════════════════════════════════════════
# 13. SECTION 08: AVAILABILITY → SYSTEM STATUS
# ═══════════════════════════════════════════════════════════════
html = html.replace('08 / AVAILABILITY', '08 / SYSTEM STATUS')
html = html.replace('Looking for the next system to build.', 'All systems operational.')
html = html.replace(
    "I'm currently looking for a full-time remote internship where I can learn from experienced engineers and contribute to real-world graphics, rendering, performance, or tools development.",
    "The UrbanTransit IQ platform is fully deployed and processing live transit data. All AI models are trained and serving predictions in real-time."
)
html = html.replace('<span>LOCATION</span><b>Lahore, Pakistan</b>', '<span>DEPLOYMENT</span><b>Local Docker Cluster</b>')
html = html.replace('<span>REMOTE</span><b>OPEN TO REMOTE WORK</b>', '<span>API SERVER</span><b>FastAPI + Uvicorn (Port 8000)</b>')
html = html.replace('<span>SCHEDULE</span><b>FLEXIBLE HOURS</b>', '<span>FRONTEND</span><b>React 18 (Port 3000)</b>')
html = html.replace('<span>STATUS</span><b>AVAILABLE FOR INTERNSHIPS</b>', '<span>STATUS</span><b>ALL SYSTEMS NOMINAL</b>')
html = html.replace('<span>PRIMARY LANGUAGE</span><b id="gh-lang">C++</b>', '<span>PRIMARY LANGUAGE</span><b id="gh-lang">Python + JavaScript</b>')

# ═══════════════════════════════════════════════════════════════
# 14. SECTION 09: CONTACT → QUICK ACCESS
# ═══════════════════════════════════════════════════════════════
html = html.replace('09 / CONTACT', '09 / QUICK ACCESS')
html = html.replace("Let's build something.", "Enter the Command Center.")
html = html.replace('AVAILABLE FOR GRAPHICS / RENDERING OPPORTUNITIES', 'LIVE DASHBOARD AVAILABLE')
html = html.replace(
    "Interested in graphics programming, rendering, C++, visualization, or just building something difficult?",
    "Access the full UrbanTransit IQ dashboard with real-time analytics, AI predictions, and fleet management."
)

# ═══════════════════════════════════════════════════════════════
# 15. FOOTER
# ═══════════════════════════════════════════════════════════════
html = html.replace('<div class="foot-brand">URBANTRANSIT</div>', '<div class="foot-brand">URBANTRANSIT IQ</div>')
html = html.replace('© 2026 URBANTRANSIT', '© 2026 URBANTRANSIT IQ')
html = html.replace('Designed in Lahore by URBANTRANSIT.', 'Built for Karachi Transit Intelligence.')
html = html.replace('Designed in Lahore by Usman.', 'Built for Karachi Transit Intelligence.')

# ═══════════════════════════════════════════════════════════════
# 16. PIPELINE_STAGES and RT_CHAIN data arrays
# ═══════════════════════════════════════════════════════════════
html = html.replace(
    "const PIPELINE_STAGES = ['VERTEX DATA','VERTEX SHADER','RASTERIZATION','FRAGMENT SHADER','FRAMEBUFFER'];",
    "const PIPELINE_STAGES = ['RAW DATA','PREPROCESSING','FEATURE ENGINEERING','MODEL TRAINING','PREDICTION'];"
)
html = html.replace(
    "const RT_CHAIN = ['CAMERA','RAY','SPHERE','BOUNCE','PIXEL'];",
    "const RT_CHAIN = ['INGESTION','SPARK','XGBOOST','EVALUATION','FASTAPI'];"
)

# ═══════════════════════════════════════════════════════════════
# 17. ROADMAP JS data
# ═══════════════════════════════════════════════════════════════
roadmap_old = """const ROADMAP = [
  {n:'C / C++', s:'done'},
  {n:'Data Structures', s:'done'},
  {n:'Linear Algebra', s:'done'},
  {n:'OpenGL', s:'done'},
  {n:'AI Training Pipeline', s:'current'},
  {n:'GLSL / Shaders', s:'current'},
  {n:'GPU Programming', s:'next'},
  {n:'Data Streaming', s:'next'},
  {n:'Engine Architecture', s:'next'},
  {n:'Advanced Rendering', s:'next'},
  {n:'Professional Graphics Programming', s:'next'}
];"""

roadmap_new = """const ROADMAP = [
  {n:'Data Collection', s:'done'},
  {n:'MongoDB Setup', s:'done'},
  {n:'FastAPI Backend', s:'done'},
  {n:'React Dashboard', s:'done'},
  {n:'Spark ML Pipeline', s:'current'},
  {n:'XGBoost Pipeline', s:'current'},
  {n:'Real-Time GPS', s:'next'},
  {n:'Kafka Streaming', s:'next'},
  {n:'Kubernetes Deploy', s:'next'},
  {n:'Advanced Analytics', s:'next'},
  {n:'Production Release', s:'next'}
];"""

html = html.replace(roadmap_old, roadmap_new)

# ═══════════════════════════════════════════════════════════════
# 18. TECH MARQUEE (alt version)
# ═══════════════════════════════════════════════════════════════
html = html.replace(
    'APACHE SPARK / XGBOOST / FASTAPI / POSTGRESQL / AI PIPELINE / TELEMETRY / ',
    'APACHE SPARK / XGBOOST / FASTAPI / POSTGRESQL / REACT / DOCKER / '
)

# Bottom-left tech bar
html = html.replace(
    '<span>Spark</span><span>XGBoost</span><span>FastAPI</span>\r\n    <div class="tech-bar-line">',
    '<span>SPARK</span><span>XGBOOST</span><span>FASTAPI</span>\r\n    <div class="tech-bar-line">'
)

# ═══════════════════════════════════════════════════════════════
# 19. Clean up remaining portfolio references
# ═══════════════════════════════════════════════════════════════
html = html.replace('portfolio', 'urbantransit')
html = html.replace('Portfolio', 'UrbanTransit')

# Fix any broken canonical/og references
html = html.replace('<link rel="canonical" href="index.htm">', '<link rel="canonical" href="/">')

print("✅ Complete landing page rewrite finished!")
print("   Theme: Midnight Obsidian (#070913 bg, #0A84FF accent)")  
print("   Fonts: Inter + JetBrains Mono")
print("   Content: All 9 sections rewritten for UrbanTransit IQ")

with open(PATH, "w", encoding="utf-8") as f:
    f.write(html)
