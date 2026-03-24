from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class Reminder(BaseModel):
    id: Optional[str] = None
    user_email: str
    title: str
    time: datetime
    repeat: Optional[str] = "daily"
    active: bool = True

class ReminderCreate(BaseModel):
    title: str
    time: datetime
    repeat: Optional[str] = "daily"
