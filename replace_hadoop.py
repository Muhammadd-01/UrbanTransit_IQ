import os
import glob

def replace_in_file(filepath):
    if not os.path.isfile(filepath): return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    replacements = {
        "HDFS Storage Fabric": "Data Lake Storage",
        "Apache Hadoop, HDFS Setup": "Distributed Data Setup",
        "Apache Spark Cluster Engine": "Distributed AI Cluster Engine",
        "Hadoop HDFS Storage Ledger": "Distributed Storage Ledger",
        "APACHE SPARK RESOURCE": "DISTRIBUTED AI RESOURCE",
        "HADOOP HDFS STORAGE": "DISTRIBUTED STORAGE",
        "APACHE SPARK /": "DISTRIBUTED AI /",
        "APACHE SPARK": "DISTRIBUTED AI ENGINE",
        "Apache Spark MLlib": "Distributed ML Engine",
        "Apache Spark": "Spark AI Engine",
        "Apache Hadoop (HDFS)": "Distributed Storage (Data Lake)",
        "HDFS REPOSITORY PATH": "DATA LAKE PATH",
        "HDFS upload synchronized to local Hadoop sandbox block layer": "Dataset upload synchronized to local storage block layer.",
        "HDFS": "Data Lake",
        "Hadoop": "Big Data"
    }

    content = content.replace("uploadToHDFS", "uploadToStorage")
    content = content.replace("handleUploadHDFS", "handleUploadStorage")
    
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

frontend_files = []
for ext in ['*.jsx', '*.js', '*.htm']:
    frontend_files.extend(glob.glob(f"frontend/src/**/*{ext}", recursive=True))
    frontend_files.extend(glob.glob(f"frontend/public/landing/**/*{ext}", recursive=True))

for file in frontend_files:
    replace_in_file(file)

print("Done replacing text in frontend files.")
