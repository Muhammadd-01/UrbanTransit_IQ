from pymongo import MongoClient

def count_data():
    client = MongoClient('mongodb://localhost:27017/')
    db = client['urbantransit_iq']
    print("Database: urbantransit_iq")
    total = 0
    for coll_name in db.list_collection_names():
        count = db[coll_name].count_documents({})
        print(f"Collection '{coll_name}': {count:,} documents")
        total += count
    print(f"Total documents: {total:,}")

if __name__ == '__main__':
    count_data()
