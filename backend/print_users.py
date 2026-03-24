import asyncio
from app.database import db, connect_to_mongo

async def run():
    await connect_to_mongo()
    users = await db.db["users"].find({}).to_list(100)
    print(f"Total Users: {len(users)}")
    for u in users:
        print(f" - {u.get('email')}")

asyncio.run(run())
