import re

with open('README.md', 'r') as f:
    content = f.read()

landing_section = """
## 🌌 Interactive 3D Landing & Glassmorphism System

Before authenticating, users land on the **UrbanTransit IQ Command Center Gateway**—a fully interactive 3D WebGL experience featuring:
- **WebGL Particle Matrices**: A dynamic 3D background symbolizing the flow of millions of transit records.
- **iOS 27 Liquid Glassmorphism**: Complete dark mode and light mode synchronization using `backdrop-filter: blur(14px) saturate(160%)` for sleek, semi-transparent frosted glass UI components.
- **Performance Archive (3D Gallery)**: An interactive 3D WebGL raycasting gallery where users can drag, pan, and click floating dashboard screenshots directly inside a 3D canvas space.
- **Unified Theming System**: Seamless theme switching (Light Mode / Midnight Obsidian) that instantly propagates from the landing page down into the React dashboard via a dedicated `MessageChannel` bridge without page reloads.

"""

# Insert right before "## 🧭 The End-to-End Data Journey"
content = content.replace("## 🧭 The End-to-End Data Journey", landing_section + "## 🧭 The End-to-End Data Journey")

# Fix the routing table
content = content.replace("### 1. Executive Command Dashboard (`/`)", "### 2. Executive Command Dashboard (`/dashboard`)")
content = content.replace("### 2. User Authentication & Login (`/login`)", "### 3. User Authentication & Login (`/login`)")

# Add Landing Page to the walkthrough
walkthrough_injection = """
### 1. 3D WebGL Landing Experience (`/`)
The interactive gateway. Features a responsive 3D orbital scroll wheel, an interactive WebGL certificate/gallery matrix, and live theme toggling. Showcases the core platform architecture and routes users to the main dashboard initialization protocol.
"""
content = content.replace("## 🖥️ Screen-by-Screen Walkthrough\n", "## 🖥️ Screen-by-Screen Walkthrough\n" + walkthrough_injection)

# Adjust the counts in "All 18 Interactive Pages"
content = content.replace("## 🗺️ Information Architecture: All 18 Interactive Pages", "## 🗺️ Information Architecture: All 19 Interactive Pages")

with open('README.md', 'w') as f:
    f.write(content)

# Update MSG-Hunters README as well!
msg_readme_path = '/Users/muhammadaffan/Coding/MSG-Hunters/1- Source code/UrbanTransit_IQ/README.md'
with open(msg_readme_path, 'r') as f:
    msg_content = f.read()

msg_content = msg_content.replace("## 🧭 The End-to-End Data Journey", landing_section + "## 🧭 The End-to-End Data Journey")
msg_content = msg_content.replace("### 1. Executive Command Dashboard (`/`)", "### 2. Executive Command Dashboard (`/dashboard`)")
msg_content = msg_content.replace("### 2. User Authentication & Login (`/login`)", "### 3. User Authentication & Login (`/login`)")
msg_content = msg_content.replace("## 🖥️ Screen-by-Screen Walkthrough\n", "## 🖥️ Screen-by-Screen Walkthrough\n" + walkthrough_injection)
msg_content = msg_content.replace("## 🗺️ Information Architecture: All 18 Interactive Pages", "## 🗺️ Information Architecture: All 19 Interactive Pages")

with open(msg_readme_path, 'w') as f:
    f.write(msg_content)

# Also update MSG-Hunters/6- Readme.md/README.md
msg_readme_dir_path = '/Users/muhammadaffan/Coding/MSG-Hunters/6- Readme.md/README.md'
try:
    with open(msg_readme_dir_path, 'r') as f:
        msg_dir_content = f.read()
    
    msg_dir_content = msg_dir_content.replace("## 🧭 The End-to-End Data Journey", landing_section + "## 🧭 The End-to-End Data Journey")
    msg_dir_content = msg_dir_content.replace("### 1. Executive Command Dashboard (`/`)", "### 2. Executive Command Dashboard (`/dashboard`)")
    msg_dir_content = msg_dir_content.replace("### 2. User Authentication & Login (`/login`)", "### 3. User Authentication & Login (`/login`)")
    msg_dir_content = msg_dir_content.replace("## 🖥️ Screen-by-Screen Walkthrough\n", "## 🖥️ Screen-by-Screen Walkthrough\n" + walkthrough_injection)
    msg_dir_content = msg_dir_content.replace("## 🗺️ Information Architecture: All 18 Interactive Pages", "## 🗺️ Information Architecture: All 19 Interactive Pages")

    with open(msg_readme_dir_path, 'w') as f:
        f.write(msg_dir_content)
except FileNotFoundError:
    pass

