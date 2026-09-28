with open("backend/app/api/pipeline_execution.py", "r") as f:
    content = f.read()

content = content.replace('metrics["records_used"] = len(df)', 'metrics["records_used"] = len(X_train)')

with open("backend/app/api/pipeline_execution.py", "w") as f:
    f.write(content)
