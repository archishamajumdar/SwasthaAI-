from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.models.user import UserCreate, UserResponse, Token, UserInDB
from app.utils.auth import get_password_hash, verify_password, create_access_token
from app.database import db
from datetime import datetime, timedelta
from app.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    existing_user = await db.db["users"].find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user.dict()
    password = user_dict.pop("password")
    user_dict["hashed_password"] = get_password_hash(password)
    user_dict["created_at"] = datetime.utcnow()
    user_dict.setdefault("health_history", [])
    user_dict.setdefault("medicines", [])
    user_dict.setdefault("reports", [])
    user_dict.setdefault("predictions", [])
    
    result = await db.db["users"].insert_one(user_dict)
    user_dict["id"] = str(result.inserted_id)
    return UserResponse(**user_dict)

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.db["users"].find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        from jose import jwt, JWTError
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.db["users"].find_one({"email": email})
    if user is None:
        raise credentials_exception
    
    user["id"] = str(user.pop("_id"))
    user.setdefault("health_history", [])
    user.setdefault("medicines", [])
    return UserResponse(**user)

async def get_optional_current_user(token: str = Depends(oauth2_scheme_optional)):
    if not token:
        return None
    try:
        from jose import jwt, JWTError
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            return None
    except JWTError:
        return None
    
    user = await db.db["users"].find_one({"email": email})
    if not user:
        return None
    
    user["id"] = str(user.pop("_id"))
    user.setdefault("health_history", [])
    user.setdefault("medicines", [])
    return UserResponse(**user)

from pydantic import BaseModel
from typing import Dict, List, Optional

class ProfileUpdate(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    health_history: Optional[List[str]] = None

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user

@router.post("/update-profile")
async def update_profile(data: ProfileUpdate, current_user: UserResponse = Depends(get_current_user)):
    update_data = {}
    if data.age is not None:
        update_data["age"] = data.age
    if data.gender is not None:
        update_data["gender"] = data.gender
    if data.health_history is not None:
        update_data["health_history"] = data.health_history
        
    if update_data:
        await db.db["users"].update_one(
            {"email": current_user.email},
            {"$set": update_data}
        )
    return {"message": "Profile updated successfully"}
