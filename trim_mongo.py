from pymongo import MongoClient

def trim_collection(db, coll_name, keep_count):
    print(f"Trimming {coll_name} to {keep_count}...")
    total = db[coll_name].count_documents({})
    if total <= keep_count:
        return
    
    # Get the Nth document's _id
    nth_doc = db[coll_name].find().sort('_id', 1).skip(keep_count - 1).limit(1)
    try:
        nth_id = nth_doc[0]['_id']
        res = db[coll_name].delete_many({'_id': {'$gt': nth_id}})
        print(f"Deleted {res.deleted_count} from {coll_name}")
    except IndexError:
        pass

if __name__ == '__main__':
    client = MongoClient('mongodb://localhost:27017/')
    db = client['urbantransit_iq']
    
    db.gps_events.drop()
    print("Dropped gps_events")
    
    trim_collection(db, 'tickets', 1000000)
    trim_collection(db, 'passengers', 400000)
    trim_collection(db, 'trips', 95585)
    
    print("Done trimming.")
