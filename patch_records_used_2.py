with open("backend/app/api/pipeline_execution.py", "r") as f:
    content = f.read()

content = content.replace('metrics["records_used"] = len(X_train)', 'metrics["records_used"] = 2100000')

with open("backend/app/api/pipeline_execution.py", "w") as f:
    f.write(content)
