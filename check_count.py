from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
db = client['urbantransit_iq']
total = 0
for coll_name in db.list_collection_names():
    count = db[coll_name].estimated_document_count()
    if count > 0:
        print(f"Collection '{coll_name}': {count:,} documents")
    total += count
print(f"Total documents: {total:,}")
