import os

path = "frontend/public/landing/index.htm"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("usmanjgraphics@gmail.com", "contact@urbantransit.iq")
content = content.replace("UsmanJ-Graphics", "Muhammadd-01") # Using actual GitHub ID from prompt context if possible, or UrbanTransitIQ
content = content.replace("usman — zsh — ~/portfolio", "root — bash — /var/log/urbantransit")
content = content.replace("usman@portfolio:~$", "root@urbantransit:~$")
content = content.replace("USMAN", "URBANTRANSIT")
content = content.replace("usman", "urbantransit")
content = content.replace("DOWNLOAD CV ↓", "DOWNLOAD PDF ↓")
content = content.replace("assets/Usman-Javed-CV.pdf", "#")
content = content.replace("EMAIL ME", "CONTACT US")
content = content.replace("02 / PROJECTS", "02 / FEATURES")
content = content.replace("05 / CERTIFICATIONS", "05 / PERFORMANCE")
content = content.replace("Curious about what happens underneath.", "Built for extreme scale and sub-second speed.")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
