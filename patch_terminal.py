import os

path = "frontend/public/landing/assets/terminal.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("usman", "urbantransit")
content = content.replace("Usman, a Computer Science student focused on graphics programming and low-level\\nsystems. Interested in how things actually work: software rendering, VGA memory,\\nOpenGL pipelines, shaders, GPU programming, real-time visualization.\\n\\nGoal: grow into a professional graphics / rendering programmer.", "UrbanTransit IQ is a predictive machine learning pipeline.\\nCombining Apache Spark and XGBoost, it predicts transit bottlenecks\\nand passenger flows up to 30 minutes in advance.\\n\\nStatus: Systems Operational.")
content = content.replace("usmanjgraphics@gmail.com", "contact@urbantransit.iq")
content = content.replace("github.com/UsmanJ-Graphics", "github.com/Muhammadd-01/UrbanTransit_IQ")
content = content.replace("usman: currently deep in a rendering pipeline, send snacks.", "urbantransit: currently processing 3M records, send CPU cycles.")
content = content.replace("usman: ask me about OpenGL, I will not stop talking.", "urbantransit: ask me about Spark MLlib, I will not stop predicting.")
content = content.replace("usman: still faster than the compiler on a bad day.", "urbantransit: sub-10ms response time on FastAPI.")
content = content.replace("usman: rebuilding the wheel, but the wheel is a GPU now.", "urbantransit: XGBoost gradient boosting successfully deployed.")
content = content.replace("assets/Usman-Javed-CV.pdf", "#")
content = content.replace("USMAN", "URBANTRANSIT")
content = content.replace("Usman", "UrbanTransit")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
