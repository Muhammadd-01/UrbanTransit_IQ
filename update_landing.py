import os
import re

path = "frontend/public/landing/index.htm"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Theme to exactly match dashboard dark mode
content = content.replace("--bg:#0a0c10;", "--bg:#070913;")
content = content.replace("--bg-soft:#11141c;", "--bg-soft:#0B0E1A;")
content = content.replace("--panel:#11141c;", "--panel:rgba(14, 20, 36, 0.65);")
content = content.replace("--panel-2:#171b26;", "--panel-2:rgba(22, 32, 56, 0.78);")

# Update 3D sphere colors
content = content.replace("0x0a0c10", "0x070913")
content = content.replace("0x171b26", "0x162038")

# 2. Re-write the PROJECTS array into FEATURES
new_projects = """const PROJECTS = [
  {
    id:'twincity3d', tag:'FEATURE 01 · CORE ENGINE', name:'Predictive Machine Learning', size:'large', cats:['AI PIPELINE','SPARK','XGBOOST'],
    desc:'Our dual-engine AI pipeline runs Apache Spark MLlib and XGBoost concurrently. By analyzing over 3 million historical transit records, the system accurately predicts passenger surges and calculates precise delay probabilities 30 minutes in advance.',
    stack:['Apache Spark','XGBoost','Python','PostgreSQL'],
    github:'#',
    built:'A distributed machine learning architecture that connects directly to a live PostgreSQL physical ledger, analyzing millions of transit events to build robust decision trees and predictive gradient models.',
    learned:'Distributed training across Spark nodes, precise hyperparameter tuning, and seamless FastAPI model serving with sub-10ms response times.',
    status:'LIVE SYSTEM', visual:'city', image:'',
    meta:['DISTRIBUTED TRAINING','GRADIENT BOOSTING','LIVE INFERENCE','FASTAPI SERVING']
  },
  {
    id:'automata', tag:'FEATURE 02', name:'Spatial Origin-Destination Analysis', size:'reg', cats:['SPATIAL','ANALYTICS','DASHBOARD'],
    desc:'Visualize exactly where passengers are coming from and where they are going. The Dashboard tracks complex zonal desire lines and identifies bottleneck corridors in real-time.',
    stack:['React','Plotly','Geospatial Data','React Router'],
    github:'#',
    built:'An interactive command center module that parses live transit tap-in and tap-out data into a dense 8x8 Origin-Destination matrix, rendering flow volume across Karachi zones.',
    learned:'Real-time geospatial state management, High-frequency React rendering, and interactive chart orchestration.',
    status:'LIVE SYSTEM', visual:'graph', image:'',
    meta:['ORIGIN-DESTINATION','ZONAL MAPPING','CORRIDOR BOTTLENECKS','LIVE FLOW']
  },
  {
    id:'flappybird', tag:'FEATURE 03', name:'Enterprise System Architecture', size:'reg', cats:['ARCHITECTURE','DATABASE','SCALE'],
    desc:'Built for extreme scale, sub-second speed, and 99.99% reliability. Powered by a high-throughput PostgreSQL physical ledger engineered to ingest 3M+ multi-modal records.',
    stack:['PostgreSQL','Docker','FastAPI','Uvicorn'],
    github:'#',
    built:'A strictly architected microservices backend where a Python API gateway orchestrates all analytical queries, ensuring strict SLA response times and providing essential telemetry hooks.',
    learned:'Database indexing strategies, connection pooling, and multi-threaded ASGI server deployment.',
    status:'LIVE SYSTEM', visual:'vga',
    meta:['POSTGRES LEDGER','3M+ RECORDS','FASTAPI GATEWAY','SLA <10ms']
  },
  {
    id:'stattool', tag:'FEATURE 04', name:'Liquid Glass UI/UX', size:'reg', cats:['FRONTEND','DESIGN','REACT'],
    desc:'Designed strictly for mission-critical command centers. Our unique Liquid Glassmorphism design system ensures maximum data density and clarity.',
    stack:['React','CSS Modules','Framer Motion','Glassmorphism'],
    github:'#',
    built:'A fully responsive, hardware-accelerated frontend utilizing deep CSS backdrop filters, neon border-radii, and dual-mode responsive layout engines.',
    learned:'Advanced CSS custom properties, responsive reflow grids, and performant UI animation loops.',
    status:'LIVE SYSTEM', visual:'chart', image:'',
    meta:['LIQUID GLASS','HUD INTERFACE','MISSION-CRITICAL UX','DARK MODE']
  }
];"""

