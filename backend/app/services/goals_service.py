import google.generativeai as genai
from typing import Dict, List, Optional
import os
import json
from .symptom_service import SymptomAnalyzer

class GoalsService:
    def __init__(self):
        from app.config import settings
        gemini_key = settings.GEMINI_API_KEY
        if gemini_key:
            genai.configure(api_key=gemini_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
        else:
            self.model = None

    async def analyze_food(self, food_description: str) -> Dict:
        """Analyze food description using Gemini to get nutrition info and advice."""
        if not self.model:
            return {
                "food": food_description,
                "calories": 250,
                "macros": {"protein": "15g", "carbs": "30g", "fat": "8g"},
                "analysis": "Gemini API key not found. Showing simulated analysis.",
                "missing_nutrients": ["Fiber", "Vitamin C"],
                "recommendation": "Try adding some green leafy vegetables to your next meal."
            }

        prompt = f"""
        Analyze the following food description: '{food_description}'
        
        Provide:
        1. Estimated total calories (integer).
        2. Macros (protein, carbs, fat in grams).
        3. A brief analysis of the nutritional content.
        4. What nutrients are missing or could be improved (list).
        5. A specific recommendation for the next meal.
        
        Return ONLY a JSON object with these keys: 
        "calories", "macros" (dict), "analysis", "missing_nutrients" (list), "recommendation".
        """
        
        try:
            response = self.model.generate_content(prompt)
            json_str = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(json_str)
        except Exception as e:
            print(f"Food Analysis Error: {e}")
            return {
                "error": "Failed to analyze food",
                "calories": 0,
                "macros": {},
                "analysis": "Could not process request.",
                "missing_nutrients": [],
                "recommendation": "Please try again later."
            }

    def calculate_calories_burnt(self, steps: int) -> float:
        """Estimate calories burnt from steps (approx 0.04 calories per step)."""
        return round(steps * 0.04, 2)
