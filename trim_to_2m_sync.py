from pymongo import MongoClient

def trim_data():
    client = MongoClient('mongodb://localhost:27017/')
    db = client['urbantransit_iq']
    
    target = 2000000
    
    for c in db.list_collection_names():
        count = db[c].count_documents({})
        if count > target:
            excess = count - target
            print(f"[{c}] Current count: {count}. Trimming {excess} records...")
            
            cursor = db[c].find({}, {"_id": 1}).limit(excess)
            ids_to_delete = [doc["_id"] for doc in cursor]
            
            chunk_size = 100000
            deleted = 0
            for i in range(0, len(ids_to_delete), chunk_size):
                chunk = ids_to_delete[i:i + chunk_size]
                result = db[c].delete_many({"_id": {"$in": chunk}})
                deleted += result.deleted_count
                print(f"[{c}] Deleted chunk of {result.deleted_count} records. Total deleted: {deleted}/{excess}")
                
            print(f"[{c}] Final count: {db[c].count_documents({})}")
        else:
            print(f"[{c}] Count is {count}, no need to trim.")

trim_data()