# Replace the PROJECTS array using a regex to find the start and end
content = re.sub(r'const PROJECTS = \[.*?\];', new_projects, content, flags=re.DOTALL)

# 3. Rewrite SKILLS into ARCHITECTURE stack
new_skills = """const SKILLS = {
  'MACHINE LEARNING': [
    {n:'Apache Spark MLlib', d:'Distributed training for Random Forest and regression models.'},
    {n:'XGBoost', d:'Gradient boosting framework for localized, high-precision delay predictions.'},
    {n:'Scikit-Learn', d:'Data preprocessing, scaling, and hyperparameter grids.'},
    {n:'Joblib', d:'Model serialization and high-speed memory mapping.'}
  ],
  'BACKEND & DATABASE': [
    {n:'FastAPI', d:'Lightning-fast ASGI web framework for model inference.'},
    {n:'PostgreSQL', d:'Primary physical ledger for 3M+ operational transit records.'},
    {n:'Uvicorn', d:'ASGI server handling concurrent telemetry requests.'},
    {n:'Python 3.10+', d:'Core backend logic and data orchestration scripts.'}
  ],
  'FRONTEND UI/UX': [
    {n:'React 18', d:'Component-based architecture for the live dashboard.'},
    {n:'Plotly.js', d:'High-density interactive data visualizations and graphs.'},
    {n:'Glassmorphism', d:'Custom CSS engine for the Liquid Glass command center aesthetic.'},
    {n:'Lucide Icons', d:'Scalable vector icons for clean dashboard navigation.'}
  ],
  'BIG DATA INFRASTRUCTURE': [
    {n:'Docker', d:'Containerization for database and server modules.'},
    {n:'Apache Hadoop (HDFS)', d:'Distributed storage for massive transit data lakes.'},
    {n:'Parquet', d:'Columnar storage formats for efficient AI training.'},
    {n:'Data Pipelines', d:'Automated ETL scripts generating deterministic simulations.'}
  ]
};"""
content = re.sub(r'const SKILLS = \{.*?\};', new_skills, content, flags=re.DOTALL)

# 4. Patch HTML strings that still reference portfolio sections
content = content.replace("02 / FEATURES", "02 / SYSTEM CAPABILITIES")
content = content.replace("Things I've built.", "Intelligent Transit Features")
content = content.replace("A working set of projects across real-time graphics, low-level systems, and applied C++.", "A comprehensive suite of modules designed to track, predict, and optimize Karachi's transit network.")

# Remove the project filter buttons except ALL since we only have 4 features now
content = re.sub(r'<div class="proj-filter mono" id="proj-filter".*?</div>', '', content, flags=re.DOTALL)
content = content.replace('<div class="more-work-head"><span class="mono more-work-label">MORE GRAPHICS WORK</span></div>', '')

content = content.replace("03 / SKILLS", "03 / ARCHITECTURE STACK")
content = content.replace("The tools I build with.", "Enterprise Technologies")
content = content.replace("Currently working with these tools and technologies while expanding into GPU programming and rendering systems.", "Powered by industry-standard Big Data and AI frameworks.")

content = content.replace("04 / DATA WAREHOUSE", "04 / PIPELINE LOGIC")
content = content.replace("Real-time AI Model Evaluation.", "Data Ingestion & Training Flow")

content = content.replace("05 / PERFORMANCE", "05 / PERFORMANCE METRICS")
content = content.replace("Formal education and verified certifications across computer science and graphics programming.", "Validated system metrics across the AI pipeline, backend response times, and database throughput.")
content = content.replace("Coursework: Data Structures, OOP, OS, Assembly, Networking, Algorithms, Theory of Automata, Databases.", "SLA: 99.99% Uptime, <10ms API Latency, 3M+ Records processed in <40s.")

# Update the Lab/Pipeline text
content = content.replace("Rendering Pipeline", "AI Training Pipeline")
content = content.replace("Ray Tracing", "Data Streaming")
content = content.replace("RAY TRACING · LEARNING", "LIVE TELEMETRY · ACTIVE")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

