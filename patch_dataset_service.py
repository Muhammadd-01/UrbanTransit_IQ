import re

with open("backend/app/services/dataset_service.py", "r") as f:
    content = f.read()

# Replace run_generator with a subprocess call to generate_exact_3m_mongo.py
replacement = """
    try:
        import subprocess
        logger.info(f"Triggering dynamic MongoDB data generation...")
        res = subprocess.run(["./venv/bin/python", "scripts/generate_exact_3m_mongo.py"], capture_output=True, text=True)
        if res.returncode != 0:
            raise Exception(res.stderr)
        status = "ready"
"""
content = re.sub(r"\s+try:\s+run_generator\(scale=scale\)\s+status = \"ready\"", replacement, content)

with open("backend/app/services/dataset_service.py", "w") as f:
    f.write(content)
