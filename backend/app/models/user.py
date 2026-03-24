from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    age: Optional[int] = None
    gender: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    health_history: List[str] = [] # List of diseases/conditions
    medicines: List[str] = [] # List of current medicines
    reports: List[dict] = []
    predictions: List[dict] = []

class UserResponse(UserBase):
    id: str
    created_at: datetime
    health_history: List[str] = []
    medicines: List[str] = []

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
