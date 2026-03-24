from typing import List, Dict
from datetime import datetime, timedelta
from app.database import db
import google.generativeai as genai
from app.config import settings

class DigitalTwinEngine:
    def __init__(self):
        self.model = None
        if settings.GEMINI_API_KEY:
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self.model = genai.GenerativeModel('gemini-2.5-flash')
            except Exception as e:
                print(f"Failed to initialize Gemini in TwinService: {e}")

    async def generate_twin_data(self, history: List[dict], symptoms: str) -> Dict:
        # Simple initial implementation
        risk_score = 0.2 # Base risk
        
        if "chest pain" in symptoms.lower():
            risk_score += 0.5
        if len(history) > 3:
            risk_score += 0.1
            
        risk_score = min(risk_score, 1.0)
        
        progression = [
            {"day": "Day 1", "risk": risk_score},
            {"day": "Day 3", "risk": max(0, risk_score - 0.1)},
            {"day": "Day 7", "risk": max(0, risk_score - 0.2)}
        ]
        
        # AI-powered insights
        ai_insights = "Maintain healthy habits and monitor symptoms."
        if self.model:
            try:
                prompt = f"Analyze these symptoms: {symptoms}. Provide 2-3 bullet points of predictive health insights for this patient. Keep it very short."
                resp = self.model.generate_content(prompt)
                ai_insights = resp.text.strip()
            except:
                pass

        return {
            "risk_score": round(risk_score, 2),
            "predicted_progression": progression,
            "status": "AI Analysis Complete",
            "ai_insights": ai_insights
        }

    async def get_risk_timeline(self) -> List[dict]:
        # Generate data for graph
        timeline = []
        base_time = datetime.now()
        for i in range(10):
            timeline.append({
                "time": (base_time + timedelta(days=i)).strftime("%Y-%m-%d"),
                "risk": round(0.1 + (i * 0.05 if i < 5 else 0.3 - (i-5)*0.02), 2)
            })
        return timeline

    async def record_vital(self, vital_type: str, value: str):
        # Record to MongoDB
        vital_data = {
            "type": vital_type,
            "value": value,
            "timestamp": datetime.now()
        }
        if db.db is not None:
            await db.db["vitals"].insert_one(vital_data)
            print(f"Recorded vital: {vital_type} = {value}")
        else:
            print(f"DB not connected, vital not recorded: {vital_type} = {value}")

twin_engine = DigitalTwinEngine()
