import os
import re

# All backend Python files that reference .joblib
files_to_patch = [
    "backend/app/api/pipeline_execution.py",
    "backend/app/api/predictions.py",
    "backend/app/api/clustering.py",
    "backend/app/api/anomalies.py",
    "backend/app/api/forecasting.py",
    "backend/app/services/model_version_service.py",
]

for fpath in files_to_patch:
    if not os.path.exists(fpath):
        print(f"  ⚠️  Skipped (not found): {fpath}")
        continue
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    content = content.replace(".joblib", ".csv")
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  ✅ Patched: {fpath}")

# Also rename the existing .joblib files to .csv
model_dir = "backend/trained_models"
for fname in os.listdir(model_dir):
    if fname.endswith(".joblib"):
        old_path = os.path.join(model_dir, fname)
        new_path = os.path.join(model_dir, fname.replace(".joblib", ".csv"))
        os.rename(old_path, new_path)
        print(f"  📦 Renamed: {fname} → {fname.replace('.joblib', '.csv')}")

# Update .gitignore to use .csv instead of .joblib for trained_models
gitignore_path = ".gitignore"
with open(gitignore_path, "r", encoding="utf-8") as f:
    content = f.read()
content = content.replace("backend/trained_models/*.joblib", "backend/trained_models/*.csv")
with open(gitignore_path, "w", encoding="utf-8") as f:
    f.write(content)
print("  ✅ Updated .gitignore")

print("\n✅ All done! Extension changed from .joblib → .csv everywhere.")
