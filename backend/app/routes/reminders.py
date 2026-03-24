from fastapi import APIRouter, HTTPException, Body, Depends
from app.models.reminder import Reminder, ReminderCreate
from app.database import db
from bson import ObjectId
from typing import List

router = APIRouter(prefix="/reminders", tags=["reminders"])

from .auth import get_current_user
from app.models.user import UserResponse

@router.post("/", response_model=Reminder)
async def create_reminder(reminder: ReminderCreate, current_user: UserResponse = Depends(get_current_user)):
    reminder_dict = reminder.dict()
    reminder_dict["user_email"] = current_user.email
    result = await db.db["reminders"].insert_one(reminder_dict)
    reminder_dict["id"] = str(result.inserted_id)
    return Reminder(**reminder_dict)

@router.get("/")
async def get_reminders(current_user: UserResponse = Depends(get_current_user)):
    reminders = []
    cursor = db.db["reminders"].find({"user_email": current_user.email})
    items = await cursor.to_list(length=100)
    for r in items:
        if "_id" in r:
            r["id"] = str(r.pop("_id"))
        reminders.append(r)
    return reminders

@router.delete("/{reminder_id}")
async def delete_reminder(reminder_id: str):
    result = await db.db["reminders"].delete_one({"_id": ObjectId(reminder_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return {"message": "Reminder deleted"}
