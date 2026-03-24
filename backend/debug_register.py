import asyncio
from app.routes.auth import register
from app.models.user import UserCreate
from app.database import connect_to_mongo

async def run():
    await connect_to_mongo()
    data = UserCreate(
        email="debugging@test.com",
        password="test123password",
        full_name="Debug User",
        age=30,
        gender="Male"
    )
    try:
        res = await register(data)
        print(f"SUCCESS: {res}")
    except Exception as e:
        import traceback
        with open("C:/Users/Archisha Majumdar/Downloads/b_swasthya ai twin/backend/debug_error.txt", "w") as f:
            f.write(f"ERROR: {e}\n")
            traceback.print_exc(file=f)
        print("SUCCESS: Error written to debug_error.txt")

asyncio.run(run())
