import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def trim_data():
    client = AsyncIOMotorClient('mongodb://localhost:27017/')
    db = client['urbantransit']
    
    count = await db.passenger_counts.count_documents({})
    print(f"Current count: {count}")
    
    target = 2000000
    if count > target:
        excess = count - target
        print(f"Deleting {excess} records...")
        
        # We can find the object IDs of the first `excess` documents and delete them
        # Or simpler: use a bulk delete using the `_id` of documents to delete
        cursor = db.passenger_counts.find({}, {"_id": 1}).limit(excess)
        ids_to_delete = [doc["_id"] async for doc in cursor]
        
        result = await db.passenger_counts.delete_many({"_id": {"$in": ids_to_delete}})
        print(f"Deleted {result.deleted_count} records.")
        
    final_count = await db.passenger_counts.count_documents({})
    print(f"Final count: {final_count}")

asyncio.run(trim_data())
