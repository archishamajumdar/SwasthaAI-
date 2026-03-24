import json
import os
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

class JSONCollection:
    def __init__(self, db_path: str, collection_name: str):
        self.db_path = db_path
        self.name = collection_name

    def _load(self) -> Dict[str, List[Dict]]:
        if not os.path.exists(self.db_path):
            return {}
        try:
            with open(self.db_path, 'r') as f:
                return json.load(f)
        except:
            return {}

    def _save(self, data: Dict[str, List[Dict]]):
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        with open(self.db_path, 'w') as f:
            json.dump(data, f, indent=2, default=str)

    async def find_one(self, filter: Dict[str, Any]) -> Optional[Dict]:
        data = self._load()
        docs = data.get(self.name, [])
        for doc in docs:
            if all((str(doc.get(k)) == str(v) if k == "_id" else doc.get(k) == v) for k, v in filter.items()):
                return doc
        return None


    async def insert_one(self, document: Dict[str, Any]):
        data = self._load()
        if self.name not in data:
            data[self.name] = []
        if "_id" not in document:
            document["_id"] = str(uuid.uuid4())
        data[self.name].append(document)
        self._save(data)
        class InsertResult:
            def __init__(self, id): self.inserted_id = id
        return InsertResult(document["_id"])

    async def update_one(self, filter: Dict[str, Any], update: Dict[str, Any], upsert: bool = False):
        data = self._load()
        docs = data.get(self.name, [])
        found = False
        for doc in docs:
            if all((str(doc.get(k)) == str(v) if k == "_id" else doc.get(k) == v) for k, v in filter.items()):
                if "$set" in update:
                    doc.update(update["$set"])
                if "$inc" in update:
                    for k, v in update["$inc"].items():
                        doc[k] = doc.get(k, 0) + v
                if "$push" in update:
                    for k, v in update["$push"].items():
                        if k not in doc: doc[k] = []
                        doc[k].append(v)
                found = True
                break
        
        if not found and upsert:
            new_doc = filter.copy()
            if "$set" in update: new_doc.update(update["$set"])
            new_doc["_id"] = str(uuid.uuid4())
            docs.append(new_doc)
            data[self.name] = docs
            found = True
            
        if found:
            self._save(data)
        return found

    async def delete_one(self, filter: Dict[str, Any]):
        data = self._load()
        docs = data.get(self.name, [])
        new_docs = []
        deleted = False
        for doc in docs:
            if not deleted and all((str(doc.get(k)) == str(v) if k == "_id" else doc.get(k) == v) for k, v in filter.items()):
                deleted = True
                continue
            new_docs.append(doc)
        if deleted:
            data[self.name] = new_docs
            self._save(data)
        class DeleteResult:
            def __init__(self, count): self.deleted_count = count
        return DeleteResult(1 if deleted else 0)

    def find(self, filter: Dict[str, Any]):
        data = self._load()
        docs = data.get(self.name, [])
        results = [d for d in docs if all((str(d.get(k)) == str(v) if k == "_id" else d.get(k) == v) for k, v in filter.items())]
        class Cursor:
            def __init__(self, r): self.r = r
            async def to_list(self, length: int = None): return self.r
        return Cursor(results)

class JSONDatabase:
    def __init__(self, db_path: str):
        self.db_path = db_path
    def __getitem__(self, name: str):
        return JSONCollection(self.db_path, name)

class Database:
    client: Optional[AsyncIOMotorClient] = None
    db: Any = None
    use_json: bool = False

db = Database()

async def connect_to_mongo():
    try:
        # Try connecting to MongoDB with a short timeout
        db.client = AsyncIOMotorClient(settings.MONGO_URL, serverSelectionTimeoutMS=2000)
        # Verify connection by pinging
        await db.client.admin.command('ping')
        db.db = db.client[settings.DATABASE_NAME]
        db.use_json = False
        print("Connected to MongoDB successfully.")
    except Exception as e:
        print(f"MongoDB connection failed: {e}. Falling back to Local JSON Storage.")
        db.use_json = True
        db.db = JSONDatabase(os.path.join(os.getcwd(), "data", "local_db.json"))

async def close_mongo_connection():
    if db.client:
        db.client.close()
    print("Closed MongoDB connection")
