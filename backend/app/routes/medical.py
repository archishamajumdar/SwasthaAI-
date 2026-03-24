from fastapi import APIRouter, File, UploadFile, Body, Depends
from app.services.symptom_service import symptom_analyzer, ai_assistant
from app.services.ocr_service import ocr_service
from typing import Optional

router = APIRouter(prefix="/medical", tags=["medical"])

from .auth import get_current_user, get_optional_current_user
from app.models.user import UserResponse
from app.database import db
from datetime import datetime

@router.post("/analyze-symptoms")
async def analyze_symptoms(
    symptoms: str = Body(..., embed=True),
    age: int = Body(..., embed=True),
    gender: str = Body(..., embed=True),
    history: str = Body("", embed=True),
    current_user: Optional[UserResponse] = Depends(get_optional_current_user)
):
    result = await symptom_analyzer.analyze(symptoms, age, gender)
    
    if current_user:
        # Save to user health history
        analysis_entry = {
            "symptoms": symptoms,
            "analysis": result.get("analysis", "No analysis available"),
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        }
        # Simplify result for display in profile if needed, or just store the main diagnosis
        diagnosis = result.get("digital_twin_status", {}).get("risk_level", "Unknown Prediction")
        
        await db.db["users"].update_one(
            {"email": current_user.email},
            {"$push": {"health_history": f"{diagnosis} ({datetime.utcnow().strftime('%Y-%m-%d')})"}}
        )
    
    return result

@router.post("/chat")
async def health_chat(message: str = Body(..., embed=True), current_user: Optional[UserResponse] = Depends(get_optional_current_user)):
    history_str = ""
    if current_user and current_user.health_history:
        history_str = ", ".join([str(h) for h in current_user.health_history])
    return {"response": await ai_assistant.get_response(message, history=history_str)}

@router.post("/analyze-prescription")
async def analyze_prescription(file: UploadFile = File(...)):
    from app.services.ocr_service import ocr_service
    with open("C:/Users/Archisha Majumdar/Downloads/b_swasthya ai twin/backend/runtime_ocr.log", "w") as f:
         f.write(f"Runtime ocr_service.model is None: {ocr_service.model is None}\n")
         from app.config import settings
         f.write(f"Runtime settings.GEMINI_API_KEY: '{settings.GEMINI_API_KEY}'\n")
    content = await file.read()
    return await ocr_service.extract_prescription(content)

@router.post("/analyze-report")
async def analyze_report(file: UploadFile = File(...)):
    content = await file.read()
    return await ocr_service.analyze_report(content)
