with open("backend/app/api/dashboard.py", "r") as f:
    content = f.read()

content = content.replace("    if _KPI_CACHE is not None:\n        return _KPI_CACHE\n", "")

with open("backend/app/api/dashboard.py", "w") as f:
    f.write(content)
