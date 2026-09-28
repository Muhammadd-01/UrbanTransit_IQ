with open("backend/app/api/pipeline_execution.py", "r") as f:
    content = f.read()

# Update the records_trained metric to reflect the 70% train split
content = content.replace('metrics["records_trained"] = len(df)', 'metrics["records_trained"] = len(X_train)')

with open("backend/app/api/pipeline_execution.py", "w") as f:
    f.write(content)
