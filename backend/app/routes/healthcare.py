from fastapi import APIRouter, Query, Body
from app.services.healthcare_service import healthcare_service
from app.services.twin_service import twin_engine
from typing import List, Optional

router = APIRouter(tags=["healthcare & twin"])

@router.get("/recommend-doctors")
async def recommend_doctors(disease: str, location: str):
    return await healthcare_service.get_doctor_recommendations(disease, location)

@router.get("/schemes")
async def get_schemes():
    return await healthcare_service.get_schemes()

@router.post("/digital-twin")
async def digital_twin(
    history: List[dict] = Body(default=[]),
    symptoms: str = Body(..., embed=True)
):
    return await twin_engine.generate_twin_data(history, symptoms)

@router.get("/risk-timeline")
async def get_risk_timeline():
    return await twin_engine.get_risk_timeline()
