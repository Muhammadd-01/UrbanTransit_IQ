from pymongo import MongoClient

def fix_data():
    client = MongoClient('mongodb://localhost:27017/')
    db = client['urbantransit_iq']
    
    print("Fixing morning peak (7 AM - 9 AM)...")
    db.passenger_counts.update_many(
        {"hour": {"$in": [7, 8, 9]}},
        [{"$set": {"boarding": {"$multiply": ["$boarding", 3.5]}}}]
    )
    
    print("Fixing evening peak (17 - 19)...")
    db.passenger_counts.update_many(
        {"hour": {"$in": [17, 18, 19]}},
        [{"$set": {"alighting": {"$multiply": ["$alighting", 3.5]}}}]
    )
    
    print("Fixing night time (22 - 4)...")
    db.passenger_counts.update_many(
        {"hour": {"$in": [22, 23, 0, 1, 2, 3, 4]}},
        [{"$set": {
            "boarding": {"$multiply": ["$boarding", 0.15]},
            "alighting": {"$multiply": ["$alighting", 0.15]}
        }}]
    )
    print("Data fixed successfully.")

if __name__ == '__main__':
    fix_data()
