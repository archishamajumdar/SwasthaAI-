import asyncio
from app.database import db, connect_to_mongo

async def run():
    await connect_to_mongo()
    res = await db.db["users"].update_one(dict(), {"$set": dict()}, upsert=False) # Wait, update_one with empty won't delete.
    # To delete: JSONDatabase or Mongo?
    if db.use_json:
        data = db.db._load()
        data["users"] = []
        db.db._save(data)
    else:
        await db.db["users"].delete_many({})
    print("SUCCESS: Deleted all users accurately.")

asyncio.run(run())
