from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional
from app.services.goals_service import GoalsService

from .auth import get_current_user
from app.models.user import UserResponse
from app.database import db
from datetime import datetime

router = APIRouter(prefix="/goals", tags=["goals"])
goals_service = GoalsService()

async def get_user_stats(email: str):
    today = datetime.utcnow().strftime("%Y-%m-%d")
    stats = await db.db["daily_stats"].find_one({"user_email": email, "date": today})
    if not stats:
        stats = {
            "user_email": email,
            "date": today,
            "water_ml": 0,
            "steps": 0,
            "calories_burnt": 0,
            "food_log": []
        }
        await db.db["daily_stats"].insert_one(stats)
    return stats

class WaterUpdate(BaseModel):
    amount_ml: int

class StepUpdate(BaseModel):
    steps: int

class FoodLogRequest(BaseModel):
    description: str

@router.get("/stats")
async def get_daily_stats(current_user: UserResponse = Depends(get_current_user)):
    stats = await get_user_stats(current_user.email)
    if "_id" in stats: stats.pop("_id")
    return stats

@router.post("/update-water")
async def update_water(data: WaterUpdate, current_user: UserResponse = Depends(get_current_user)):
    today = datetime.utcnow().strftime("%Y-%m-%d")
    await get_user_stats(current_user.email)
    await db.db["daily_stats"].update_one(
        {"user_email": current_user.email, "date": today},
        {"$inc": {"water_ml": data.amount_ml}}
    )
    stats = await get_user_stats(current_user.email)
    return {"message": "Water intake updated", "current_total": stats["water_ml"]}

@router.post("/update-steps")
async def update_steps(data: StepUpdate, current_user: UserResponse = Depends(get_current_user)):
    today = datetime.utcnow().strftime("%Y-%m-%d")
    await get_user_stats(current_user.email)
    calories = goals_service.calculate_calories_burnt(data.steps)
    await db.db["daily_stats"].update_one(
        {"user_email": current_user.email, "date": today},
        {"$set": {"steps": data.steps, "calories_burnt": calories}}
    )
    return {"message": "Steps updated", "current_steps": data.steps, "calories_burnt": calories}

@router.post("/analyze-food")
async def analyze_food(data: FoodLogRequest, current_user: UserResponse = Depends(get_current_user)):
    today = datetime.utcnow().strftime("%Y-%m-%d")
    await get_user_stats(current_user.email)
    analysis_result = await goals_service.analyze_food(data.description)
    await db.db["daily_stats"].update_one(
        {"user_email": current_user.email, "date": today},
        {"$push": {"food_log": {
            "description": data.description,
            "analysis": analysis_result,
            "timestamp": datetime.utcnow()
        }}}
    )
    return analysis_result
