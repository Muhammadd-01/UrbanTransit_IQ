import os
import glob
import re

def replace_in_file(path):
    if not os.path.isfile(path):
        return
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Colors
    content = content.replace("--bg:#08090b;", "--bg:#0a0c10;")
    content = content.replace("--bg-soft:#101318;", "--bg-soft:#11141c;")
    content = content.replace("--panel:#101318;", "--panel:#11141c;")
    content = content.replace("--panel-2:#14171d;", "--panel-2:#171b26;")
    content = content.replace("--accent:#7de3d6;", "--accent:#00e5ff;")
    content = content.replace("--accent-strong:#a6f0e6;", "--accent-strong:#80f2ff;")
    
    # Text
    content = content.replace("Muhammad Usman Javed", "UrbanTransit IQ")
    content = content.replace("Muhammad<br>\n      <span class=\"text-glow-cyan\">Usman Javed</span>", "Urban<br>\n      <span class=\"text-glow-cyan\">Transit IQ</span>")
    content = content.replace("— GRAPHICS PROGRAMMER —", "— INTELLIGENT TRANSIT COMMAND CENTER —")
    content = content.replace("Computer Science student building real-time rendering systems from first principles.", "Dual-engine AI pipeline for Karachi Transit running Apache Spark and XGBoost concurrently.")
    content = content.replace("Computer Science student focused on graphics programming — C++, OpenGL, GLSL, and real-time rendering systems.", "Advanced predictive analytics and spatial routing dashboard for massive-scale transit networks.")
    content = content.replace("Explore My Work &nbsp;→", "Enter Live Dashboard &nbsp;→")
    content = content.replace('href="#work" class="btn btn-pill-cyan"', 'href="#" onclick="window.parent.location.href=\'/dashboard\'; return false;" class="btn btn-pill-cyan"')
    content = content.replace("TwinCity3D", "Predictive ML Engine")
    content = content.replace("Automata Solver + NLU", "Spatial Origin-Destination")
    content = content.replace("Statistical Data Tool", "FastAPI Microservices")
    content = content.replace("Graphics Programmer / C++ / Real-Time Rendering", "Intelligent Transit Command Center")
    content = content.replace("C++ / OPENGL / GLSL / RENDERING / SHADERS / GPU / SYSTEMS /", "APACHE SPARK / XGBOOST / FASTAPI / POSTGRESQL / AI PIPELINE / TELEMETRY /")
    content = content.replace("C++ &nbsp;/&nbsp; OpenGL &nbsp;/&nbsp; GLSL &nbsp;/&nbsp; Real-Time Rendering", "Apache Spark &nbsp;/&nbsp; XGBoost &nbsp;/&nbsp; FastAPI &nbsp;/&nbsp; Predictive ML")
    
    # Replace individual tags if they match exact words
    content = re.sub(r'<span>C\+\+</span>', '<span>Spark</span>', content)
    content = re.sub(r'<span>OpenGL</span>', '<span>XGBoost</span>', content)
    content = re.sub(r'<span>GLSL</span>', '<span>FastAPI</span>', content)
    content = re.sub(r'<span>ImGui</span>', '<span>Spatial</span>', content)
    content = re.sub(r'<span>NLU</span>', '<span>Postgres</span>', content)
    content = re.sub(r'<span>Data Viz</span>', '<span>Real-Time</span>', content)
    
    content = content.replace("Curious about what happens underneath.", "Built for extreme scale and sub-second speed.")
    content = content.replace("I'm Usman, a Computer Science student focused on graphics programming and low-level systems. I enjoy building things from first principles to understand how they actually work — from software rendering and VGA memory to modern OpenGL pipelines, shaders, GPU programming, and real-time visualization.", "Our foundation rests on a high-throughput PostgreSQL physical ledger, engineered to ingest and instantly serve 3M+ multi-modal passenger transit records simultaneously without missing a beat. A lightning-fast Python API gateway orchestrates all analytical queries, ensuring strict SLA response times.")
    content = content.replace("My current goal is to grow into a professional graphics / rendering programmer and eventually work on rendering systems, performance, tools, and graphics technology used in real-world applications.", "The system tracks complex zonal desire lines and identifies bottleneck corridors in real-time, allowing operators to instantly re-route fleet units and predict passenger surges 30 minutes in advance.")
    
    content = content.replace("03 / ABOUT", "03 / ARCHITECTURE")
    content = content.replace("04 / GRAPHICS LAB", "04 / DATA WAREHOUSE")
    content = content.replace("Where I experiment.", "Real-time AI Model Evaluation.")
    
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

for root, _, files in os.walk("frontend/public/landing"):
    for file in files:
        if file.endswith(".htm") or file.endswith(".css") or file.endswith(".js"):
            replace_in_file(os.path.join(root, file))

print("Landing page text and theme updated successfully.")
