import glob
import os

files = glob.glob("/Users/muhammadaffan/Coding/UrbanTransit_IQ/backend/app/analytics/*.py")
patch_str = """    with SessionLocal() as db:
        original_query = db.query
        db.query = lambda *args, **kwargs: apply_global_filters(original_query(*args, **kwargs), filters)"""

for file in files:
    if os.path.basename(file) in ("__init__.py", "db_filters.py"):
        continue
        
    with open(file, "r") as f:
        content = f.read()
        
    if "SessionLocal() as db:" in content and "apply_global_filters" not in content:
        # Inject import
        content = "from backend.app.analytics.db_filters import apply_global_filters\n" + content
        # Inject patch
        content = content.replace("    with SessionLocal() as db:", patch_str)
        
        with open(file, "w") as f:
            f.write(content)
        print(f"Patched {os.path.basename(file)}")
